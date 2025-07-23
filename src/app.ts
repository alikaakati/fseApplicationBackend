/**
 * @fileoverview Main Application Entry Point
 * This file serves as the main entry point for the financial data processing application.
 * It orchestrates the ETL process, database operations, and provides a clean interface
 * for processing financial data from multiple sources.
 */

import { initializeDatabase, closeDatabase } from "./database/data-source";
import { UnifiedETLService } from "./services/etl/unified-etl.service";
import { DatabaseService } from "./services/database/database.service";
import { etlConfig } from "./config/database.config";
import { ETLResult } from "./interfaces/etl.interface";
import { join } from "path";
import { DatabaseStatistics } from "./interfaces";

/**
 * Main Application class
 * Orchestrates the entire financial data processing workflow
 */
export class FinancialDataApplication {
  private readonly etlService: UnifiedETLService;
  private readonly databaseService: DatabaseService;

  constructor() {
    this.etlService = new UnifiedETLService(etlConfig);
    this.databaseService = new DatabaseService();
  }

  /**
   * Initializes the application
   */
  public async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing Financial Data Application...");
      await initializeDatabase();
      console.log("✅ Application initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      throw error;
    }
  }

  /**
   * Processes QuickBooks data
   * @param dataPath - Path to the QuickBooks data file
   * @returns ETL result
   */
  public async processQuickBooksData(dataPath: string): Promise<ETLResult> {
    try {
      console.log("📊 Processing QuickBooks data...");
      const result = await this.etlService.processQuickBooksData(dataPath);

      if (result.success) {
        console.log("✅ QuickBooks data processing completed successfully");
        await this.displayStatistics();
      } else {
        console.error("❌ QuickBooks data processing failed:", result.message);
      }

      return result;
    } catch (error) {
      console.error("❌ Error processing QuickBooks data:", error);
      throw error;
    }
  }

  /**
   * Processes Rootfi data
   * @param dataPath - Path to the Rootfi data file
   * @returns ETL result
   */
  public async processRootfiData(dataPath: string): Promise<ETLResult> {
    try {
      console.log("📊 Processing Rootfi data...");
      const result = await this.etlService.processRootfiData(dataPath);

      if (result.success) {
        console.log("✅ Rootfi data processing completed successfully");
        await this.displayStatistics();
      } else {
        console.error("❌ Rootfi data processing failed:", result.message);
      }

      return result;
    } catch (error) {
      console.error("❌ Error processing Rootfi data:", error);
      throw error;
    }
  }

  /**
   * Processes all data sources
   * @param quickBooksPath - Path to QuickBooks data file
   * @param rootfiPath - Path to Rootfi data file
   * @returns ETL result
   */
  public async processAllData(
    quickBooksPath: string,
    rootfiPath: string
  ): Promise<ETLResult> {
    try {
      console.log("🔄 Starting unified data processing...");
      const result = await this.etlService.processAllData(
        quickBooksPath,
        rootfiPath
      );

      if (result.success) {
        console.log("✅ All data processing completed successfully");
        await this.displayStatistics();
      } else {
        console.error("❌ Data processing failed:", result.message);
        if (result.errors) {
          result.errors.forEach((error) => console.error(`  - ${error}`));
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Error processing all data:", error);
      throw error;
    }
  }

  /**
   * Displays current database statistics
   */
  public async displayStatistics(): Promise<DatabaseStatistics | null> {
    try {
      const stats = await this.databaseService.getStatistics();

      console.log("\n📈 Database Statistics:");
      console.log("=======================");
      console.log(`🏢 Companies: ${stats.companies}`);
      console.log(`📅 Report Periods: ${stats.reportPeriods}`);
      console.log(`📊 Financial Categories: ${stats.categories}`);
      console.log(`📋 Line Items: ${stats.lineItems}`);
      console.log("=======================\n");
      return stats;
    } catch (error) {
      console.error("❌ Error displaying statistics:", error);
      return null;
    }
  }

  /**
   * Clears all data from the database
   */
  public async clearAllData(): Promise<void> {
    try {
      console.log("🗑️ Clearing all data from database...");
      await this.databaseService.clearAllData();
      console.log("✅ All data cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      throw error;
    }
  }

  /**
   * Gets all report dates
   */
  public async getReportDates(): Promise<any[]> {
    try {
      console.log("📅 Getting all report dates...");
      const reportDates = await this.databaseService.getReportDates();
      console.log(`✅ Retrieved ${reportDates.length} report dates`);
      return reportDates;
    } catch (error) {
      console.error("❌ Error getting report dates:", error);
      throw error;
    }
  }

  /**
   * Gets categories with their line items by report period ID
   */
  public async getCategoriesByReportPeriod(
    reportPeriodId: number
  ): Promise<any[]> {
    try {
      console.log(
        `📊 Getting categories for report period ${reportPeriodId}...`
      );
      const categories = await this.databaseService.getCategoriesByReportPeriod(
        reportPeriodId
      );
      console.log(
        `✅ Retrieved ${categories.length} categories for report period ${reportPeriodId}`
      );
      return categories;
    } catch (error) {
      console.error("❌ Error getting categories by report period:", error);
      throw error;
    }
  }

  /**
   * Shuts down the application gracefully
   */
  public async shutdown(): Promise<void> {
    try {
      console.log("🔄 Shutting down application...");
      await closeDatabase();
      console.log("✅ Application shut down successfully");
    } catch (error) {
      console.error("❌ Error shutting down application:", error);
      throw error;
    }
  }
}

/**
 * Main application execution function
 */
async function main(): Promise<void> {
  const app = new FinancialDataApplication();

  try {
    // Initialize the application
    await app.initialize();

    // Define data URLs
    const quickBooksUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/3e13a193-001b-4fb8-80cf-ea40eb3c5682/Income_Statement_Company_1.json?table=block&id=22a353cd-1af1-8006-bd9c-d33ec0b1f7cb&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=TAJ2Vz_Ko48vUXhWdS6npjCTFNAeEFkT5c7mPL5vlTw&downloadName=Income_Statement_Company_1.json";
    const rootfiUrl =
      "https://file.notion.so/f/f/341ba97f-38cd-4258-82a9-94cc0df05d13/fea332be-907b-483b-a798-57c305fa8e7a/Income_Statement_Company_2.json?table=block&id=22a353cd-1af1-800c-9be7-fb79305c06fd&spaceId=341ba97f-38cd-4258-82a9-94cc0df05d13&expirationTimestamp=1753221600000&signature=K-0moqniOb7PGpuQ8xIUbZj4CEA-tPJlC5Zg-WOfKtU&downloadName=Income_Statement_Company_2.json";

    // Process all data
    const result = await app.processAllData(quickBooksUrl, rootfiUrl);

    if (result.success) {
      console.log("🎉 Application completed successfully!");
    } else {
      console.error("💥 Application completed with errors");
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
