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
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// CORS must come before any routes
app.use(cors(corsOptions));

app.options("*", cors(corsOptions)); // <-- Handle preflight requests
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
