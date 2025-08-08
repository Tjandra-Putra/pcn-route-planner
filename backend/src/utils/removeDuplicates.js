export function removeDuplicates(routeData) {
  const seen = new Set();
  const uniqueRoute = [];

  for (const segment of routeData.Route || []) {
    if (!seen.has(segment.name)) {
      seen.add(segment.name);
      uniqueRoute.push(segment);
    }
  }

  return {
    Start_Point: routeData.Start_Point,
    Route: uniqueRoute,
    Destination: routeData.Destination,
  };
}
