"""
Memory Manager for SUPERNOVA
Maintains persistent user profile, remembered facts, and conversation history.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List

def _get_base_dir() -> Path:
    return Path(__file__).resolve().parent.parent

MEMORY_FILE = _get_base_dir() / "config" / "memory.json"

DEFAULT_MEMORY: Dict[str, Any] = {
    "user_name": "User",
    "preferences": {
        "preferred_browser": "Google Chrome",
        "work_directory": "~/Desktop",
        "city": "Cupertino"
    },
    "facts": [],
    "recent_tasks": []
}

def load_memory() -> Dict[str, Any]:
    if not MEMORY_FILE.exists():
        save_memory(DEFAULT_MEMORY)
        return DEFAULT_MEMORY.copy()
    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_MEMORY.copy()

def save_memory(data: Dict[str, Any]) -> None:
    try:
        MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"[Memory] Failed to save: {e}")

def add_fact(fact: str) -> None:
    mem = load_memory()
    if fact not in mem.get("facts", []):
        mem.setdefault("facts", []).append(fact)
        # Keep last 50 facts
        mem["facts"] = mem["facts"][-50:]
        save_memory(mem)

def add_task(task_title: str, status: str = "completed") -> None:
    mem = load_memory()
    mem.setdefault("recent_tasks", []).append({
        "title": task_title,
        "status": status
    })
    mem["recent_tasks"] = mem["recent_tasks"][-20:]
    save_memory(mem)

def format_memory_for_prompt() -> str:
    mem = load_memory()
    parts = []
    if mem.get("user_name"):
        parts.append(f"User: {mem['user_name']}")
    facts = mem.get("facts", [])
    if facts:
        parts.append("Remembered user facts:\n" + "\n".join(f"- {f}" for f in facts[-10:]))
    return "\n".join(parts)
