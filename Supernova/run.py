#!/usr/bin/env python3
"""
SUPERNOVA macOS Desktop Assistant - Main Entrypoint
Starts the backend server and launches the Cybernetic 3D Living Orb UI.
"""

import os
import sys
import subprocess
import time
import webbrowser
import uvicorn
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def main():
    print("=" * 65)
    print("  SUPERNOVA // MACOS DESKTOP AI CORE")
    print("  - 3D Living WebGL Particle Orb & Gyroscopic Rings")
    print("  - Real-time Audio Waveform Visualizer & STT/TTS")
    print("  - macOS Native Tools (Apps, Volume, Screen Vision, Office Builder)")
    print("=" * 65)
    
    port = 8765
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    
    print(f"\n[Core] Starting FastAPI server on {url}...")

    # Automatically open the HUD interface in default browser after 1 second
    def open_ui():
        time.sleep(1.2)
        print(f"[Core] Launching SUPERNOVA HUD in browser: {url}")
        webbrowser.open(url)

    import threading
    t = threading.Thread(target=open_ui, daemon=True)
    t.start()

    # Start uvicorn server
    uvicorn.run("server.app:app", host=host, port=port, log_level="info")

if __name__ == "__main__":
    main()
