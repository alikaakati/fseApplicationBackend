/**
 * @fileoverview ETL (Extract, Transform, Load) interfaces and types
 * This file contains all interfaces and types related to the ETL process,
 * including data transformation, processing results, and ETL operations.
 */

import { PeriodData } from "./financial-data.interface";

/**
 * Report date interface for period data
 */
export interface ReportDate {
  startDate: string;
  endDate: string;
}

/**
 * QuickBooks group interface
 */
export interface QuickBooksGroup {
  name: string;
  type: "Group";
}

/**
 * Line item data interface for processing
 */
export interface LineItemData {
  lineItem: string;
  originalName: string;
  group: string;
  valuesArray?: any[];
  type: "normal" | "summary" | "total";
}

/**
 * Line type enumeration
 */
export type LineType = "normal" | "summary" | "total";

/**
 * ETL processing result interface
 */
export interface ETLResult {
  success: boolean;
  message?: string;
  results?: {
    companies: number;
    reportPeriods: number;
    categories: number;
    lineItems: number;
  };
  errors?: string[];
}

/**
 * ETL operation interface
 */
export interface ETLOperation {
  name: string;
  execute: () => Promise<ETLResult>;
}

/**
 * Data source mapping interface
 */
export interface DataSourceMapping {
  [key: string]: keyof PeriodData;
}

/**
 * QuickBooks unified keys mapping
 */
export const QUICKBOOKS_UNIFIED_KEYS: Record<string, keyof PeriodData> = {
  Income: "income",
  COGS: "cogs",
  GrossProfit: "gross_profit",
  Expenses: "expenses",
  NetOperatingIncome: "operating_income",
  OtherIncome: "other_income",
  OtherExpenses: "other_expenses",
  NetOtherIncome: "net_other_income",
  NetIncome: "net_income",
} as const;

/**
 * Rootfi unified keys mapping
 */
export const ROOTFI_UNIFIED_KEYS: Record<string, keyof PeriodData> = {
  revenue: "income",
  cost_of_goods_sold: "cogs",
  gross_profit: "gross_profit",
  operating_expenses: "expenses",
  operating_profit: "operating_income",
  non_operating_revenue: "other_income",
  non_operating_expenses: "other_expenses",
  earnings_before_taxes: "net_other_income",
  taxes: "taxes",
  net_profit: "net_income",
} as const;

/**
 * ETL configuration interface
 */
export interface ETLConfig {
  defaultCompanyId: number;
  defaultGroup: string;
  enableLogging: boolean;
  batchSize: number;
}
