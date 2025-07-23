/**
 * @fileoverview Health check routes
 * This file contains routes for health monitoring and system status.
 */

import { Router } from "express";

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get("/", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Financial Data ETL Backend",
  });
});

export default router;
