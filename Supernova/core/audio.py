"""
Audio & Speech Synthesis Engine for macOS
Handles macOS native `say` synthesizer, edge-tts, and audio feedback.
"""

import subprocess
import platform
import threading
import shutil
import re
import os
from typing import List, Optional

_CURRENT_SPEECH_PROC: Optional[subprocess.Popen] = None
_SPEECH_LOCK = threading.Lock()

def is_macos() -> bool:
    return platform.system() == "Darwin"

def get_available_macos_voices() -> List[str]:
    """Returns list of installed macOS voices."""
    if not is_macos():
        return ["Default"]
    try:
        res = subprocess.run(["say", "-v", "?"], capture_output=True, text=True, timeout=3)
        if res.returncode == 0:
            voices = []
            for line in res.stdout.strip().split("\n"):
                parts = line.split()
                if parts:
                    voices.append(parts[0])
            return voices
    except Exception:
        pass
    return ["Samantha", "Daniel", "Karen", "Alex", "Victoria", "Fred"]

def speak_macos(text: str, voice: str = "Samantha", rate: int = 190, block: bool = False) -> None:
    """Speaks text using macOS native `say` command with custom voice and rate."""
    global _CURRENT_SPEECH_PROC
    if not text:
        return
    
    # Strip markdown syntax for clean speech
    clean_text = re.sub(r"[*_`#~\[\]\(\)>]", "", text).strip()
    if not clean_text:
        return

    def _run_speak():
        global _CURRENT_SPEECH_PROC
        with _SPEECH_LOCK:
            stop_speech()
            if is_macos():
                try:
                    cmd = ["say", "-r", str(rate)]
                    if voice and voice != "Default":
                        cmd.extend(["-v", voice])
                    cmd.append(clean_text)
                    _CURRENT_SPEECH_PROC = subprocess.Popen(cmd)
                    _CURRENT_SPEECH_PROC.wait()
                except Exception as e:
                    print(f"[Audio] Error running say: {e}")
                finally:
                    _CURRENT_SPEECH_PROC = None

    if block:
        _run_speak()
    else:
        t = threading.Thread(target=_run_speak, daemon=True)
        t.start()

def stop_speech() -> None:
    """Stops current speech playback immediately."""
    global _CURRENT_SPEECH_PROC
    if _CURRENT_SPEECH_PROC:
        try:
            _CURRENT_SPEECH_PROC.terminate()
        except Exception:
            pass
        _CURRENT_SPEECH_PROC = None
    if is_macos():
        try:
            subprocess.run(["killall", "say"], capture_output=True, timeout=1)
        except Exception:
            pass
