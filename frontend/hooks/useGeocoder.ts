import { useEffect, useRef } from "react";

export function useGeocoder(isLoaded: boolean) {
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    return new Promise((resolve) => {
      if (!geocoderRef.current) return resolve(null);
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(null);
        }
      });
    });
  }

  return { reverseGeocode };
}
