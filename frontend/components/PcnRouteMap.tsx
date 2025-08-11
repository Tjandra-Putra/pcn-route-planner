"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RouteUrlFetcher() {
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<null | {
    Start_Point: { name: string };
    Route: { name: string }[];
    Destination: { name: string };
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRoute() {
    setLoading(true);
    setError(null);
    setMapsUrl(null);
    setRouteDetails(null);
    try {
      const res = await axios.post("http://localhost:5001/api/pcn/route", {
        current_location: originInput,
        destination_location: destinationInput,
      });

      setMapsUrl(res.data.mapsUrl);
      setRouteDetails(res.data.route);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch route URL. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-6 text-center">PCN Route URL Generator</h1>

          <div className="space-y-4">
            <div>
              <Label htmlFor="origin" className="mb-1 block text-sm font-medium">
                Current Location
              </Label>
              <Input
                id="origin"
                type="text"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="e.g. 310172"
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="mb-1 block text-sm font-medium">
                Destination
              </Label>
              <Input
                id="destination"
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="e.g. West Coast Park"
                autoComplete="off"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2">
          <Button onClick={fetchRoute} disabled={loading || !originInput || !destinationInput} className="w-full">
            {loading ? "Loading..." : "Get Route URL"}
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {mapsUrl && (
            <>
              <Separator className="my-4 w-full" />
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-center break-words w-full">
                Open Route in Google Maps
              </a>
            </>
          )}

          {routeDetails && (
            <div className="mt-6 w-full text-sm text-gray-700">
              <h2 className="font-semibold mb-2 text-center">Route Details</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Start Point:</strong> {routeDetails.Start_Point.name}
                </li>
                {routeDetails.Route.map((stop, idx) => (
                  <li key={idx}>{stop.name}</li>
                ))}
                <li>
                  <strong>Destination:</strong> {routeDetails.Destination.name}
                </li>
              </ul>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
