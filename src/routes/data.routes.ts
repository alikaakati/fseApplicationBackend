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
 * @swagger
 * /api/data/statistics:
 *   get:
 *     summary: Get current database statistics
 *     description: Retrieves statistics about the current data in the database
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Database statistics
 *                 message:
 *                   type: string
 *                   example: "Statistics retrieved successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/data/refresh:
 *   post:
 *     summary: Clear all data and re-fetch from URLs
 *     description: Clears all existing data from the database and re-fetches from configured URLs
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: Data refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ETLResponse'
 *       400:
 *         description: Bad request - refresh process failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/data/companies:
 *   get:
 *     summary: Get all companies with their data
 *     description: Retrieves all companies and their associated financial data
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Companies endpoint - to be implemented"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/data/report-dates:
 *   get:
 *     summary: Get all report dates
 *     description: Retrieves all available report dates from the database
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: Report dates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *                   example: "Report dates retrieved successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/data/categories/{reportPeriodId}:
 *   get:
 *     summary: Get categories by report period ID
 *     description: Retrieves all categories with their line items for a specific report period
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: reportPeriodId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the report period
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *       400:
 *         description: Bad request - invalid report period ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
