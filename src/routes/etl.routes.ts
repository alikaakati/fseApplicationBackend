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
 * POST /api/etl/quickbooks
 * Process QuickBooks data
 */
router.post("/quickbooks", async (req, res) => {
  try {
    await financialApp.initialize();

    // Use default QuickBooks data URL
    const quickBooksUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/3e13a193-001b-4fb8-80cf-ea40eb3c5682/Income_Statement_Company_1.json?table=block&id=22a353cd-1af1-8006-bd9c-d33ec0b1f7cb&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=TAJ2Vz_Ko48vUXhWdS6npjCTFNAeEFkT5c7mPL5vlTw&downloadName=Income_Statement_Company_1.json";

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
 * POST /api/etl/rootfi
 * Process Rootfi data
 */
router.post("/rootfi", async (req, res) => {
  try {
    await financialApp.initialize();

    // Use default Rootfi data URL
    const rootfiUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/fea332be-907b-483b-a798-57c305fa8e7a/Income_Statement_Company_2.json?table=block&id=22a353cd-1af1-800c-9be7-fb79305c06fd&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=K-0moqniOb7PGpuQ8xIUbZj4CEA-tPJlC5Zg-WOfKtU&downloadName=Income_Statement_Company_2.json";

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
 * POST /api/etl/all
 * Process both QuickBooks and Rootfi data
 */
router.post("/all", async (req, res) => {
  try {
    await financialApp.initialize();

    // Use default data URLs
    const quickBooksUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/3e13a193-001b-4fb8-80cf-ea40eb3c5682/Income_Statement_Company_1.json?table=block&id=22a353cd-1af1-8006-bd9c-d33ec0b1f7cb&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=TAJ2Vz_Ko48vUXhWdS6npjCTFNAeEFkT5c7mPL5vlTw&downloadName=Income_Statement_Company_1.json";
    const rootfiUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/fea332be-907b-483b-a798-57c305fa8e7a/Income_Statement_Company_2.json?table=block&id=22a353cd-1af1-800c-9be7-fb79305c06fd&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=K-0moqniOb7PGpuQ8xIUbZj4CEA-tPJlC5Zg-WOfKtU&downloadName=Income_Statement_Company_2.json";

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
