import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import pcnRoutes from "./routes/pcnRoutes.js";
import { swaggerDocs } from "./config/swagger.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";
import rateLimiter from "./middleware/rateLimiter.js";

const corsOptions = {
  // Allows request from these origins
  origin: ["http://localhost:3000", "https://pcn-route-planner-client.vercel.app", "https://pcn-route-planner-server.vercel.app"],
  credentials: true,
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(cors(corsOptions)); //  important to ensure that the app.use(cors(corsOptions)) middleware is placed before your route handlers. This ensures that the CORS headers are added to the server's responses before the routes are processed.
app.use(express.json());
app.use(rateLimiter);
app.use(logger);

// Master Routes
app.use("/api/pcn", pcnRoutes);

// Swagger docs
swaggerDocs(app);

// Error handling middleware
app.use(errorHandler);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
