/**
 * @fileoverview Rootfi ETL Service
 * This service handles the extraction, transformation, and loading of Rootfi data
 * into the application's database.
 */

import {
  RootfiData,
  PeriodData,
} from "../../interfaces/financial-data.interface";
import {
  ReportDate,
  ROOTFI_UNIFIED_KEYS,
} from "../../interfaces/etl.interface";
import { cleanLineItemTitles } from "../../utils/helpers/text.utils";
import { isValidNumber } from "../../utils/helpers/validation.utils";

/**
 * Rootfi ETL Service class
 * Handles the processing of Rootfi financial data
 */
export class RootfiETLService {
  private readonly defaultCompanyId: number = 2;

  /**
   * Extracts report dates from Rootfi data
   * @param rootfiData - The Rootfi data to process
   * @returns Array of report dates
   */
  public getReportDates(rootfiData: RootfiData): ReportDate[] {
    return rootfiData.data.map((period) => ({
      startDate: period.period_start,
      endDate: period.period_end,
    }));
  }

  /**
   * Transforms Rootfi data into unified period data
   * @param rootfiData - The Rootfi data to transform
   * @returns Array of unified period data
   */
  public transformData(rootfiData: RootfiData): PeriodData[] {
    return rootfiData.data.map((period) => {
      const periodData: PeriodData = {
        startDate: period.period_start,
        endDate: period.period_end,
        company_id: this.defaultCompanyId,
      };

      // Process each financial category
      for (const [originalKey, unifiedKey] of Object.entries(
        ROOTFI_UNIFIED_KEYS
      )) {
        const value = period[originalKey as keyof typeof period];

        if (!periodData.lineItems) {
          periodData.lineItems = {};
        }

        if (Array.isArray(value)) {
          // Handle array values (categories with line items)
          const totalValue = value.reduce(
            (acc, curr) => acc + (curr.value || 0),
            0
          );

          periodData[unifiedKey] = totalValue;

          // Process line items within the category
          (periodData.lineItems as Record<string, any>)[unifiedKey] =
            value[0]?.line_items?.map((item: any) => ({
              key: cleanLineItemTitles(item.name),
              value: item.value,
              originalName: item.name,
            })) || [];
        } else if (isValidNumber(value)) {
          // Handle numeric values
          periodData[unifiedKey] = value;
        } else {
          // Default to 0 for invalid or missing values
          periodData[unifiedKey] = 0;
        }
      }

      return periodData;
    });
  }

  /**
   * Validates Rootfi data structure
   * @param rootfiData - The Rootfi data to validate
   * @returns True if the data is valid
   */
  public validateData(rootfiData: RootfiData): boolean {
    if (!rootfiData || !Array.isArray(rootfiData.data)) {
      return false;
    }

    return rootfiData.data.every((period) => {
      return (
        period.period_start &&
        period.period_end &&
        isValidNumber(period.rootfi_company_id)
      );
    });
  }

  /**
   * Gets statistics about the Rootfi data
   * @param rootfiData - The Rootfi data to analyze
   * @returns Statistics object
   */
  public getDataStatistics(rootfiData: RootfiData): {
    totalPeriods: number;
    dateRange: { start: string; end: string };
    companies: number[];
  } {
    if (!rootfiData.data.length) {
      return {
        totalPeriods: 0,
        dateRange: { start: "", end: "" },
        companies: [],
      };
    }

    const dates = rootfiData.data.map((p) => new Date(p.period_start));
    const companies = [
      ...new Set(rootfiData.data.map((p) => p.rootfi_company_id)),
    ];

    return {
      totalPeriods: rootfiData.data.length,
      dateRange: {
        start: new Date(Math.min(...dates.map((d) => d.getTime())))
          .toISOString()
          .split("T")[0],
        end: new Date(Math.max(...dates.map((d) => d.getTime())))
          .toISOString()
          .split("T")[0],
      },
      companies,
    };
  }
}
