import ratelimit from "../config/upstash.js";
import os from "os";

const rateLimiter = async (req, res, next) => {
  try {
    // get ip address or user identifier
    var networkInterfaces = os.networkInterfaces();
    var ipAddress =
      Object.values(networkInterfaces)
        .flat()
        .find((iface) => iface.family === "IPv4" && !iface.internal)?.address || "unknown";

    const { success } = await ratelimit.limit(ipAddress); // replace with a unique key per user/session if needed

    if (!success) {
      return res.status(429).json({ message: "Too many requests, please try again later." });
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next(error);
  }
};

export default rateLimiter;
