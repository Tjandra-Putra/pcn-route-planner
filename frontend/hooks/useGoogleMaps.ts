import { useJsApiLoader } from "@react-google-maps/api";

export function useGoogleMaps(apiKey: string) {
  return useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });
}
