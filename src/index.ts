/**
 * @fileoverview Application Entry Point
 * This file serves as the main entry point for the financial data ETL application.
 * It handles command line arguments and orchestrates the ETL process.
 */

import { FinancialDataApplication } from "./app";
import { join } from "path";

/**
 * Main application execution function
 * Handles command line arguments and orchestrates the ETL process
 */
async function main(): Promise<void> {
  const app = new FinancialDataApplication();

  try {
    // Initialize the application
    await app.initialize();

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    // Define data URLs
    const quickBooksUrl = process.env.QUICKBOOKS_URL || "";
    const rootfiUrl = process.env.ROOTFI_URL || "";

    let result;

    // Process based on command line arguments
    switch (command) {
      case "--quickbooks":
        console.log("🔄 Processing QuickBooks data only...");
        result = await app.processQuickBooksData(quickBooksUrl);
        break;

      case "--rootfi":
        console.log("🔄 Processing Rootfi data only...");
        result = await app.processRootfiData(rootfiUrl);
        break;

      case "--all":
      default:
        console.log("🔄 Processing all data sources...");
        result = await app.processAllData(quickBooksUrl, rootfiUrl);
        break;
    }

    if (result.success) {
      console.log("🎉 Application completed successfully!");
      console.log(`📊 ${result.message}`);
      if (result.results) {
        console.log(
          `📈 Processed: ${result.results.companies} companies, ${result.results.reportPeriods} periods, ${result.results.categories} categories, ${result.results.lineItems} line items`
        );
      }
    } else {
      console.error("💥 Application completed with errors");
      console.error(`❌ ${result.message}`);
      if (result.errors) {
        result.errors.forEach((error) => console.error(`  - ${error}`));
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Application failed:", error);
    process.exit(1);
  } finally {
    // Always try to shut down gracefully
    try {
      await app.shutdown();
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
    }
  }
}

// Run the application if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Unhandled error:", error);
    process.exit(1);
  });
}

// Export for use as a module
export { FinancialDataApplication };
