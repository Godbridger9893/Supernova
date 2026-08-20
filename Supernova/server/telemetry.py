"""
macOS Telemetry Service
Collects real-time CPU, RAM, Network, Disk, and Battery metrics.
"""

import time
import psutil
import threading
from typing import Dict, Any

class SystemTelemetry:
    def __init__(self):
        self._last_net = psutil.net_io_counters()
        self._last_time = time.time()
        self._net_speed_mb = 0.0
        self._lock = threading.Lock()
        
    def get_metrics(self) -> Dict[str, Any]:
        with self._lock:
            now = time.time()
            dt = max(0.001, now - self._last_time)
            
            # Network speed calculation
            curr_net = psutil.net_io_counters()
            bytes_sent = curr_net.bytes_sent - self._last_net.bytes_sent
            bytes_recv = curr_net.bytes_recv - self._last_net.bytes_recv
            self._net_speed_mb = round((bytes_sent + bytes_recv) / (1024 * 1024 * dt), 2)
            self._last_net = curr_net
            self._last_time = now
            
            # CPU & Memory
            cpu_percent = psutil.cpu_percent(interval=None)
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage("/")
            
            battery_pct = -1
            battery_charging = False
            try:
                bat = psutil.sensors_battery()
                if bat:
                    battery_pct = int(bat.percent)
                    battery_charging = bool(bat.power_plugged)
            except Exception:
                pass
                
            return {
                "cpu": round(cpu_percent, 1),
                "ram": round(mem.percent, 1),
                "ram_used_gb": round(mem.used / (1024**3), 1),
                "ram_total_gb": round(mem.total / (1024**3), 1),
                "disk": round(disk.percent, 1),
                "net_mbps": self._net_speed_mb,
                "battery": battery_pct,
                "charging": battery_charging,
                "timestamp": int(time.time())
            }

telemetry_service = SystemTelemetry()
