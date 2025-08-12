"use client";

import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RouteInputProps {
  origin: string;
  setOrigin: React.Dispatch<React.SetStateAction<string>>;
  destination: string;
  setDestination: React.Dispatch<React.SetStateAction<string>>;
  onLoadOrigin: (autoC: google.maps.places.Autocomplete) => void;
  onLoadDestination: (autoC: google.maps.places.Autocomplete) => void;
  onPlaceChangedOrigin: () => void;
  onPlaceChangedDestination: () => void;
  isLoaded: boolean;
}

export default function RouteInput({
  origin,
  setOrigin,
  destination,
  setDestination,
  onLoadOrigin,
  onLoadDestination,
  onPlaceChangedOrigin,
  onPlaceChangedDestination,
  isLoaded,
}: RouteInputProps) {
  return (
    <>
      <div>
        <Label htmlFor="origin" className="mb-1 block text-sm font-medium text-gray-700">
          Current Location
        </Label>
        {isLoaded ? (
          <Autocomplete onLoad={onLoadOrigin} onPlaceChanged={onPlaceChangedOrigin}>
            <Input
              id="origin"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. 310172"
              autoComplete="off"
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </Autocomplete>
        ) : (
          <Input id="origin" type="text" value={origin} disabled placeholder="Loading..." className="w-full bg-gray-200" />
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
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. East Coast Park"
              autoComplete="off"
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </Autocomplete>
        ) : (
          <Input id="destination" type="text" value={destination} disabled placeholder="Loading..." className="w-full bg-gray-200" />
        )}
      </div>
    </>
  );
}
