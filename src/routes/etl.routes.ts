/**
 * @fileoverview ETL routes
 * This file contains routes for ETL operations including processing QuickBooks,
 * Rootfi, and combined data sources.
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
 * /api/etl/quickbooks:
 *   post:
 *     summary: Process QuickBooks data
 *     description: Initiates ETL process for QuickBooks financial data
 *     tags: [ETL]
 *     responses:
 *       200:
 *         description: QuickBooks data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ETLResponse'
 *       400:
 *         description: Bad request - ETL process failed
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
router.post("/quickbooks", async (req, res) => {
  try {
    await financialApp.initialize();

    // Use default QuickBooks data URL
    const quickBooksUrl = process.env.QUICKBOOKS_URL || "";

    const result = await financialApp.processQuickBooksData(quickBooksUrl);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.results,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error("Error processing QuickBooks data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process QuickBooks data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/etl/rootfi:
 *   post:
 *     summary: Process Rootfi data
 *     description: Initiates ETL process for Rootfi financial data
 *     tags: [ETL]
 *     responses:
 *       200:
 *         description: Rootfi data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ETLResponse'
 *       400:
 *         description: Bad request - ETL process failed
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
router.post("/rootfi", async (req, res) => {
  try {
    await financialApp.initialize();

    // Use default Rootfi data URL
    const rootfiUrl = process.env.ROOTFI_URL || "";

    const result = await financialApp.processRootfiData(rootfiUrl);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.results,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error("Error processing Rootfi data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process Rootfi data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/etl/all:
 *   post:
 *     summary: Process both QuickBooks and Rootfi data
 *     description: Initiates ETL process for both QuickBooks and Rootfi financial data sources
 *     tags: [ETL]
 *     responses:
 *       200:
 *         description: All data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ETLResponse'
 *       400:
 *         description: Bad request - ETL process failed
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
router.post("/all", async (req, res) => {
  try {
    await financialApp.initialize();

    // Use default data URLs
    const quickBooksUrl = process.env.QUICKBOOKS_URL || "";
    const rootfiUrl = process.env.ROOTFI_URL || "";

    const result = await financialApp.processAllData(quickBooksUrl, rootfiUrl);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.results,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error("Error processing all data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process all data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
