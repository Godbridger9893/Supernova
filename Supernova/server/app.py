"""
SUPERNOVA FastAPI Server & WebSocket Bridge
Provides WebSocket communication, REST endpoints, and static UI serving.
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

def _get_base_dir() -> Path:
    return Path(__file__).resolve().parent.parent

BASE_DIR = _get_base_dir()
CONFIG_DIR = BASE_DIR / "config"
WEB_DIR = BASE_DIR / "web"
API_KEYS_FILE = CONFIG_DIR / "api_keys.json"
SETTINGS_FILE = CONFIG_DIR / "settings.json"
TEMP_SCREENSHOT = CONFIG_DIR / "latest_screenshot.jpg"

from core.engine import BrahmaEngine, get_api_key, check_ollama_status
from core.audio import speak_macos, stop_speech, get_available_macos_voices
from server.telemetry import telemetry_service

app = FastAPI(title="Supernova macOS Assistant")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = BrahmaEngine()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Periodic telemetry background task
@app.on_event("startup")
async def start_background_tasks():
    async def telemetry_loop():
        while True:
            try:
                if manager.active_connections:
                    metrics = telemetry_service.get_metrics()
                    await manager.broadcast({
                        "type": "telemetry",
                        "data": metrics
                    })
            except Exception as e:
                pass
            await asyncio.sleep(1.5)
            
    asyncio.create_task(telemetry_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial greeting & state
        await websocket.send_json({
            "type": "system_ready",
            "assistant_name": "Supernova",
            "state": "IDLE"
        })
        
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")
            
            if msg_type == "user_message":
                text = data.get("text", "").strip()
                if not text:
                    continue
                
                # Broadcast THINKING state
                await manager.broadcast({"type": "state_change", "state": "THINKING"})
                
                # Callback to notify client of step updates
                async def notify_step(step_name: str, step_status: str):
                    await manager.broadcast({
                        "type": "tool_step",
                        "name": step_name,
                        "status": step_status
                    })

                # Process message
                result = await engine.process_user_message(text)
                
                reply_text = result.get("reply", "")
                tools_executed = result.get("tools_executed", [])
                task_steps = result.get("task_steps", [])

                # Broadcast SPEAKING state
                await manager.broadcast({"type": "state_change", "state": "SPEAKING"})
                
                # Send assistant response
                await manager.broadcast({
                    "type": "assistant_response",
                    "reply": reply_text,
                    "tools_executed": tools_executed,
                    "task_steps": task_steps
                })
                
                # Trigger macOS Native Voice if enabled
                with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                    settings = json.load(f)
                
                if settings.get("voice_enabled", True):
                    voice_name = settings.get("tts_voice", "Samantha")
                    rate = settings.get("tts_rate", 190)
                    speak_macos(reply_text, voice=voice_name, rate=rate)

            elif msg_type == "state_change":
                new_state = data.get("state", "IDLE")
                await manager.broadcast({"type": "state_change", "state": new_state})

            elif msg_type == "stop_speech":
                stop_speech()
                await manager.broadcast({"type": "state_change", "state": "IDLE"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)

# REST Endpoints
@app.get("/api/health")
async def health():
    return {"status": "online", "system": "macOS", "engine": "Supernova 3.0"}

@app.get("/api/telemetry")
async def get_telemetry():
    return telemetry_service.get_metrics()

@app.get("/api/voices")
async def get_voices():
    return {"voices": get_available_macos_voices()}

@app.get("/api/ollama/status")
async def get_ollama_status():
    settings = {}
    if SETTINGS_FILE.exists():
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            settings = json.load(f)
    ollama_url = settings.get("ollama_url", "http://127.0.0.1:11434")
    return check_ollama_status(ollama_url)

@app.get("/api/settings")
async def get_settings():
    settings = {}
    api_keys = {}
    if SETTINGS_FILE.exists():
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            settings = json.load(f)
    if API_KEYS_FILE.exists():
        with open(API_KEYS_FILE, "r", encoding="utf-8") as f:
            api_keys = json.load(f)
    return {"settings": settings, "api_keys": api_keys}

class SettingsUpdate(BaseModel):
    settings: Dict[str, Any]
    api_keys: Dict[str, Any]

@app.post("/api/settings")
async def save_settings(payload: SettingsUpdate):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(payload.settings, f, indent=4)
    with open(API_KEYS_FILE, "w", encoding="utf-8") as f:
        json.dump(payload.api_keys, f, indent=4)
    return {"status": "success", "message": "Settings saved successfully."}

@app.get("/api/vision/latest")
async def get_latest_vision():
    if TEMP_SCREENSHOT.exists():
        return FileResponse(str(TEMP_SCREENSHOT), media_type="image/jpeg")
    return JSONResponse(status_code=404, content={"message": "No screenshot available"})

# Mount static web files
app.mount("/", StaticFiles(directory=str(WEB_DIR), html=True), name="web")
