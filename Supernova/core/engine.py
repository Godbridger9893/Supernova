"""
SUPERNOVA Core AI Engine & Tool Dispatcher
Supports Ultra-Fast Fast-Path routing (sub-50ms), Gemini 2.5 Flash, local Ollama models, and OpenRouter.
"""

import json
import os
import re
import sys
import datetime
import traceback
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable

from google import genai
from google.genai import types

from core.prompt import get_system_prompt
from core.memory import load_memory, add_fact, add_task, format_memory_for_prompt
from core.audio import speak_macos

from actions.mac_control import open_app, computer_settings, set_volume, media_control
from actions.screen_processor import analyze_screen
from actions.web_search import web_search
from actions.weather_report import get_weather
from actions.youtube_tools import youtube_control
from actions.office_builder import create_presentation, create_spreadsheet, create_document

def _get_base_dir() -> Path:
    return Path(__file__).resolve().parent.parent

CONFIG_PATH = _get_base_dir() / "config" / "api_keys.json"
SETTINGS_PATH = _get_base_dir() / "config" / "settings.json"

def get_api_key() -> str:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("gemini_api_key", "")
        except Exception:
            pass
    return os.environ.get("GEMINI_API_KEY", "")

def get_openrouter_key() -> str:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("openrouter_api_key", "")
        except Exception:
            pass
    return os.environ.get("OPENROUTER_API_KEY", "")

def get_settings() -> Dict[str, Any]:
    if SETTINGS_PATH.exists():
        try:
            with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

# Gemini Function Tool Declarations
TOOL_DECLARATIONS = [
    {
        "name": "open_app",
        "description": (
            "Opens any application or web service on macOS (e.g. YouTube, Chrome, Safari, Spotify, Slack, "
            "Visual Studio Code, Terminal, Finder, Calculator, Notes, Music, GitHub, Netflix). "
            "Always call this tool when user asks to open, launch, or start an app or website."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "app_name": {
                    "type": "STRING",
                    "description": "Exact or common name of the macOS application or website."
                }
            },
            "required": ["app_name"]
        }
    },
    {
        "name": "computer_settings",
        "description": (
            "Controls macOS system settings: volume adjustment (0-100), mute/unmute, "
            "media playback (play, pause, next, previous track on Spotify/Apple Music), "
            "toggle dark mode, lock screen, or sleep display."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "action": {
                    "type": "STRING",
                    "description": "volume | mute | unmute | media_play | media_pause | media_next | dark_mode | lock_screen"
                },
                "description": {"type": "STRING", "description": "Natural language description"},
                "value": {"type": "STRING", "description": "Optional value (e.g. volume level '80')"}
            },
            "required": ["action"]
        }
    },
    {
        "name": "screen_process",
        "description": (
            "Captures and inspects the live macOS screen or webcam using multimodal vision intelligence. "
            "MUST be called whenever the user asks 'What is on my screen?', 'Check my screen', "
            "'Analyze this error', 'What do you see?', etc."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "text": {
                    "type": "STRING",
                    "description": "The specific question or instruction regarding what to inspect on the screen."
                },
                "angle": {
                    "type": "STRING",
                    "description": "'screen' (default) or 'camera'"
                }
            },
            "required": ["text"]
        }
    },
    {
        "name": "web_search",
        "description": (
            "Performs real-time web search for current news, facts, documentation, stock prices, or events. "
            "Call when user asks about current info or searches."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {
                    "type": "STRING",
                    "description": "Search query keywords."
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "weather_report",
        "description": "Retrieves live weather conditions and forecasts for any city.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "city": {
                    "type": "STRING",
                    "description": "City name (e.g. 'San Francisco', 'New York', 'London', 'Tokyo')."
                }
            },
            "required": ["city"]
        }
    },
    {
        "name": "youtube_control",
        "description": "Plays a specific video, song, or searches YouTube.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "action": {"type": "STRING", "description": "play | search"},
                "query": {"type": "STRING", "description": "Video title, song name, or search query"},
                "url": {"type": "STRING", "description": "Optional direct YouTube video URL"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "create_presentation",
        "description": "Generates a complete, professional PowerPoint presentation (.pptx) deck with custom styling, sections, and slide layouts.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "topic": {"type": "STRING", "description": "Topic or title of the presentation (e.g. 'Artificial Intelligence Trends 2026')"}
            },
            "required": ["topic"]
        }
    },
    {
        "name": "create_spreadsheet",
        "description": "Generates a styled Microsoft Excel spreadsheet (.xlsx) with tables, financial models, formulas, and formatted cells.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "Spreadsheet purpose or title (e.g. 'Monthly Expense Tracker')"}
            },
            "required": ["title"]
        }
    },
    {
        "name": "create_document",
        "description": "Generates a formatted Word document (.docx) or Markdown report.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "Document title"},
                "content": {"type": "STRING", "description": "Detailed document content/body"}
            },
            "required": ["title", "content"]
        }
    }
]

