/**
 * @fileoverview Express Server with REST API Routes
 * This file sets up an Express server with REST API endpoints for ETL operations,
 * including processing QuickBooks data, Rootfi data, both data sources, and clearing the database.
 */

import express from "express";
import cors from "cors";
import { initializeDatabase, closeDatabase } from "./database/data-source";
import { appConfig } from "./config/database.config";
import { healthRoutes, etlRoutes, dataRoutes } from "./routes";

/**
 * Express application instance
 */
const app = express();

/**
 * Middleware configuration
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Route registration
 */
app.use("/health", healthRoutes);
app.use("/api/etl", etlRoutes);
app.use("/api/data", dataRoutes);

/**
 * Error handling middleware
 */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
);

/**
 * 404 handler for undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`,
  });
});

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    const port = appConfig.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`📈 API Base URL: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async () => {
  console.log("\n🔄 Shutting down server gracefully...");
  try {
    await closeDatabase();
    console.log("✅ Server shut down successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start the server if this file is executed directly
if (require.main === module) {
  startServer();
}

export { app, startServer };
