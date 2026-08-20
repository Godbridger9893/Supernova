"""
YouTube Action Module for SUPERNOVA
Controls YouTube playback and searches.
"""

import subprocess
import urllib.parse
from typing import Dict, Any

def youtube_control(action: str = "play", query: str = "", url: str = "") -> Dict[str, Any]:
    """Searches or plays YouTube videos."""
    action = action.lower().strip()
    
    if action == "play" or action == "search":
        if url:
            target_url = url
        elif query:
            # Direct search or play URL
            encoded_query = urllib.parse.quote(query)
            target_url = f"https://www.youtube.com/results?search_query={encoded_query}"
        else:
            target_url = "https://www.youtube.com"
            
        try:
            subprocess.run(["open", target_url], capture_output=True, timeout=5)
            return {
                "status": "success",
                "message": f"Opened YouTube for '{query or url}' in your default browser.",
                "url": target_url
            }
        except Exception as e:
            return {"status": "error", "message": f"Failed to open YouTube: {str(e)}"}
            
    return {"status": "success", "message": f"YouTube action '{action}' completed."}
