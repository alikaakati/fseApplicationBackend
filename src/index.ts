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
    const quickBooksUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/3e13a193-001b-4fb8-80cf-ea40eb3c5682/Income_Statement_Company_1.json?table=block&id=22a353cd-1af1-8006-bd9c-d33ec0b1f7cb&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=TAJ2Vz_Ko48vUXhWdS6npjCTFNAeEFkT5c7mPL5vlTw&downloadName=Income_Statement_Company_1.json";
    const rootfiUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/fea332be-907b-483b-a798-57c305fa8e7a/Income_Statement_Company_2.json?table=block&id=22a353cd-1af1-800c-9be7-fb79305c06fd&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=K-0moqniOb7PGpuQ8xIUbZj4CEA-tPJlC5Zg-WOfKtU&downloadName=Income_Statement_Company_2.json";

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
