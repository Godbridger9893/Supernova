"""
macOS Control Action Module
Handles opening macOS applications, system volume, media playback, dark mode, display locking, and system shortcuts.
"""

import subprocess
import platform
import shutil
import os
from pathlib import Path
from typing import Dict, Any, Optional

MAC_APP_ALIASES = {
    "chrome": "Google Chrome",
    "google chrome": "Google Chrome",
    "safari": "Safari",
    "firefox": "Firefox",
    "arc": "Arc",
    "brave": "Brave Browser",
    "edge": "Microsoft Edge",
    "spotify": "Spotify",
    "apple music": "Music",
    "music": "Music",
    "vscode": "Visual Studio Code",
    "code": "Visual Studio Code",
    "visual studio code": "Visual Studio Code",
    "cursor": "Cursor",
    "terminal": "Terminal",
    "iterm": "iTerm",
    "iterm2": "iTerm",
    "warp": "Warp",
    "finder": "Finder",
    "calculator": "Calculator",
    "calc": "Calculator",
    "notes": "Notes",
    "stickies": "Stickies",
    "reminders": "Reminders",
    "calendar": "Calendar",
    "mail": "Mail",
    "messages": "Messages",
    "imessage": "Messages",
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "discord": "Discord",
    "slack": "Slack",
    "zoom": "zoom.us",
    "photos": "Photos",
    "preview": "Preview",
    "settings": "System Settings",
    "system settings": "System Settings",
    "system preferences": "System Settings",
    "textedit": "TextEdit",
    "activity monitor": "Activity Monitor",
    "app store": "App Store",
    "keynote": "Keynote",
    "pages": "Pages",
    "numbers": "Numbers",
}

WEB_SHORTCUTS = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com",
    "github": "https://www.github.com",
    "reddit": "https://www.reddit.com",
    "netflix": "https://www.netflix.com",
    "chatgpt": "https://chatgpt.com",
    "gmail": "https://mail.google.com",
    "twitter": "https://x.com",
    "x": "https://x.com",
    "instagram": "https://www.instagram.com",
    "amazon": "https://www.amazon.com",
    "linkedin": "https://www.linkedin.com"
}

def is_macos() -> bool:
    return platform.system() == "Darwin"

def open_app(app_name: str) -> Dict[str, Any]:
    """Opens any application or common web service on macOS."""
    clean_name = app_name.strip().lower()
    
    # Check Web shortcut first (e.g. YouTube)
    if clean_name in WEB_SHORTCUTS:
        url = WEB_SHORTCUTS[clean_name]
        try:
            subprocess.Popen(["open", url])
            return {"status": "success", "message": f"Opening {clean_name.capitalize()} in your default browser, sir."}
        except Exception as e:
            return {"status": "error", "message": f"Failed to open {clean_name}: {str(e)}"}

    target_app = MAC_APP_ALIASES.get(clean_name, app_name.strip())
    
    if not is_macos():
        return {"status": "simulated", "message": f"Simulated opening {target_app} (non-macOS system)."}

    try:
        # Non-blocking launch for maximum speed
        subprocess.Popen(["open", "-a", target_app])
        return {"status": "success", "message": f"Opening {target_app} right away, sir."}
    except Exception:
        # Fallback: try opening with generic name
        try:
            subprocess.Popen(["open", "-a", app_name])
            return {"status": "success", "message": f"Opening {app_name} right away, sir."}
        except Exception as e:
            return {"status": "error", "message": f"Error launching '{app_name}': {str(e)}"}

def run_applescript(script: str) -> Optional[str]:
    if not is_macos():
        return None
    try:
        res = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=5)
        if res.returncode == 0:
            return res.stdout.strip()
        return None
    except Exception as e:
        print(f"[AppleScript] Error: {e}")
        return None

