import requests
import json
import urllib.parse
import webbrowser
import os
import re
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("PERPLEXITY_API_KEY")

current_location = "Toa Payoh Lorong 1, Block 172"  # Toa Payoh
destination_location = "Changi Bay Point"

prompt = f"""
Current: {current_location}
Destination: {destination_location}

Return me as a python dictionary format PCN optimised routes with names to get to my destination, don't add any text or comment, i need this for processing.

Example output:
{{
    "Start_Point": {{
        "name": "Toa Payoh (310172)"
    }},
    "Route": [
        {{
            "name": "Kallang Park Connector"
        }},
        {{
            "name": "Tanjong Rhu Promenade Park Connector"
        }},
        {{
            "name": "Eastern Coastal Loop / Siglap Park Connector"
        }},
        {{
            "name": "East Coast Park Connector"
        }}
    ],
    "Destination": {{
        "name": "East Coast Park (Area G)"
    }}
}}
"""


def extract_json_from_text(text):
    """
    Extracts the first JSON object from a block of text.
    """
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)
    else:
        print("No JSON object found in the response.")
        return None


def get_pcn_route_from_perplexity(prompt: str, api_key: str) -> dict | None:
    # Set up the API endpoint and headers
    url = "https://api.perplexity.ai/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    # Define the request payload
    payload = {"model": "sonar-pro", "messages": [{"role": "user", "content": prompt}]}

    # Make the API call
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            json_str = extract_json_from_text(content)
            if json_str:
                route_data = json.loads(json_str)
                return route_data
            else:
                return None
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error parsing response: {e}")
            return None
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None


def build_and_open_google_maps_url(data: dict):
    start_name = data["Start_Point"]["name"]
    destination_name = data["Destination"]["name"]
    waypoints_names = [segment["name"] for segment in data.get("Route", [])]
    waypoints_str = "|".join(waypoints_names)
    url = "https://www.google.com/maps/dir/?api=1" f"&origin={urllib.parse.quote(start_name)}" f"&destination={urllib.parse.quote(destination_name)}"
    if waypoints_names:
        url += f"&waypoints={urllib.parse.quote(waypoints_str)}"
    url += "&travelmode=bicycling"
    print("Opening URL:", url)
    webbrowser.open(url)


def remove_duplicates(route_data: dict) -> dict:
    seen = set()
    unique_route = []
    for segment in route_data.get("Route", []):
        name = segment["name"]
        if name not in seen:
            seen.add(name)
            unique_route.append(segment)
    new_data = {"Start_Point": route_data["Start_Point"], "Route": unique_route, "Destination": route_data["Destination"]}
    return new_data


def main():
    route_data = get_pcn_route_from_perplexity(prompt, API_KEY)
    if route_data:
        route_data = remove_duplicates(route_data)
        build_and_open_google_maps_url(route_data)
    else:
        print("Failed to get route data from Perplexity API.")


if __name__ == "__main__":
    main()
