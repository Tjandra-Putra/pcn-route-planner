import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import pcnRoutes from "./routes/pcnRoutes.js";
import { swaggerDocs } from "./config/swagger.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve(); // Current directory

// Allowed origins based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL_PROD] // e.g., https://pcn-route-planner-client.vercel.app
    : [process.env.CLIENT_URL_DEV, process.env.CLIENT_URL_PROD]; // e.g., http://localhost:3000 + prod URL

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(rateLimiter);
app.use(logger);

// Master Routes
app.use("/api/pcn", pcnRoutes);

// Error handling middleware
app.use(errorHandler);

// Swagger docs
swaggerDocs(app);

// Serve static files in production
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