def set_volume(volume: int) -> Dict[str, Any]:
    """Sets system output volume between 0 and 100."""
    vol = max(0, min(100, int(volume)))
    if not is_macos():
        return {"status": "success", "message": f"Volume set to {vol}% (simulated)."}
    
    script = f"set volume output volume {vol}"
    run_applescript(script)
    return {"status": "success", "message": f"macOS system volume set to {vol}%."}

def get_volume() -> int:
    """Gets current macOS system volume."""
    if not is_macos():
        return 50
    res = run_applescript("output volume of (get volume settings)")
    try:
        return int(res) if res else 50
    except Exception:
        return 50

def mute_volume(mute: bool = True) -> Dict[str, Any]:
    if not is_macos():
        return {"status": "success", "message": "Mute state changed (simulated)."}
    state = "true" if mute else "false"
    run_applescript(f"set volume output muted {state}")
    return {"status": "success", "message": f"System {'muted' if mute else 'unmuted'}."}

def media_control(action: str) -> Dict[str, Any]:
    """Controls Spotify or Apple Music (play, pause, playpause, next, previous)."""
    action = action.lower().strip()
    if not is_macos():
        return {"status": "success", "message": f"Media action '{action}' executed (simulated)."}

    script = ""
    if action in ("playpause", "toggle", "play/pause"):
        script = """
        tell application "System Events"
            key code 16 using {command down, control down}
        end tell
        """
    elif action == "play":
        script = 'tell application "Spotify" to play'
    elif action == "pause":
        script = 'tell application "Spotify" to pause'
    elif action in ("next", "next track", "skip"):
        script = 'tell application "Spotify" to next track'
    elif action in ("previous", "prev", "previous track"):
        script = 'tell application "Spotify" to previous track'
    
    if script:
        run_applescript(script)
        return {"status": "success", "message": f"Media command '{action}' triggered."}
    return {"status": "error", "message": f"Unknown media command '{action}'."}

def toggle_dark_mode() -> Dict[str, Any]:
    if not is_macos():
        return {"status": "success", "message": "Toggled dark mode (simulated)."}
    script = """
    tell application "System Events"
        tell appearance preferences
            set dark mode to not dark mode
        end tell
    end tell
    """
    run_applescript(script)
    return {"status": "success", "message": "Toggled macOS dark mode."}

def lock_screen() -> Dict[str, Any]:
    if not is_macos():
        return {"status": "success", "message": "Screen locked (simulated)."}
    try:
        subprocess.run(["pmset", "displaysleepnow"], capture_output=True, timeout=3)
        return {"status": "success", "message": "Screen locked and display set to sleep."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def computer_settings(action: str, description: str = "", value: str = "") -> Dict[str, Any]:
    """Unified handler for computer settings tool call."""
    act = (action or "").lower().strip()
    desc = (description or "").lower()
    
    if "vol" in act or "vol" in desc or "sound" in desc:
        if "mute" in act or "mute" in desc:
            return mute_volume(True)
        if "unmute" in act or "unmute" in desc:
            return mute_volume(False)
        try:
            # Extract number from value or description
            digits = "".join(c for c in (value or description) if c.isdigit())
            v = int(digits) if digits else 50
            return set_volume(v)
        except Exception:
            return set_volume(50)

    if any(k in act or k in desc for k in ("dark mode", "light mode", "theme", "appearance")):
        return toggle_dark_mode()

    if any(k in act or k in desc for k in ("lock", "sleep", "screen off")):
        return lock_screen()

    if any(k in act or k in desc for k in ("play", "pause", "media", "music", "song", "track", "skip", "next", "previous")):
        m_act = "playpause"
        if "play" in act or "play" in desc: m_act = "play"
        if "pause" in act or "pause" in desc: m_act = "pause"
        if "next" in act or "skip" in desc or "next" in desc: m_act = "next"
        if "prev" in act or "prev" in desc: m_act = "previous"
        return media_control(m_act)

    return {"status": "success", "message": f"Action '{action}' processed."}
