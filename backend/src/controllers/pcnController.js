import { getPcnRouteFromPerplexity } from "../services/perplexityService.js";
import { removeDuplicates } from "../utils/removeDuplicates.js";
import { buildGoogleMapsUrl } from "../utils/googleMap.js";

export const getRoute = async (req, res, next) => {
  try {
    const { current_location, destination_location, openInBrowser } = req.body;

    if (!current_location || !destination_location) {
      return res.status(400).json({ error: "Missing current_location or destination_location" });
    }

    const routeData = await getPcnRouteFromPerplexity(current_location, destination_location);
    if (!routeData) {
      return res.status(500).json({ error: "Failed to get route data" });
    }

    const cleanedRoute = removeDuplicates(routeData);
    const mapsUrl = buildGoogleMapsUrl(cleanedRoute);

    if (openInBrowser) {
      const open = (await import("open")).default;
      await open(mapsUrl);
    }

    res.json({ route: cleanedRoute, mapsUrl });
  } catch (error) {
    next(error);
  }
};
