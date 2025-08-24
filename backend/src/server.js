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

const __dirname = path.resolve(); // Get the current directory name

// Middleware
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://pcn-route-planner-client.vercel.app"], // Allow requests from the frontend
    })
  );
}

app.use(express.json()); // Parse JSON bodies
app.use(rateLimiter); // Apply rate limiting
app.use(logger); // Log requests

// Master Routes
app.use("/api/pcn", pcnRoutes);

// Error handling middleware
app.use(errorHandler);

// Swagger docs
swaggerDocs(app);

// Serve static files from the frontend build directory (Deployment)
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   // Serve the index.html file for any other routes
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
//   });
// }

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
