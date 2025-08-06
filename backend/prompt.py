import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()

API_KEY = os.getenv("PERPLEXITY_API_KEY")

prompt = """
Current: 310172
Destination: Pasir Ris Beach

Return me as a python dictionary format PCN optimised routes with names to get to my destination, don't add any text or comment, i need this for processing.

Example output:
{
    "Start_Point": {
        "name": "Toa Payoh (310172)"
    },
    "Route": [
        {
            "name": "Kallang Park Connector",
        },
        {
            "name": "Tanjong Rhu Promenade Park Connector",
        },
        {
            "name": "Eastern Coastal Loop / Siglap Park Connector",
            
        },
        {
            "name": "East Coast Park Connector",
        }
    ],
    "Destination": {
        "name": "East Coast Park (Area G)",
    }
}
"""


def get_pcn_route_from_perplexity(prompt: str, api_key: str) -> dict | None:
    # Set up the API endpoint and headers
    url = "https://api.perplexity.ai/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    # Define the request payload
    payload = {"model": "sonar-pro", "messages": [{"role": "user", "content": "What were the results of the 2025 French Open Finals?"}]}

    # Make the API call
    response = requests.post(url, headers=headers, json=payload)

    # Print the AI's response
    print(response.json())  # replace with print(response.json()["choices"][0]['message']['content']) for just the content

    if response.status_code == 200:
        try:
            data = response.json()
            # Extract the content from the response
            content = data["choices"][0]["message"]["content"]
            # Parse the content as JSON
            route_data = json.loads(content)
            return route_data
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error parsing response: {e}")
            return None
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None
