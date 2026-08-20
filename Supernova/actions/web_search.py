"""
Web Search Action for SUPERNOVA
Performs web queries using DuckDuckGo and returns structured snippets.
"""

from typing import Dict, Any, List
import json

try:
    from duckduckgo_search import DDGS
    _DDG_AVAILABLE = True
except ImportError:
    _DDG_AVAILABLE = False

import requests

def web_search(query: str, max_results: int = 5) -> Dict[str, Any]:
    """Performs web search and returns concise results."""
    query = query.strip()
    if not query:
        return {"status": "error", "message": "Search query cannot be empty."}

    results: List[Dict[str, str]] = []
    
    if _DDG_AVAILABLE:
        try:
            with DDGS() as ddgs:
                ddg_res = list(ddgs.text(query, max_results=max_results))
                for item in ddg_res:
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("body", ""),
                        "link": item.get("href", "")
                    })
        except Exception as e:
            print(f"[Search] DuckDuckGo search library error: {e}")

    # Fallback to DuckDuckGo Instant Answer API if needed
    if not results:
        try:
            url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
            res = requests.get(url, timeout=5).json()
            if res.get("AbstractText"):
                results.append({
                    "title": res.get("Heading", query),
                    "snippet": res.get("AbstractText", ""),
                    "link": res.get("AbstractURL", "")
                })
            for topic in res.get("RelatedTopics", [])[:3]:
                if isinstance(topic, dict) and topic.get("Text"):
                    results.append({
                        "title": topic.get("FirstURL", ""),
                        "snippet": topic.get("Text", ""),
                        "link": topic.get("FirstURL", "")
                    })
        except Exception as e:
            print(f"[Search] Fallback API error: {e}")

    if not results:
        return {
            "status": "success",
            "query": query,
            "results": [],
            "summary": f"No direct search results found for '{query}'."
        }

    summary_text = "\n".join(f"- {r['title']}: {r['snippet']}" for r in results[:4])
    return {
        "status": "success",
        "query": query,
        "results": results,
        "summary": summary_text
    }
