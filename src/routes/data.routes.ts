/**
 * @fileoverview Data management routes
 * This file contains routes for data operations including statistics,
 * data clearing, and company information.
 */

import { Router } from "express";
import { FinancialDataApplication } from "../app";

const router = Router();

/**
 * Initialize the financial data application
 */
const financialApp = new FinancialDataApplication();

/**
 * GET /api/statistics
 * Get current database statistics
 */
router.get("/statistics", async (req, res) => {
  try {
    await financialApp.initialize();
    const stats = await financialApp.displayStatistics();
    res.json({
      success: true,
      data: stats,
      message: "Statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/data/refresh
 * Clear all data from the database and re-fetch from URLs
 */
router.post("/refresh", async (req, res) => {
  try {
    await financialApp.initialize();

    // Clear all existing data
    await financialApp.clearAllData();

    // Define data URLs
    const quickBooksUrl = process.env.QUICKBOOKS_URL || "";
    const rootfiUrl = process.env.ROOTFI_URL || "";

    // Re-fetch and process all data
    const result = await financialApp.processAllData(quickBooksUrl, rootfiUrl);

    if (result.success) {
      res.json({
        success: true,
        message: "Data refreshed successfully",
        data: result.results,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to refresh data",
        message: result.message,
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error("Error refreshing data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to refresh data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/companies
 * Get all companies with their data
 */
router.get("/companies", async (req, res) => {
  try {
    await financialApp.initialize();

    // This would need to be implemented in the FinancialDataApplication
    // For now, return a placeholder response
    res.json({
      success: true,
      message: "Companies endpoint - to be implemented",
      data: [],
    });
  } catch (error) {
    console.error("Error getting companies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get companies",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/report-dates
 * Get all report dates
 */
router.get("/report-dates", async (req, res) => {
  try {
    await financialApp.initialize();
    const reportDates = await financialApp.getReportDates();
    res.json({
      success: true,
      data: reportDates,
      message: "Report dates retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting report dates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve report dates",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/categories/:reportPeriodId
 * Get all categories with their line items by report period ID
 */
router.get("/categories/:reportPeriodId", async (req, res) => {
  try {
    await financialApp.initialize();
    const reportPeriodId = parseInt(req.params.reportPeriodId);

    if (isNaN(reportPeriodId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid report period ID",
        message: "Report period ID must be a valid number",
      });
    }

    const categories = await financialApp.getCategoriesByReportPeriod(
      reportPeriodId
    );
    res.json({
      success: true,
      data: categories,
      message: "Categories retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve categories",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
