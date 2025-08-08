export function buildGoogleMapsUrl(data) {
  const startName = data.Start_Point.name;
  const destinationName = data.Destination.name;
  const waypointsNames = (data.Route || []).map((segment) => segment.name);
  const waypointsStr = waypointsNames.join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startName)}&destination=${encodeURIComponent(destinationName)}`;
  if (waypointsNames.length > 0) {
    url += `&waypoints=${encodeURIComponent(waypointsStr)}`;
  }
  url += "&travelmode=bicycling";

  return url;
}
