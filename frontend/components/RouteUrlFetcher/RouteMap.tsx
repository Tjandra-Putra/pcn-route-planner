"use client";

import { useRef } from "react";
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, BicyclingLayer } from "@react-google-maps/api";

import { getNumberedMarkerIcon } from "../../lib/utils";
import type { RouteData } from "../../types/route";
interface RouteMapProps {
  routeDetails: RouteData | null;
  directions: google.maps.DirectionsResult | null;
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult | null>>;
  defaultCenter: { lat: number; lng: number };
}

export default function RouteMap({ routeDetails, directions, setDirections, defaultCenter }: RouteMapProps) {
  const directionsRef = useRef<google.maps.DirectionsResult | null>(null);

  // If no routeDetails, use default center and default zoom
  const center = routeDetails ? { lat: routeDetails.Start_Point.lat, lng: routeDetails.Start_Point.lng } : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%", overflow: "hidden" }}
      center={center}
      zoom={routeDetails ? 13 : 11} // zoom out a bit when no route
      options={{
        fullscreenControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
      {routeDetails && (
        <>
          {/* Markers */}
          <Marker position={routeDetails.Start_Point} icon={getNumberedMarkerIcon(1, "#22c55e")} />
          {routeDetails.Route.map((point, idx) => (
            <Marker key={`route-point-${idx}`} position={{ lat: point.lat, lng: point.lng }} icon={getNumberedMarkerIcon(idx + 2, "#3b82f6")} />
          ))}
          <Marker position={routeDetails.Destination} icon={getNumberedMarkerIcon(routeDetails.Route.length + 2, "#ef4444")} />

          {/* Directions */}
          <DirectionsService
            options={{
              origin: routeDetails.Start_Point,
              destination: routeDetails.Destination,
              travelMode: google.maps.TravelMode.BICYCLING,
              waypoints: routeDetails.Route.map((point) => ({
                location: { lat: point.lat, lng: point.lng },
                stopover: true,
              })),
              optimizeWaypoints: false,
            }}
            callback={(res, status) => {
              if (status === "OK" && res) {
                if (!directionsRef.current || JSON.stringify(directionsRef.current) !== JSON.stringify(res)) {
                  directionsRef.current = res;
                  setDirections(res);
                }
              } else {
                console.error("Directions request failed:", status);
              }
            }}
          />

          {directions && (
            <DirectionsRenderer
              options={{
                directions,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#3b82f6",
                  strokeWeight: 4,
                },
              }}
            />
          )}

          <BicyclingLayer />
        </>
      )}
    </GoogleMap>
  );
}
