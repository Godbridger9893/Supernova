"""
Screen & Vision Processor for macOS
Captures the live display or webcam and performs multimodal reasoning using Gemini 2.5 Flash.
"""

import subprocess
import os
import sys
import io
import json
import base64
from pathlib import Path
from typing import Dict, Any, Optional

try:
    from PIL import Image
    _PIL_AVAILABLE = True
except ImportError:
    _PIL_AVAILABLE = False

from google import genai
from google.genai import types

def _get_base_dir() -> Path:
    return Path(__file__).resolve().parent.parent

CONFIG_PATH = _get_base_dir() / "config" / "api_keys.json"
TEMP_SCREENSHOT_PATH = _get_base_dir() / "config" / "latest_screenshot.jpg"

def get_api_key() -> str:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("gemini_api_key", "")
        except Exception:
            pass
    return os.environ.get("GEMINI_API_KEY", "")

def capture_screen(max_dim: int = 1280, quality: int = 70) -> Optional[bytes]:
    """Captures macOS screen silently, compresses to JPEG, and returns raw bytes."""
    TEMP_PNG = _get_base_dir() / "config" / "temp_capture.png"
    TEMP_PNG.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # macOS native screencapture (-x = silent, no sound)
        res = subprocess.run(["screencapture", "-x", "-t", "png", str(TEMP_PNG)], capture_output=True, timeout=5)
        if res.returncode == 0 and TEMP_PNG.exists():
            if _PIL_AVAILABLE:
                with Image.open(TEMP_PNG) as img:
                    img = img.convert("RGB")
                    img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=quality)
                    jpeg_bytes = buf.getvalue()
                
                # Save latest for preview in HUD
                with open(TEMP_SCREENSHOT_PATH, "wb") as f:
                    f.write(jpeg_bytes)
                
                if TEMP_PNG.exists():
                    TEMP_PNG.unlink()
                return jpeg_bytes
            else:
                with open(TEMP_PNG, "rb") as f:
                    return f.read()
    except Exception as e:
        print(f"[ScreenProcessor] Capture failed: {e}")
    return None

def analyze_screen(prompt: str = "Describe what is on the screen and any important information.", angle: str = "screen") -> Dict[str, Any]:
    """Analyzes the current macOS screen using Gemini Vision."""
    api_key = get_api_key()
    if not api_key:
        return {
            "status": "error",
            "message": "Gemini API key is required for screen and vision analysis. Please set it in Settings."
        }

    img_bytes = capture_screen()
    if not img_bytes:
        return {
            "status": "error",
            "message": "Failed to capture macOS screen. Please verify Screen Recording permissions in macOS System Settings."
        }

    try:
        client = genai.Client(api_key=api_key)
        
        system_instruction = (
            "You are Supernova, an elite macOS AI visual intelligence system. "
            "Inspect the provided screen capture and answer the user's inquiry with precision, "
            "clarity, and brevity (2-4 sentences). Highlight key details, code errors, or text requested."
        )
        
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                f"{system_instruction}\n\nUser Question: {prompt}"
            ]
        )
        
        text_result = getattr(response, "text", "") or "No visual analysis text generated."
        return {
            "status": "success",
            "analysis": text_result.strip(),
            "has_image": True,
            "preview_url": "/api/vision/latest"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Vision analysis error: {str(e)}"
        }
