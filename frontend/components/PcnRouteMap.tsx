"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, ArrowRightIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge"; // Adjust import according to your setup

import { GoogleMap, Marker, Polyline, useJsApiLoader, Autocomplete, BicyclingLayer } from "@react-google-maps/api";

import LoadingBar from "react-top-loading-bar";

type RoutePoint = {
  name: string;
  lat: number;
  lng: number;
};

type RouteData = {
  Start_Point: RoutePoint;
  Route: RoutePoint[];
  Destination: RoutePoint;
};

export default function RouteUrlFetcher() {
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const loadingBarRef = useRef<LoadingBar>(null);

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const startIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  const stopIcon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  const destinationIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  function onLoadOrigin(autocomplete: google.maps.places.Autocomplete) {
    originAutocompleteRef.current = autocomplete;
  }

  function onLoadDestination(autocomplete: google.maps.places.Autocomplete) {
    destinationAutocompleteRef.current = autocomplete;
  }

  function onPlaceChangedOrigin() {
    if (originAutocompleteRef.current) {
      const place = originAutocompleteRef.current.getPlace();
      if (!place) return; // guard against undefined

      if (place.formatted_address) {
        setOriginInput(place.formatted_address);
      } else if (place.name) {
        setOriginInput(place.name);
      } else if (typeof place === "string") {
        // Sometimes getPlace() may return a string if user typed free text
        setOriginInput(place);
      }
      // else fallback do nothing or keep current input
    }
  }

  function onPlaceChangedDestination() {
    if (destinationAutocompleteRef.current) {
      const place = destinationAutocompleteRef.current.getPlace();
      if (!place) return;

      if (place.formatted_address) {
        setDestinationInput(place.formatted_address);
      } else if (place.name) {
        setDestinationInput(place.name);
      } else if (typeof place === "string") {
        setDestinationInput(place);
      }
    }
  }

  async function geocodePlaceName(placeName: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: placeName,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      const results = response.data.results;
      if (!results || results.length === 0) {
        console.warn(`No geocoding results for "${placeName}"`);
        return null;
      }

      return results[0].geometry.location;
    } catch (error) {
      console.error(`Geocoding error for "${placeName}":`, error);
      return null;
    }
  }

  async function fetchRoute() {
    setLoading(true);
    setError(null);
    setMapsUrl(null);
    setRouteDetails(null);

    // Start loading bar
    loadingBarRef.current?.continuousStart();

    try {
      const res = await axios.post("http://localhost:5001/api/pcn/route", {
        current_location: originInput,
        destination_location: destinationInput,
      });

      const rawRoute = res.data.route;

      const startCoords = await geocodePlaceName(rawRoute.Start_Point.name);
      if (!startCoords) throw new Error(`No geocoding results for start point "${rawRoute.Start_Point.name}"`);

      const destinationCoords = await geocodePlaceName(rawRoute.Destination.name);
      if (!destinationCoords) throw new Error(`No geocoding results for destination "${rawRoute.Destination.name}"`);

      const routePoints: RoutePoint[] = [];
      for (const stop of rawRoute.Route) {
        const coords = await geocodePlaceName(stop.name);
        if (!coords) {
          console.warn(`Skipping route stop "${stop.name}" due to no geocoding results.`);
          continue;
        }
        routePoints.push({
          name: stop.name,
          lat: coords.lat,
          lng: coords.lng,
        });
      }

      const validRoutePoints = routePoints.filter((p) => p.lat && p.lng);

      const fullRoute: RouteData = {
        Start_Point: {
          name: rawRoute.Start_Point.name,
          lat: startCoords.lat,
          lng: startCoords.lng,
        },
        Route: validRoutePoints,
        Destination: {
          name: rawRoute.Destination.name,
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
        },
      };

      setRouteDetails(fullRoute);
      setMapsUrl(res.data.mapsUrl || null);

      // Complete loading bar
      loadingBarRef.current?.complete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch route or geocode locations.");
      loadingBarRef.current?.complete();
    } finally {
      setLoading(false);
    }
  }

  const center = routeDetails ? { lat: routeDetails.Start_Point.lat, lng: routeDetails.Start_Point.lng } : { lat: 1.3521, lng: 103.8198 };

  const path = routeDetails
    ? [
        { lat: routeDetails.Start_Point.lat, lng: routeDetails.Start_Point.lng },
        ...routeDetails.Route.map((p) => ({ lat: p.lat, lng: p.lng })),
        { lat: routeDetails.Destination.lat, lng: routeDetails.Destination.lng },
      ]
    : [];

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  return (
    <div className="flex h-screen w-screen bg-white">
      {/* Top loading bar */}
      <LoadingBar color="#2563eb" ref={loadingBarRef} height={4} />

      {/* Collapsible sidebar */}
      <div
        className={`bg-white shadow-lg flex flex-col transition-width duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-1/3 max-w-md"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-2 h-15">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 focus:outline-none"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ArrowRightIcon className="w-5 h-5" /> : <ArrowLeftIcon className="w-5 h-5" />}
          </button>

          <h1 className="text-base font-semibold tracking-tight text-gray-900 ml-3">PCN AI Route Assistant</h1>

          <InfoCircledIcon className="w-5 h-5 text-gray-400 ml-1" />
        </div>

        {!collapsed && (
          <Card className="flex-1 flex flex-col border-none outline-none border-r-0 rounded-none !shadow-none">
            <CardContent className="flex-grow overflow-auto">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="origin" className="mb-1 block text-sm font-medium text-gray-700">
                    Current Location
                  </Label>
                  {isLoaded ? (
                    <Autocomplete onLoad={onLoadOrigin} onPlaceChanged={onPlaceChangedOrigin}>
                      <Input
                        id="origin"
                        type="text"
                        value={originInput}
                        onChange={(e) => setOriginInput(e.target.value)}
                        placeholder="e.g. 310172"
                        autoComplete="off"
                        className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </Autocomplete>
                  ) : (
                    <Input
                      id="origin"
                      type="text"
                      value={originInput}
                      onChange={(e) => setOriginInput(e.target.value)}
                      placeholder="Loading..."
                      disabled
                      className="bg-gray-200"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="destination" className="mb-1 block text-sm font-medium text-gray-700">
                    Destination
                  </Label>
                  {isLoaded ? (
                    <Autocomplete onLoad={onLoadDestination} onPlaceChanged={onPlaceChangedDestination}>
                      <Input
                        id="destination"
                        type="text"
                        value={destinationInput}
                        onChange={(e) => setDestinationInput(e.target.value)}
                        placeholder="e.g. East Coast Park"
                        autoComplete="off"
                        className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </Autocomplete>
                  ) : (
                    <Input
                      id="destination"
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      placeholder="Loading..."
                      disabled
                      className="bg-gray-200"
                    />
                  )}
                </div>
              </div>

              <h2 className="text-sm font-semibold text-center tracking-wide mt-6 mb-4">
                Route Details{" "}
                {routeDetails && (
                  <span className="text-gray-500 font-normal">
                    ({[routeDetails.Start_Point, ...routeDetails.Route, routeDetails.Destination].length - 1} Routes)
                  </span>
                )}
              </h2>
              <div className="w-full text-sm text-gray-700 overflow-auto max-h-[45vh] flex flex-col gap-2 px-2 py-1">
                <div className="w-full text-sm text-gray-700 overflow-auto max-h-[45vh] flex flex-col gap-2 px-2 py-1">
                  {routeDetails ? (
                    <>
                      {[routeDetails.Start_Point, ...routeDetails.Route, routeDetails.Destination].map((point, idx, arr) => {
                        if (idx === arr.length - 1) return null; // no next point to pair with

                        return (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center bg-blue-100 space-x-2
               hover:bg-blue-200 hover:shadow-md hover:-translate-y-0.5
               transition-all duration-200 ease-in-out group"
                          >
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 text-white bg-blue-600 rounded-full text-[10px] font-semibold
                 transition-transform duration-200 ease-in-out group-hover:scale-110"
                            >
                              {idx + 1}
                            </span>

                            <span>{arr[idx].name}</span>

                            <ArrowRightIcon className="h-4 w-4" />
                          </Badge>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-center text-gray-400 italic mt-4">
                      No route details available. Please enter origin and destination and click Get Route.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-3">
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-center break-words w-full">
                  <Button variant="outline" className="w-full cursor-pointer">
                    Open Route in Google Maps
                  </Button>
                </a>
              )}

              {routeDetails ? (
                <Button
                  onClick={() => {
                    // Reset all inputs and route info
                    setOriginInput("");
                    setDestinationInput("");
                    setRouteDetails(null);
                    setMapsUrl(null);
                    setError(null);
                  }}
                  className="w-full font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                >
                  Restart Over
                </Button>
              ) : (
                <Button
                  onClick={fetchRoute}
                  disabled={loading || !originInput || !destinationInput}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white cursor-pointer"
                >
                  {loading ? "Hang Tight, We're Fetching Your Route..." : "Get Route"}
                </Button>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="flex-1 relative">
        {isLoaded ? (
          <>
            <div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20
                bg-yellow-100 border border-yellow-400 text-yellow-800
                px-4 py-2 rounded-md shadow-md select-none pointer-events-none
                font-semibold text-sm"
            >
              Map Preview
            </div>

            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
              center={center}
              zoom={13}
              options={{
                fullscreenControl: false,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              {routeDetails && (
                <>
                  <Marker position={routeDetails.Start_Point} title="Start" icon={startIcon} />
                  {routeDetails.Route.map((stop, idx) => (
                    <Marker key={idx} position={stop} title={stop.name} icon={stopIcon} />
                  ))}
                  <Marker position={routeDetails.Destination} title="Destination" icon={destinationIcon} />

                  <Polyline path={path} options={{ strokeColor: "#0000FF", strokeWeight: 3 }} />
                  <BicyclingLayer />
                </>
              )}
            </GoogleMap>
          </>
        ) : (
          <div>Loading Map...</div>
        )}
      </div>
    </div>
  );
}
