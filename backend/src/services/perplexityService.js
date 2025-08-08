import fetch from "node-fetch";
import { PCN } from "../data/PCN.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.PERPLEXITY_API_KEY;

function extractJsonFromText(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

export async function getPcnRouteFromPerplexity(current_location, destination_location) {
  const prompt = `
Current location: ${current_location}  
Destination: ${destination_location}

Generate a JSON object of the PCN-optimised route using **actual park connector names** from the given current location to the destination.
You can refer to the official list of park connectors in Singapore from this list ${PCN.join(",")}

⚠️ Use the provided current and destination values. Do not copy from the example.

⚠️ Make sure to return the route in sequential order, starting from the current location and ending at the destination.

⚠️ Only return the dictionary — no explanations, no extra text.

Example format:
{
    "Start_Point": {
        "name": "${current_location}"
    },
    "Route": [
        {"name": "<Park Connector Name 1>"},
        {"name": "<Park Connector Name 2>"},
        {"name": "<Park Connector Name 3>"},
        {"name": "<Park Connector Name 4>"}
    ],
    "Destination": {
        "name": "${destination_location}"
    }
}
    `;

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error(`Error: ${res.status} - ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const jsonStr = extractJsonFromText(content);

    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (err) {
    console.error("Request failed:", err);
    return null;
  }
}
