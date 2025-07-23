/**
 * @fileoverview Unified ETL Service
 * This service orchestrates the processing of both QuickBooks and Rootfi data,
 * providing a unified interface for data extraction, transformation, and loading.
 */

import {
  QuickBooksData,
  RootfiData,
  PeriodData,
  FINANCIAL_CATEGORY_KEYS,
} from "../../interfaces/financial-data.interface";
import { ETLResult, ETLConfig } from "../../interfaces/etl.interface";
import { QuickBooksETLService } from "./quickbooks-etl.service";
import { RootfiETLService } from "./rootfi-etl.service";
import { DatabaseService } from "../database/database.service";
import { fetchJsonFromUrl } from "../../utils/helpers/http.utils";

/**
 * Unified ETL Service class
 * Orchestrates the processing of multiple data sources
 */
export class UnifiedETLService {
  private readonly quickBooksETL: QuickBooksETLService;
  private readonly rootfiETL: RootfiETLService;
  private readonly databaseService: DatabaseService;
  private readonly config: ETLConfig;

  constructor(config: ETLConfig) {
    this.quickBooksETL = new QuickBooksETLService();
    this.rootfiETL = new RootfiETLService();
    this.databaseService = new DatabaseService();
    this.config = config;
  }

  /**
   * Loads QuickBooks data from URL
   * @param url - URL to the QuickBooks JSON data
   * @returns QuickBooks data object
   */
  private async loadQuickBooksData(url: string): Promise<QuickBooksData> {
    try {
      return await fetchJsonFromUrl<QuickBooksData>(url);
    } catch (error) {
      throw new Error(`Failed to load QuickBooks data: ${error}`);
    }
  }

  /**
   * Loads Rootfi data from URL
   * @param url - URL to the Rootfi JSON data
   * @returns Rootfi data object
   */
  private async loadRootfiData(url: string): Promise<RootfiData> {
    try {
      return await fetchJsonFromUrl<RootfiData>(url);
    } catch (error) {
      throw new Error(`Failed to load Rootfi data: ${error}`);
    }
  }

  /**
   * Processes QuickBooks data and saves to database
   * @param dataUrl - URL to the QuickBooks data
   * @returns ETL result
   */
  public async processQuickBooksData(dataUrl: string): Promise<ETLResult> {
    try {
      if (this.config.enableLogging) {
        console.log("🔄 Processing QuickBooks data...");
      }

      const quickBooksData = await this.loadQuickBooksData(dataUrl);
      const periodData = this.quickBooksETL.transformData(quickBooksData);

      const result = await this.databaseService.saveCompanyData(
        "CompanyA",
        periodData
      );

      if (this.config.enableLogging) {
        console.log("✅ QuickBooks data processing completed");
      }

      return {
        success: true,
        message: "QuickBooks data processed successfully",
        results: result,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: `QuickBooks data processing failed: ${error}`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Processes Rootfi data and saves to database
   * @param dataUrl - URL to the Rootfi data
   * @returns ETL result
   */
  public async processRootfiData(dataUrl: string): Promise<ETLResult> {
    try {
      if (this.config.enableLogging) {
        console.log("🔄 Processing Rootfi data...");
      }

      const rootfiData = await this.loadRootfiData(dataUrl);

      if (!this.rootfiETL.validateData(rootfiData)) {
        throw new Error("Invalid Rootfi data structure");
      }

      const periodData = this.rootfiETL.transformData(rootfiData);
      const result = await this.databaseService.saveCompanyData(
        "CompanyB",
        periodData
      );

      if (this.config.enableLogging) {
        console.log("✅ Rootfi data processing completed");
      }

      return {
        success: true,
        message: "Rootfi data processed successfully",
        results: result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Rootfi data processing failed: ${error}`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Processes both QuickBooks and Rootfi data
   * @param quickBooksUrl - URL to QuickBooks data
   * @param rootfiUrl - URL to Rootfi data
   * @returns ETL result
   */
  public async processAllData(
    quickBooksUrl: string,
    rootfiUrl: string
  ): Promise<ETLResult> {
    try {
      if (this.config.enableLogging) {
        console.log("🚀 Starting unified data processing...");
      }

      const quickBooksResult = await this.processQuickBooksData(quickBooksUrl);
      const rootfiResult = await this.processRootfiData(rootfiUrl);

      if (!quickBooksResult.success || !rootfiResult.success) {
        return {
          success: false,
          message: "Unified data processing failed",
          errors: [
            ...(quickBooksResult.errors || []),
            ...(rootfiResult.errors || []),
          ],
        };
      }

      const combinedResults = {
        companies:
          (quickBooksResult.results?.companies || 0) +
          (rootfiResult.results?.companies || 0),
        reportPeriods:
          (quickBooksResult.results?.reportPeriods || 0) +
          (rootfiResult.results?.reportPeriods || 0),
        categories:
          (quickBooksResult.results?.categories || 0) +
          (rootfiResult.results?.categories || 0),
        lineItems:
          (quickBooksResult.results?.lineItems || 0) +
          (rootfiResult.results?.lineItems || 0),
      };

      if (this.config.enableLogging) {
        console.log("✅ Unified data processing completed successfully");
      }

      return {
        success: true,
        message: "All data processed successfully",
        results: combinedResults,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: `Unified data processing failed: ${error}`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Gets processing statistics
   * @returns Statistics about the processed data
   */
  public async getStatistics(): Promise<ETLResult> {
    try {
      const stats = await this.databaseService.getStatistics();

      return {
        success: true,
        message: "Statistics retrieved successfully",
        results: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve statistics: ${error}`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