def check_ollama_status(base_url: str = "http://127.0.0.1:11434") -> Dict[str, Any]:
    """Checks if local Ollama server is running and returns available models."""
    url = base_url.rstrip("/")
    try:
        res = requests.get(f"{url}/api/tags", timeout=1.5)
        if res.status_code == 200:
            models = [m.get("name") for m in res.json().get("models", [])]
            return {"online": True, "models": models}
    except Exception:
        pass
    return {"online": False, "models": []}

class BrahmaEngine:
    def __init__(self):
        self.history: List[Dict[str, Any]] = []

    def execute_tool(self, name: str, args: Dict[str, Any], on_status: Optional[Callable[[str], None]] = None) -> Dict[str, Any]:
        """Dispatches tool execution to the appropriate action function."""
        if on_status:
            on_status(f"Executing {name}...")

        try:
            if name == "open_app":
                return open_app(args.get("app_name", ""))
            elif name == "computer_settings":
                return computer_settings(
                    action=args.get("action", ""),
                    description=args.get("description", ""),
                    value=args.get("value", "")
                )
            elif name == "screen_process":
                return analyze_screen(
                    prompt=args.get("text", "Describe what is on screen"),
                    angle=args.get("angle", "screen")
                )
            elif name == "web_search":
                return web_search(args.get("query", ""))
            elif name == "weather_report":
                return get_weather(args.get("city", "Cupertino"))
            elif name == "youtube_control":
                return youtube_control(
                    action=args.get("action", "play"),
                    query=args.get("query", ""),
                    url=args.get("url", "")
                )
            elif name == "create_presentation":
                return create_presentation(topic=args.get("topic", "Project Presentation"))
            elif name == "create_spreadsheet":
                return create_spreadsheet(title=args.get("title", "Financial Tracker"))
            elif name == "create_document":
                return create_document(
                    title=args.get("title", "Report"),
                    content=args.get("content", "")
                )
            else:
                return {"status": "error", "message": f"Unknown tool: {name}"}
        except Exception as e:
            return {"status": "error", "message": f"Tool '{name}' failed: {str(e)}"}

    def _build_task_steps(self, text: str) -> List[str]:
        t = (text or "").lower()
        if any(w in t for w in ("presentation", "ppt", "slide", "deck")):
            return ["Analyze topic & presentation requirements", "Build slide layouts & content structure", "Compile PowerPoint (.pptx) deck", "Open presentation on macOS"]
        if any(w in t for w in ("sheet", "excel", "table", "budget", "tracker")):
            return ["Parse spreadsheet data schema", "Format columns & apply formulas", "Build Excel (.xlsx) file", "Open spreadsheet on macOS"]
        if any(w in t for w in ("screen", "look at", "what is on", "error")):
            return ["Capture high-resolution macOS screen", "Process multimodal vision analysis", "Synthesize findings & explain to user"]
        if any(w in t for w in ("search", "who is", "what is", "news", "find")):
            return ["Formulate web search query", "Retrieve latest search snippets", "Synthesize comprehensive answer"]
        return ["Interpret user directive", "Execute actions on macOS", "Confirm completion"]

    def _try_instant_fast_path(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Instant local heuristic dispatcher (< 20ms latency) for direct commands:
        - Open app / website (e.g. YouTube, Spotify, Chrome, VS Code)
        - Volume / media control
        - Weather
        - System lock / sleep
        """
        low = text.lower().strip()
        low_clean = re.sub(r"^(please|hey\s+supernova|supernova|hey\s+jarvis|jarvis|can\s+you|could\s+you|would\s+you)\s+", "", low).strip()

        # 1. Open / Launch / Start / Go to (e.g. "open youtube", "open spotify", "launch chrome")
        m_open = re.match(r"^(open|launch|start|go\s+to)\s+(.+)$", low_clean)
        if m_open:
            target = m_open.group(2).strip().rstrip(".")
            res = open_app(target)
            msg = res.get("message", f"Opening {target} now, sir.")
            return {
                "reply": msg,
                "tools_executed": [{"tool": "open_app", "args": {"app_name": target}, "result": res}],
                "task_steps": [f"Identify application target '{target}'", f"Launch {target} on macOS", "Confirm execution"]
            }

        # 2. YouTube Play / Search
        m_yt = re.match(r"^(play|youtube|search\s+youtube\s+for)\s+(.+)$", low_clean)
        if m_yt:
            query = m_yt.group(2).strip().rstrip(".")
            res = youtube_control(action="play", query=query)
            return {
                "reply": f"Playing '{query}' on YouTube for you, sir.",
                "tools_executed": [{"tool": "youtube_control", "args": {"query": query}, "result": res}],
                "task_steps": [f"Search YouTube for '{query}'", "Open video stream", "Confirm playback"]
            }

        # 3. Volume / Mute
        if any(w in low_clean for w in ("volume", "mute", "unmute", "sound")):
            m_vol = re.search(r"(\d+)", low_clean)
            if "mute" in low_clean and "unmute" not in low_clean:
                res = computer_settings("mute")
                return {
                    "reply": "System audio muted, sir.",
                    "tools_executed": [{"tool": "computer_settings", "result": res}],
                    "task_steps": ["Adjust macOS audio matrix", "Confirm mute state"]
                }
            elif "unmute" in low_clean:
                res = computer_settings("unmute")
                return {
                    "reply": "System audio unmuted, sir.",
                    "tools_executed": [{"tool": "computer_settings", "result": res}],
                    "task_steps": ["Adjust macOS audio matrix", "Confirm unmute state"]
                }
            elif m_vol:
                vol_val = int(m_vol.group(1))
                res = set_volume(vol_val)
                return {
                    "reply": f"Volume adjusted to {vol_val}%, sir.",
                    "tools_executed": [{"tool": "computer_settings", "args": {"value": str(vol_val)}, "result": res}],
                    "task_steps": [f"Set system output volume to {vol_val}%", "Confirm volume level"]
                }

        # 4. Media Playback (Play / Pause / Next Track)
        if low_clean in ("pause", "pause music", "stop music", "resume", "resume music", "next song", "next track", "skip song"):
            if "pause" in low_clean or "stop" in low_clean:
                res = computer_settings("media_pause")
                return {"reply": "Playback paused, sir.", "tools_executed": [{"tool": "computer_settings", "result": res}], "task_steps": ["Send media pause signal"]}
            elif "next" in low_clean or "skip" in low_clean:
                res = computer_settings("media_next")
                return {"reply": "Skipping to the next track, sir.", "tools_executed": [{"tool": "computer_settings", "result": res}], "task_steps": ["Send media next signal"]}
            else:
                res = computer_settings("media_play")
                return {"reply": "Resuming playback, sir.", "tools_executed": [{"tool": "computer_settings", "result": res}], "task_steps": ["Send media play signal"]}

        # 5. Lock Screen / Sleep
        if "lock screen" in low_clean or "lock mac" in low_clean:
            res = computer_settings("lock_screen")
            return {"reply": "Locking workstation now, sir.", "tools_executed": [{"tool": "computer_settings", "result": res}], "task_steps": ["Execute screen lock sequence"]}

        # 6. Current Time / Date
        if low_clean in ("what time is it", "time", "current time", "what is the time"):
            now_str = datetime.datetime.now().strftime("%I:%M %p")
            return {"reply": f"It is currently {now_str}, sir.", "tools_executed": [], "task_steps": ["Read system clock", "Format time"]}

        return None

    def _process_with_ollama(self, text: str, model_name: str, base_url: str, on_step_update: Optional[Callable[[str, str], None]] = None) -> Dict[str, Any]:
        """Runs inference via local Ollama instance."""
        task_steps = self._build_task_steps(text)
        tool_results_list = []
        
        # Check instant fast-path first
        fast_res = self._try_instant_fast_path(text)
        if fast_res:
            return fast_res

        # Query local Ollama chat API
        try:
            system_prompt = f"{get_system_prompt()}\n\n{format_memory_for_prompt()}"
            url = f"{base_url.rstrip('/')}/api/chat"
            payload = {
                "model": model_name or "llama3.2",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                "stream": False
            }
            res = requests.post(url, json=payload, timeout=25)
            if res.status_code == 200:
                out = res.json()
                reply_text = out.get("message", {}).get("content", "").strip()
                add_task(text, "completed")
                return {
                    "reply": reply_text or "Directive fulfilled, sir.",
                    "tools_executed": tool_results_list,
                    "task_steps": task_steps
                }
            else:
                return {
                    "reply": f"Ollama returned status {res.status_code}: {res.text}",
                    "tools_executed": tool_results_list,
                    "task_steps": task_steps
                }
        except Exception as e:
            return {
                "reply": f"Could not connect to local Ollama at {base_url}. Make sure Ollama is running (`ollama serve`). Error: {str(e)}",
                "tools_executed": tool_results_list,
                "task_steps": task_steps
            }

    async def process_user_message(self, text: str, on_step_update: Optional[Callable[[str, str], None]] = None) -> Dict[str, Any]:
        """Main processing pipeline for user input with sub-second execution."""
        settings = get_settings()
        ai_provider = settings.get("ai_provider", "gemini").lower()
        
        # 1. Check instant local fast-path (< 20ms response time!)
        fast_path = self._try_instant_fast_path(text)
        if fast_path:
            add_task(text, "completed")
            return fast_path

        # 2. If provider is set to Ollama, route to local Ollama
        if ai_provider == "ollama":
            ollama_url = settings.get("ollama_url", "http://127.0.0.1:11434")
            ollama_model = settings.get("ollama_model", "llama3.2")
            return self._process_with_ollama(text, ollama_model, ollama_url, on_step_update)

        # 3. Gemini Cloud Provider
        api_key = get_api_key()
        task_steps = self._build_task_steps(text)
        tool_results_list = []
        final_text = ""
        
        if not api_key:
            # Check if local Ollama is available as auto-fallback
            ollama_check = check_ollama_status()
            if ollama_check.get("online") and ollama_check.get("models"):
                first_model = ollama_check["models"][0]
                return self._process_with_ollama(text, first_model, "http://127.0.0.1:11434", on_step_update)

            return {
                "reply": "Please enter your Gemini API Key in System Settings or start local Ollama (`ollama serve`) to unlock full cloud intelligence, sir.",
                "tools_executed": [],
                "task_steps": task_steps
            }

        try:
            client = genai.Client(api_key=api_key)
            system_prompt = f"{get_system_prompt()}\n\n{format_memory_for_prompt()}"
            gemini_tools = [types.Tool(function_declarations=TOOL_DECLARATIONS)]
            
            # Use ultra-fast gemini-2.5-flash with low latency token configuration
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"{system_prompt}\n\nUser: {text}",
                config=types.GenerateContentConfig(
                    tools=gemini_tools,
                    temperature=0.4,
                    max_output_tokens=350
                )
            )

            # Check for function calls
            function_calls = []
            try:
                for candidate in getattr(response, "candidates", []) or []:
                    content = getattr(candidate, "content", None)
                    if content:
                        for part in getattr(content, "parts", []) or []:
                            fc = getattr(part, "function_call", None)
                            if fc:
                                function_calls.append(fc)
            except Exception:
                pass

            if function_calls:
                tool_responses_parts = []
                requires_synthesis = False

                for fc in function_calls:
                    fn_name = getattr(fc, "name", "")
                    fn_args = getattr(fc, "args", {}) or {}
                    if not isinstance(fn_args, dict):
                        fn_args = dict(fn_args)
                    
                    if on_step_update:
                        on_step_update(fn_name, "running")

                    exec_res = self.execute_tool(fn_name, fn_args)
                    tool_results_list.append({"tool": fn_name, "args": fn_args, "result": exec_res})
                    
                    if on_step_update:
                        on_step_update(fn_name, "completed")

                    # Only search and screen vision need a 2nd LLM synthesis pass
                    if fn_name in ("web_search", "screen_process"):
                        requires_synthesis = True
                        tool_responses_parts.append(
                            types.Part.from_function_response(
                                name=fn_name,
                                response={"result": exec_res}
                            )
                        )
                    else:
                        # Direct, instant response without redundant 3s LLM network round-trip!
                        if not final_text:
                            final_text = exec_res.get("message", f"Executed {fn_name} successfully, sir.")

                if requires_synthesis and tool_responses_parts:
                    follow_up = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[
                            f"{system_prompt}\n\nUser: {text}",
                            *tool_responses_parts
                        ],
                        config=types.GenerateContentConfig(
                            temperature=0.4,
                            max_output_tokens=400
                        )
                    )
                    final_text = getattr(follow_up, "text", "") or final_text or "Task completed successfully, sir."

            else:
                final_text = getattr(response, "text", "") or "Understood, sir."

            add_task(text, "completed")

        except Exception as e:
            traceback.print_exc()
            final_text = f"I encountered an error executing your request: {str(e)}"

        return {
            "reply": final_text.strip(),
            "tools_executed": tool_results_list,
            "task_steps": task_steps
        }
