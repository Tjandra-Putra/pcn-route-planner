import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNumberedMarkerIcon(number: number, color = "#2563eb") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" >
      <path fill="${color}" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"/>
      <text x="16" y="22" font-size="16" fill="white" font-weight="bold" text-anchor="middle" font-family="Arial" dominant-baseline="middle">${number}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

import type { RouteData } from "../types/route";

export function buildGoogleMapsUrl(route: RouteData): string {
  const origin = `${route.Start_Point.lat},${route.Start_Point.lng}`;
  const destination = `${route.Destination.lat},${route.Destination.lng}`;
  const waypoints = route.Route.map((p) => `${p.lat},${p.lng}`).join("|");

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints.length > 0) {
    url.searchParams.set("waypoints", waypoints);
  }
  url.searchParams.set("travelmode", "bicycling");

  return url.toString();
}
