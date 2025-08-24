"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import RouteInput from "./RouteInput";
import RouteList from "./RouteList";
import RouteMap from "./RouteMap";

import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import { useGeocoder } from "../../hooks/useGeocoder";
import { useUserLocation } from "../../hooks/useUserLocation";

import { buildGoogleMapsUrl } from "@/lib/utils";
import type { RouteData } from "../../types/route";

export default function RouteUrlFetcher() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const DEFAULT_CENTER = { lat: 1.3521, lng: 103.8198 }; // Singapore coordinates

  // State
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [routeDetails, setRouteDetails] = useState<RouteData | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  // Refs
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  // Geocoder
  const { reverseGeocode } = useGeocoder(isLoaded);

  // Geolocation to prefill origin input
  const userLocation = useUserLocation(isLoaded, reverseGeocode);
  useEffect(() => {
    if (userLocation) setOriginInput(userLocation);
  }, [userLocation]);

  // Autocomplete handlers
  function onLoadOrigin(autoC: google.maps.places.Autocomplete) {
    originAutocompleteRef.current = autoC;
  }
  function onLoadDestination(autoC: google.maps.places.Autocomplete) {
    destinationAutocompleteRef.current = autoC;
  }
  function onPlaceChangedOrigin() {
    const place = originAutocompleteRef.current?.getPlace();
    if (!place) return;
    setOriginInput(place.formatted_address ?? place.name ?? "");
  }
  function onPlaceChangedDestination() {
    const place = destinationAutocompleteRef.current?.getPlace();
    if (!place) return;
    setDestinationInput(place.formatted_address ?? place.name ?? "");
  }

  // Geocode place name helper
  async function geocodePlaceName(placeName: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: { address: placeName, key: GOOGLE_MAPS_API_KEY },
      });
      const results = res.data.results;
      if (!results || results.length === 0) {
        console.warn(`No geocoding results for "${placeName}"`);
        return null;
      }
      return results[0].geometry.location;
    } catch (e) {
      console.error(`Geocoding error for "${placeName}":`, e);
      return null;
    }
  }

  // Fetch route from backend and geocode points
  async function fetchRoute() {
    setLoading(true);
    setError(null);
    setMapsUrl(null);
    setRouteDetails(null);
    setDirections(null);
    loadingBarRef.current?.continuousStart();

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/pcn/route`, {
        current_location: originInput,
        destination_location: destinationInput,
      });
      const rawRoute = res.data.route;

      const startCoords = await geocodePlaceName(rawRoute.Start_Point.name);
      if (!startCoords) throw new Error(`No geocoding for start point "${rawRoute.Start_Point.name}"`);

      const destinationCoords = await geocodePlaceName(rawRoute.Destination.name);
      if (!destinationCoords) throw new Error(`No geocoding for destination "${rawRoute.Destination.name}"`);

      const routePoints: RouteData["Route"] = [];
      for (const stop of rawRoute.Route) {
        const coords = await geocodePlaceName(stop.name);
        if (!coords) {
          console.warn(`Skipping stop "${stop.name}" no geocoding result.`);
          continue;
        }
        routePoints.push({ name: stop.name, lat: coords.lat, lng: coords.lng });
      }

      const fullRoute: RouteData = {
        Start_Point: { name: rawRoute.Start_Point.name, lat: startCoords.lat, lng: startCoords.lng },
        Route: routePoints,
        Destination: { name: rawRoute.Destination.name, lat: destinationCoords.lat, lng: destinationCoords.lng },
      };

      setRouteDetails(fullRoute);
      setMapsUrl(buildGoogleMapsUrl(fullRoute));
      setError(null);
    } catch (e) {
      setError("Failed to fetch or process route. Please try again.");
      setRouteDetails(null);
      setMapsUrl(null);
      console.error(e);
    } finally {
      setLoading(false);
      loadingBarRef.current?.complete();
    }
  }

  if (loadError) return <p>Error loading Google Maps API: {loadError.message}</p>;

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen bg-gray-50 min-h-0">
      <LoadingBar color="#2563eb" ref={loadingBarRef} />

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 flex flex-col border-r border-gray-200 bg-white shadow-md
          ${collapsed ? "md:w-13" : "w-full md:w-[480px]"} h-auto md:h-full relative max-w-full`}
      >
        {/* ===== Mobile Navbar (only visible on small screens) ===== */}
        <div className="flex items-center justify-between border-b border-gray-200 px-2 h-15 bg-white md:hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 focus:outline-none cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ArrowRightIcon className="w-5 h-5" /> : <ArrowLeftIcon className="w-5 h-5" />}
          </button>

          <div className="flex flex-col items-center flex-grow ml-3 overflow-hidden">
            <h1 className="text-sm font-semibold tracking-tight text-gray-900 truncate">PCN AI Route Assistant</h1>
            <p className="text-xs text-gray-500 truncate">Route Info & Controls</p>
          </div>

          <InfoCircledIcon className="w-5 h-5 text-gray-400 ml-2" />
        </div>

        {/* ===== Desktop Navbar (only visible on md and up) ===== */}
        <div className="hidden md:flex items-center justify-between border-b border-gray-200 px-2 h-15 bg-white">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 focus:outline-none cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ArrowRightIcon className="w-5 h-5" /> : <ArrowLeftIcon className="w-5 h-5" />}
          </button>

          {!collapsed && (
            <>
              <h1 className="text-base font-semibold tracking-tight text-gray-900 ml-3">PCN AI Route Assistant</h1>
              <InfoCircledIcon className="w-5 h-5 text-gray-400 ml-1" />
            </>
          )}
        </div>

        {/* Sidebar content (hide when collapsed) */}
        {!collapsed && (
          <div className="flex flex-col flex-grow min-h-0">
            <Card className="flex flex-col flex-grow min-h-0 border-none outline-none rounded-none !shadow-none">
              <CardContent className="flex flex-col flex-grow px-4 py-3 md:px-6 md:py-4 min-h-0">
                <div className="flex-shrink-0 space-y-4">
                  <RouteInput
                    origin={originInput}
                    setOrigin={setOriginInput}
                    destination={destinationInput}
                    setDestination={setDestinationInput}
                    onLoadOrigin={onLoadOrigin}
                    onLoadDestination={onLoadDestination}
                    onPlaceChangedOrigin={onPlaceChangedOrigin}
                    onPlaceChangedDestination={onPlaceChangedDestination}
                    isLoaded={isLoaded}
                  />

                  <h2 className="text-sm font-semibold text-center tracking-wide mt-6 mb-4">
                    Route Details{" "}
                    {routeDetails && (
                      <span className="text-gray-500 font-normal">
                        ({[routeDetails.Start_Point, ...routeDetails.Route, routeDetails.Destination].length - 1} Routes)
                      </span>
                    )}
                  </h2>
                </div>

                <div className="flex-grow overflow-auto">
                  <RouteList routeDetails={routeDetails} />
                </div>
              </CardContent>

              <CardFooter className="flex-shrink-0 flex-col items-center gap-4 md:px-6 md:py-4 border-gray-200 mb-[-2vh]">
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-center break-words w-full"
                  >
                    <Button variant="outline" className="w-full cursor-pointer">
                      Open Route in Google Maps
                    </Button>
                  </a>
                )}

                <Button
                  onClick={fetchRoute}
                  disabled={loading || !originInput || !destinationInput}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white cursor-pointer mb-4 md:mb-0"
                >
                  {loading ? "Hang Tight, We're Fetching Your Route..." : "Get Route"}
                </Button>

                {/* {routeDetails ? (
                  <Button
                    onClick={() => {
                      setOriginInput("");
                      setDestinationInput("");
                      setRouteDetails(null);
                      setMapsUrl(null);
                      setError(null);
                      setDirections(null);
                    }}
                    className="w-full font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer mb-4 md:mb-0"
                  >
                    Restart Over
                  </Button>
                ) : (
                  <Button
                    onClick={fetchRoute}
                    disabled={loading || !originInput || !destinationInput}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white cursor-pointer mb-4 md:mb-0"
                  >
                    {loading ? "Hang Tight, We're Fetching Your Route..." : "Get Route"}
                  </Button>
                )} */}

                {error && <p className="text-sm text-red-600">{error}</p>}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="flex-1 relative min-h-[300px] md:min-h-0 h-64 md:h-auto">
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

            <RouteMap routeDetails={routeDetails} directions={directions} setDirections={setDirections} defaultCenter={DEFAULT_CENTER} />
          </>
        ) : (
          <div>Loading Map...</div>
        )}
      </div>
    </div>
  );
}
