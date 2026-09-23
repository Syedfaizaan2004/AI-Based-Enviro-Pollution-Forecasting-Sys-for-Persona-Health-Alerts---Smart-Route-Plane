import logging
import json
from typing import List, Dict, Any
from groq import AsyncGroq
from app.core.config import settings
from fastapi import HTTPException
from app.api_clients.weather_client import OpenWeatherClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the official AI Assistant for AirSense.AI, an advanced environmental pollution forecasting and smart route planning application.

Your domain of expertise is strictly limited to:
1. Air quality indices (AQI), pollution forecasting, and environmental health risks.
2. Personalized health alerts based on air quality.
3. Smart route planning that minimizes pollution exposure.
4. Live weather and air quality updates.
5. Travel recommendations based on air quality and weather, strictly within India.

CRITICAL INSTRUCTIONS:
- You have access to tools to fetch live weather and AQI. Use them when the user asks for current conditions or travel recommendations.
- You must strictly limit all geographical weather, AQI, and travel queries to INDIA. If a user asks about a city outside India (e.g., New York, London, Paris), politely decline and state that your services are currently limited to India.
- If a user asks a question OUTSIDE of this domain (e.g., coding, general history, unrelated chit-chat), you MUST politely decline to answer and steer the conversation back to AirSense.AI.
- Keep your answers concise, helpful, and professional.
"""

# Define the tools (functions) available to the model
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_city_weather_and_aqi",
            "description": "Get the current weather and Air Quality Index (AQI) for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The name of the city, e.g., Mumbai, Delhi, Bangalore"
                    }
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_cleanest_cities_in_india",
            "description": "Fetch a list of popular tourist and major cities in India along with their current AQI to recommend to the user for travel.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]

class ChatService:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            logger.error("GROQ_API_KEY is not configured.")
            raise ValueError("Groq API Key is missing.")
            
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-120b"
        self.weather_client = OpenWeatherClient()

    async def _get_city_weather_and_aqi(self, city: str) -> str:
        try:
            geo_data = await self.weather_client.geocode_city(city)
            if not geo_data:
                return json.dumps({"error": f"City '{city}' not found."})
                
            country = geo_data.get("country", "")
            if country != "IN":
                return json.dumps({"error": f"City '{city}' is in '{country}', which is outside India. Please tell the user that you can only provide data for Indian cities."})
                
            lat = geo_data["lat"]
            lon = geo_data["lon"]
            
            weather = await self.weather_client.get_current_weather(lat, lon)
            pollution = await self.weather_client.get_air_pollution(lat, lon)
            
            # OpenWeather AQI mapping to 0-500 scale
            owm_aqi = pollution.get("list", [{}])[0].get("main", {}).get("aqi", 0)
            standard_aqi = 25
            if owm_aqi == 1: standard_aqi = 35
            elif owm_aqi == 2: standard_aqi = 75
            elif owm_aqi == 3: standard_aqi = 125
            elif owm_aqi == 4: standard_aqi = 175
            elif owm_aqi == 5: standard_aqi = 250
            
            result = {
                "city": geo_data.get("name", city),
                "country": country,
                "temperature": weather.get("main", {}).get("temp"),
                "humidity": weather.get("main", {}).get("humidity"),
                "weather_description": weather.get("weather", [{}])[0].get("description", ""),
                "aqi": standard_aqi
            }
            return json.dumps(result)
        except Exception as e:
            logger.error(f"Error fetching city weather: {str(e)}")
            return json.dumps({"error": "Failed to fetch weather data."})

    async def _get_cleanest_cities_in_india(self) -> str:
        # Pre-defined list of popular Indian cities for tourism/living
        cities = ["Shimla", "Mysore", "Kochi", "Pune", "Coimbatore", "Chandigarh", "Dehradun", "Indore"]
        results = []
        
        try:
            for city in cities:
                geo_data = await self.weather_client.geocode_city(city)
                if not geo_data or geo_data.get("country") != "IN":
                    continue
                lat, lon = geo_data["lat"], geo_data["lon"]
                pollution = await self.weather_client.get_air_pollution(lat, lon)
                owm_aqi = pollution.get("list", [{}])[0].get("main", {}).get("aqi", 0)
                standard_aqi = 25
                if owm_aqi == 1: standard_aqi = 35
                elif owm_aqi == 2: standard_aqi = 75
                elif owm_aqi == 3: standard_aqi = 125
                elif owm_aqi == 4: standard_aqi = 175
                elif owm_aqi == 5: standard_aqi = 250
                
                results.append({"city": city, "aqi": standard_aqi})
            
            # Sort by AQI (lowest is best)
            results.sort(key=lambda x: x["aqi"])
            # Return top 5 cleanest
            return json.dumps({"cleanest_cities": results[:5]})
        except Exception as e:
            logger.error(f"Error fetching cleanest cities: {str(e)}")
            return json.dumps({"error": "Failed to fetch cleanest cities."})

    async def get_chat_response(self, messages: List[Dict[str, str]]) -> str:
        try:
            formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
            
            # Step 1: Initial call with tools
            response = await self.client.chat.completions.create(
                messages=formatted_messages,
                model=self.model,
                temperature=0.5,
                max_tokens=1024,
                tools=TOOLS,
                tool_choice="auto",
            )
            
            response_message = response.choices[0].message
            
            # Step 2: Check if the model wants to call a tool
            if response_message.tool_calls:
                formatted_messages.append(response_message) # Append the assistant's tool call message
                
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    
                    if function_name == "get_city_weather_and_aqi":
                        function_response = await self._get_city_weather_and_aqi(function_args.get("city"))
                    elif function_name == "get_cleanest_cities_in_india":
                        function_response = await self._get_cleanest_cities_in_india()
                    else:
                        function_response = json.dumps({"error": "Unknown function"})
                        
                    formatted_messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": function_response,
                        }
                    )
                
                # Step 3: Call the model again with the tool responses
                final_response = await self.client.chat.completions.create(
                    messages=formatted_messages,
                    model=self.model,
                    temperature=0.5,
                    max_tokens=1024,
                )
                return final_response.choices[0].message.content
            
            return response_message.content
            
        except Exception as e:
            logger.error(f"Groq API Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to communicate with AI service")
