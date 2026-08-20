/**
 * macOS System Telemetry UI Manager
 */

class TelemetryManager {
  constructor() {
    this.cpuVal = document.getElementById('cpuValue');
    this.cpuBar = document.getElementById('cpuBar');
    this.ramVal = document.getElementById('ramValue');
    this.ramBar = document.getElementById('ramBar');
    this.netVal = document.getElementById('netValue');
    this.netBar = document.getElementById('netBar');
    this.batVal = document.getElementById('batValue');
    this.batBar = document.getElementById('batBar');
    this.batCard = document.getElementById('batteryCard');
  }

  update(data) {
    if (!data) return;

    // CPU
    if (this.cpuVal && data.cpu !== undefined) {
      this.cpuVal.textContent = `${data.cpu}%`;
      this.cpuBar.style.width = `${Math.min(100, data.cpu)}%`;
    }

    // RAM
    if (this.ramVal && data.ram !== undefined) {
      this.ramVal.textContent = `${data.ram}% (${data.ram_used_gb || 0}GB)`;
      this.ramBar.style.width = `${Math.min(100, data.ram)}%`;
    }

    // Network
    if (this.netVal && data.net_mbps !== undefined) {
      this.netVal.textContent = `${data.net_mbps} MB/s`;
      const netPct = Math.min(100, (data.net_mbps / 10.0) * 100);
      this.netBar.style.width = `${Math.max(5, netPct)}%`;
    }

    // Battery
    if (this.batVal && data.battery !== undefined) {
      if (data.battery < 0) {
        if (this.batCard) this.batCard.style.display = 'none';
      } else {
        if (this.batCard) this.batCard.style.display = 'block';
        const chargeIcon = data.charging ? " ⚡" : "";
        this.batVal.textContent = `${data.battery}%${chargeIcon}`;
        this.batBar.style.width = `${data.battery}%`;
      }
    }
  }
}

window.TelemetryManager = TelemetryManager;
