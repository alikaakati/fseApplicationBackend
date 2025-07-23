/**
 * @fileoverview Database configuration
 * This file contains the database configuration settings and environment variable handling
 * for the application's database connection.
 */

import { Company } from "../database/entities/company.entity";
import { ReportPeriod } from "../database/entities/report-period.entity";
import { FinancialCategory } from "../database/entities/financial-category.entity";
import { FinancialLineItem } from "../database/entities/financial-line-item.entity";

/**
 * Database configuration object
 * Uses environment variables with fallback defaults for development
 */
export const databaseConfig = {
  type: "postgres",

  url: process.env.DB_URL,
  synchronize: false,
  logging: process.env.DB_LOGGING === "true",
  entities: [Company, ReportPeriod, FinancialCategory, FinancialLineItem],
};
/**
 * Default ETL configuration
 */
export const etlConfig = {
  defaultCompanyId: 1,
  defaultGroup: "Ungrouped",
  enableLogging: true,
  batchSize: 100,
};

/**
 * Application configuration
 */
export const appConfig = {
  port: parseInt("3001"),
  environment: process.env.NODE_ENV || "development",
  enableCors: process.env.ENABLE_CORS === "true",
};
