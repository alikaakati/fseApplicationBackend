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
    const companies = await financialApp.getCompanies();
    res.json({
      success: true,
      data: companies,
      message: "Companies retrieved successfully",
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
 * /api/data/categories/by-date-range:
 *   get:
 *     summary: Get categories by date range with merging
 *     description: Retrieves all categories with their line items for report periods matching the specified start and end dates. Categories with the same name are merged (values summed, line items concatenated).
 *     tags: [Data]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date to match (YYYY-MM-DD format)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date to match (YYYY-MM-DD format)
 *     responses:
 *       200:
 *         description: Categories retrieved and merged successfully
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
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Merged category ID
 *                       name:
 *                         type: string
 *                         description: Category name
 *                       value:
 *                         type: number
 *                         description: Summed value from all matching categories
 *                       categoryType:
 *                         type: string
 *                         description: Category type
 *                       lineItems:
 *                         type: array
 *                         description: Concatenated line items from all matching categories
 *                       reportPeriods:
 *                         type: array
 *                         description: Report periods that were merged
 *                       companies:
 *                         type: array
 *                         description: Companies associated with the merged categories
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved and merged successfully"
 *       400:
 *         description: Bad request - invalid date format or missing parameters
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
router.get("/categories/by-date-range", async (req, res) => {
  try {
    await financialApp.initialize();
    const { startDate, endDate } = req.query;
    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        message: "Both startDate and endDate are required",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (
      !dateRegex.test(startDate as string) ||
      !dateRegex.test(endDate as string)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format",
        message: "Dates must be in YYYY-MM-DD format",
      });
    }

    const categories = await financialApp.getCategoriesByDateRange(
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: categories,
      message: "Categories retrieved and merged successfully",
    });
  } catch (error) {
    console.error("Error getting categories by date range:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve categories by date range",
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

/**
 * @swagger
 * /api/data/companies/{companyId}/income-by-year:
 *   get:
 *     summary: Get income data for a specific company grouped by year
 *     description: Retrieves income data for a specific company, grouped by year and formatted for chart rendering
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company
 *     responses:
 *       200:
 *         description: Income data retrieved successfully
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
 *                     properties:
 *                       periodStart:
 *                         type: string
 *                         format: date
 *                         description: Period start date
 *                         example: "2023-01-01"
 *                       periodEnd:
 *                         type: string
 *                         format: date
 *                         description: Period end date
 *                         example: "2023-01-31"
 *                       income:
 *                         type: number
 *                         description: Income value for this period
 *                         example: 125000.00
 *                 message:
 *                   type: string
 *                   example: "Income data retrieved successfully"
 *       400:
 *         description: Bad request - invalid company ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Company not found
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
router.get("/companies/:companyId/income-by-year", async (req, res) => {
  try {
    await financialApp.initialize();
    const companyId = parseInt(req.params.companyId);

    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid company ID",
        message: "Company ID must be a valid number",
      });
    }

    const incomeData = await financialApp.getCompanyIncomeByYear(companyId);

    res.json({
      success: true,
      data: incomeData,
      message: "Income data retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting company income by year:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve income data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
