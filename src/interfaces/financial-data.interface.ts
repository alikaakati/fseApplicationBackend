/**
 * @fileoverview Financial data interfaces for different data sources
 * This file contains all interfaces related to financial data structures,
 * including QuickBooks and Rootfi data formats, as well as unified data structures.
 */

/**
 * QuickBooks data structure interface
 */
export interface QuickBooksData {
  data: {
    Header: {
      Time: string;
      ReportName: string;
      ReportBasis: string;
      StartPeriod: string;
      EndPeriod: string;
      SummarizeColumnsBy: string;
      Currency: string;
      Option: Array<{ Name: string; Value: string }>;
    };
    Columns: {
      Column: Array<{
        ColTitle: string;
        ColType: string;
        MetaData: Array<{ Name: string; Value: string }>;
      }>;
    };
    Rows: {
      Row: Array<{
        type: string;
        group: string;
        ColData: Array<{ value: string; id?: string }>;
        Rows?: {
          Row: Array<{
            type: string;
            group: string;
            ColData: Array<{ value: string; id?: string }>;
            Rows?: {
              Row: Array<{
                type: string;
                group: string;
                ColData: Array<{ value: string; id?: string }>;
              }>;
            };
            Summary?: {
              ColData: Array<{ value: string }>;
            };
          }>;
        };
        Summary?: {
          ColData: Array<{ value: string }>;
        };
      }>;
    };
  };
}

/**
 * Rootfi line item interface
 */
export interface RootfiLineItem {
  name: string;
  value: number;
  account_id: string;
}

/**
 * Rootfi category interface
 */
export interface RootfiCategory {
  name: string;
  value: number;
  line_items: RootfiLineItem[];
}

/**
 * Rootfi period interface
 */
export interface RootfiPeriod {
  rootfi_id: number;
  rootfi_created_at: string;
  rootfi_updated_at: string;
  rootfi_deleted_at: string | null;
  rootfi_company_id: number;
  platform_id: string;
  platform_unique_id: string | null;
  currency_id: string | null;
  period_end: string;
  period_start: string;
  revenue: RootfiCategory[];
  cost_of_goods_sold: RootfiCategory[];
  gross_profit: number;
  operating_expenses: RootfiCategory[];
  operating_profit: number;
  non_operating_revenue: RootfiCategory[];
  non_operating_expenses: RootfiCategory[];
  earnings_before_taxes: number | null;
  taxes: number | null;
  net_profit: number;
  custom_fields: any | null;
  updated_at: string | null;
}

/**
 * Rootfi data structure interface
 */
export interface RootfiData {
  data: RootfiPeriod[];
}

/**
 * Unified period data interface for standardized financial data
 */
export interface PeriodData {
  company_id: number;
  startDate: string;
  endDate: string;
  income?: number;
  cogs?: number;
  gross_profit?: number;
  expenses?: number;
  operating_income?: number;
  other_income?: number;
  other_expenses?: number;
  net_other_income?: number;
  net_income?: number;
  taxes?: number;
  lineItems?: Record<string, any>;
  [key: string]: string | number | object | undefined; // Allow dynamic keys
}

/**
 * Financial category keys for mapping
 */
export const FINANCIAL_CATEGORY_KEYS: string[] = [
  "income",
  "cogs",
  "gross_profit",
  "expenses",
  "operating_income",
  "other_income",
  "other_expenses",
  "net_other_income",
  "net_income",
];

/**
 * Unified financial group types
 */
export type UnifiedFinancialGroup =
  | "Income"
  | "COGS"
  | "GrossProfit"
  | "Expenses"
  | "NetOperatingIncome"
  | "OtherIncome"
  | "OtherExpenses"
  | "NetOtherIncome"
  | "NetIncome"
  | "Taxes";
