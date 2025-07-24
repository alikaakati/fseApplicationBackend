/**
 * @fileoverview QuickBooks ETL Service
 * This service handles the extraction, transformation, and loading of QuickBooks data
 * into the application's database.
 */

import {
  QuickBooksData,
  PeriodData,
} from "../../interfaces/financial-data.interface";
import {
  ReportDate,
  QuickBooksGroup,
  LineItemData,
  LineType,
  QUICKBOOKS_UNIFIED_KEYS,
} from "../../interfaces/etl.interface";
import { isValidNumber } from "../../utils/helpers/validation.utils";

/**
 * QuickBooks ETL Service class
 * Handles the processing of QuickBooks financial data
 */
export class QuickBooksETLService {
  private readonly defaultCompanyId: number = 1;
  private readonly defaultGroup: string = "Ungrouped";

  /**
   * Extracts report dates from QuickBooks data columns
   * @param quickBooksData - The QuickBooks data to process
   * @returns Array of report dates
   */
  public getReportDates(quickBooksData: QuickBooksData): ReportDate[] {
    const columns = quickBooksData.data.Columns.Column;
    const reportDates: ReportDate[] = [];

    columns.forEach((col) => {
      if (col.ColType === "Money" && col.MetaData) {
        const startMeta = col.MetaData.find((m) => m.Name === "StartDate");
        const endMeta = col.MetaData.find((m) => m.Name === "EndDate");

        if (startMeta && endMeta) {
          reportDates.push({
            startDate: startMeta.Value,
            endDate: endMeta.Value,
          });
        }
      }
    });

    return reportDates;
  }

  /**
   * Extracts groups from QuickBooks data rows
   * @param quickBooksData - The QuickBooks data to process
   * @returns Array of QuickBooks groups
   */
  public getGroups(quickBooksData: QuickBooksData): QuickBooksGroup[] {
    return quickBooksData.data.Rows.Row.filter(
      (row) => row.group && (row.Rows?.Row?.length || 0) > 0
    ).map((row) => ({ name: row.group, type: "Group" as const }));
  }

  /**
   * Determines the type of a line item based on its label
   * @param label - The line item label
   * @returns The line type
   */
  private determineLineType(label: string): LineType {
    const lower = label.trim().toLowerCase();

    if (lower.startsWith("summary")) return "summary";
    if (lower.startsWith("net")) return "summary";
    if (lower.startsWith("total ")) return "total";

    return "normal";
  }

  /**
   * Creates a line item data object from column data
   * @param colData - The column data
   * @param group - The group name
   * @returns Line item data object
   */
  private createLineItemFromColData(
    colData: any[],
    group: string
  ): LineItemData {
    const lineItem = colData[0]?.value || "";
    const type = this.determineLineType(lineItem);
    const valuesArray = colData.slice(1).map((col) => col.value);

    return {
      lineItem: lineItem,
      group,
      valuesArray,
      type,
    };
  }

  /**
   * Extracts line items from QuickBooks data
   * @param quickBooksData - The QuickBooks data to process
   * @returns Array of line item data
   */
  public getLineItems(quickBooksData: QuickBooksData): LineItemData[] {
    const lineItems: LineItemData[] = [];

    const traverse = (rows: any[], parentGroup: string): void => {
      rows.forEach((row) => {
        if (row.ColData && row.ColData.length > 0) {
          const lineItem = this.createLineItemFromColData(
            row.ColData,
            parentGroup
          );

          // Only add normal line items (not summaries or totals)
          if (lineItem.type === "normal") {
            lineItems.push(lineItem);
          }
        }

        if (row.Rows?.Row) {
          traverse(row.Rows.Row, parentGroup);
        }
      });
    };

    quickBooksData.data.Rows.Row.forEach((row) => {
      if (row.group) {
        if (row.Rows?.Row) {
          traverse(row.Rows.Row, row.group);
        }
      } else {
        traverse([row], this.defaultGroup);
      }
    });

    return lineItems;
  }

  /**
   * Processes summary data from QuickBooks rows
   * @param rows - The rows to process
   * @param resultsByDate - The results by date array
   * @param unifiedKeys - The unified keys mapping
   */
  private processSummaryData(
    rows: any[],
    resultsByDate: PeriodData[],
    unifiedKeys: Record<string, keyof PeriodData>
  ): void {
    rows.forEach((row) => {
      if (row.Summary?.ColData && row.group) {
        // Check if the group matches a unified key
        const unifiedKey = unifiedKeys[row.group];
        if (unifiedKey) {
          // Skip the first value (label) and process each period's value
          const summaryValues = row.Summary.ColData.slice(1); // Skip the first element (label)

          summaryValues.forEach((colData: any, index: number) => {
            const summaryValue = parseFloat(colData?.value || "0");
            if (isValidNumber(summaryValue) && index < resultsByDate.length) {
              resultsByDate[index][unifiedKey] = summaryValue;
            }
          });
        }
      }
    });
  }

  /**
   * Processes line items and maps them to period data
   * @param lineItems - The line items to process
   * @param resultsByDate - The results by date array
   * @param unifiedKeys - The unified keys mapping
   */
  private processLineItems(
    lineItems: LineItemData[],
    resultsByDate: PeriodData[],
    unifiedKeys: Record<string, keyof PeriodData>
  ): void {
    try {
      lineItems.forEach((item) => {
        if (item.valuesArray && item.type === "normal") {
          // Map based on the group (category) rather than the individual line item name
          let unifiedKey: keyof PeriodData | undefined;

          // Try to find a matching key based on the group name
          if (unifiedKeys[item.group]) {
            unifiedKey = unifiedKeys[item.group];
          } else {
            // Try case-insensitive match for group name
            const lowerGroupName = item.group.toLowerCase();
            for (const [key, value] of Object.entries(unifiedKeys)) {
              if (key.toLowerCase() === lowerGroupName) {
                unifiedKey = value;
                break;
              }
            }
          }

          if (unifiedKey) {
            resultsByDate.forEach((period, index) => {
              const value = parseFloat(item.valuesArray![index] || "0");
              if (isValidNumber(value)) {
                if (!period.lineItems) {
                  period.lineItems = {};
                }

                // Initialize the array if it doesn't exist
                if (!(period.lineItems as Record<string, any>)[unifiedKey]) {
                  (period.lineItems as Record<string, any>)[unifiedKey] = [];
                }

                // Add the line item to the array
                (period.lineItems as Record<string, any>)[unifiedKey].push({
                  key: item.lineItem,
                  value,
                });
              }
            });
          }
        }
      });
    } catch (error) {
      console.error("Error processing line items:", error);
    }
  }

  /**
   * Transforms QuickBooks data into unified period data
   * @param quickBooksData - The QuickBooks data to transform
   * @returns Array of unified period data
   */
  public transformData(quickBooksData: QuickBooksData): PeriodData[] {
    const reportDates = this.getReportDates(quickBooksData);
    const lineItems = this.getLineItems(quickBooksData);

    const resultsByDate: PeriodData[] = reportDates.map((date) => ({
      company_id: this.defaultCompanyId,
      startDate: date.startDate,
      endDate: date.endDate,
    }));

    this.processSummaryData(
      quickBooksData.data.Rows.Row,
      resultsByDate,
      QUICKBOOKS_UNIFIED_KEYS
    );

    this.processLineItems(lineItems, resultsByDate, QUICKBOOKS_UNIFIED_KEYS);

    return resultsByDate;
  }
}
