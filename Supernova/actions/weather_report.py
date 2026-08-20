"""
Weather Action Module for SUPERNOVA
Fetches live weather reports using Open-Meteo / wttr.in.
"""

from typing import Dict, Any
import requests

def get_weather(city: str = "Cupertino") -> Dict[str, Any]:
    """Fetches current weather for a specified city."""
    city_clean = city.strip() or "Cupertino"
    
    try:
        url = f"https://wttr.in/{city_clean}?format=j1"
        resp = requests.get(url, timeout=5, headers={"User-Agent": "BrahmaEcho/1.0"}).json()
        
        current = resp.get("current_condition", [{}])[0]
        temp_c = current.get("temp_C", "N/A")
        temp_f = current.get("temp_F", "N/A")
        desc = current.get("weatherDesc", [{}])[0].get("value", "Clear")
        humidity = current.get("humidity", "N/A")
        wind_kmph = current.get("windspeedKmph", "N/A")
        feels_like_c = current.get("FeelsLikeC", temp_c)
        
        summary = f"Weather in {city_clean}: {desc}, {temp_c}°C ({temp_f}°F), Feels like {feels_like_c}°C. Humidity: {humidity}%, Wind: {wind_kmph} km/h."
        
        return {
            "status": "success",
            "city": city_clean,
            "condition": desc,
            "temp_c": temp_c,
            "temp_f": temp_f,
            "humidity": humidity,
            "wind_kmph": wind_kmph,
            "summary": summary
        }
    except Exception as e:
        return {
            "status": "error",
            "city": city_clean,
            "message": f"Could not retrieve weather data for {city_clean}: {str(e)}"
        }
