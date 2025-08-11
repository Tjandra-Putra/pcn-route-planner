// components/FullScreenMap.tsx
"use client";

import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import { useRef, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 1.3521,
  lng: 103.8198,
};

export default function FullScreenMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(center);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const location = place.geometry.location;
      const newPosition = {
        lat: location.lat(),
        lng: location.lng(),
      };
      setMarkerPosition(newPosition);
      map?.panTo(newPosition);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {/* Map */}
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places"]}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad}>
          <Marker position={markerPosition} />
        </GoogleMap>
      </LoadScript>

      {/* Floating Search Bar */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          zIndex: 2,
          width: "300px",
        }}
      >
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places"]}>
          <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              placeholder="Search a location..."
              style={{
                width: "100%",
                height: "40px",
                padding: "0 10px",
                border: "none",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </Autocomplete>
        </LoadScript>
      </div>

      {/* Floating Buttons */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 2,
        }}
      >
        <button onClick={() => map?.setZoom((map?.getZoom() || 12) + 1)} style={buttonStyle}>
          ➕ Zoom In
        </button>
        <button onClick={() => map?.setZoom((map?.getZoom() || 12) - 1)} style={buttonStyle}>
          ➖ Zoom Out
        </button>
        <button onClick={() => map?.panTo(center)} style={buttonStyle}>
          📍 Reset
        </button>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  cursor: "pointer",
  fontSize: "14px",
};
