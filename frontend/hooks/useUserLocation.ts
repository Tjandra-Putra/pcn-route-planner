import { useState, useEffect } from "react";

export function useUserLocation(isLoaded: boolean, reverseGeocode: (lat: number, lng: number) => Promise<string | null>) {
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }
    if (!isLoaded) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);
        setLocation(address ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isLoaded, reverseGeocode]);

  return location;
}
