/**
 * @fileoverview Database Service
 * This service handles all database operations including saving, retrieving, and managing
 * financial data entities with proper transaction management and error handling.
 */

import { EntityManager } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { Company } from "../../database/entities/company.entity";
import { ReportPeriod } from "../../database/entities/report-period.entity";
import { FinancialCategory } from "../../database/entities/financial-category.entity";
import { FinancialLineItem } from "../../database/entities/financial-line-item.entity";
import {
  PeriodData,
  FINANCIAL_CATEGORY_KEYS,
} from "../../interfaces/financial-data.interface";
import { DatabaseStatistics } from "../../interfaces/database.interface";

/**
 * Database Service class
 * Handles all database operations for the application
 */
export class DatabaseService {
  /**
   * Initializes the database connection
   */
  private async initialize(): Promise<void> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  }

  /**
   * Saves company data with associated report periods, categories, and line items
   * @param companyName - The name of the company
   * @param periodData - Array of period data to save
   * @returns Database statistics
   */
  public async saveCompanyData(
    companyName: string,
    periodData: PeriodData[]
  ): Promise<DatabaseStatistics> {
    await this.initialize();

    return await AppDataSource.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        // Create the company
        const company = new Company();
        company.name = companyName;
        company.description = `Company created from ETL process`;

        const savedCompany = await transactionalEntityManager.save(
          Company,
          company
        );

        // Create report periods with categories and line items
        const reportPeriods: ReportPeriod[] = [];

        for (const period of periodData) {
          const reportPeriod = new ReportPeriod();
          reportPeriod.company = savedCompany;
          reportPeriod.startDate = period.startDate;
          reportPeriod.endDate = period.endDate;
          reportPeriod.periodType = "monthly";

          // Create financial categories for this period
          const categories: FinancialCategory[] = [];

          for (const categoryKey of FINANCIAL_CATEGORY_KEYS) {
            const category = new FinancialCategory();
            category.name = categoryKey;
            category.reportPeriod = reportPeriod;
            category.value = (period[categoryKey] as number) || 0;
            category.categoryType = this.getCategoryType(categoryKey);

            // Create line items for this category
            const lineItems: FinancialLineItem[] = [];

            if (period.lineItems && period.lineItems[categoryKey]) {
              for (const lineItemData of period.lineItems[categoryKey]) {
                const lineItem = new FinancialLineItem();
                lineItem.category = category;
                lineItem.name = lineItemData.key;
                lineItem.value = lineItemData.value;
                lineItem.accountId = lineItemData.accountId;
                lineItem.itemType = this.getItemType(categoryKey);

                lineItems.push(lineItem);
              }
            }

            category.lineItems = lineItems;
            categories.push(category);
          }

          reportPeriod.categories = categories;
          reportPeriods.push(reportPeriod);
        }

        // Save all entities
        await transactionalEntityManager.save(ReportPeriod, reportPeriods);
        await transactionalEntityManager.save(
          FinancialCategory,
          reportPeriods.flatMap((rp) => rp.categories)
        );
        await transactionalEntityManager.save(
          FinancialLineItem,
          reportPeriods
            .flatMap((rp) => rp.categories)
            .flatMap((cat) => cat.lineItems)
        );

        // Return statistics
        return await this.getStatistics();
      }
    );
  }

  /**
   * Gets database statistics
   * @returns Database statistics object
   */
  public async getStatistics(): Promise<DatabaseStatistics> {
    await this.initialize();

    try {
      const companyRepo = AppDataSource.getRepository(Company);
      const reportPeriodRepo = AppDataSource.getRepository(ReportPeriod);
      const categoryRepo = AppDataSource.getRepository(FinancialCategory);
      const lineItemRepo = AppDataSource.getRepository(FinancialLineItem);

      const [companies, reportPeriods, categories, lineItems] =
        await Promise.all([
          companyRepo.count(),
          reportPeriodRepo.count(),
          categoryRepo.count(),
          lineItemRepo.count(),
        ]);

      return {
        companies,
        reportPeriods,
        categories,
        lineItems,
      };
    } catch (error) {
      console.error("Error getting database statistics:", error);
      throw error;
    }
  }

  /**
   * Gets all companies with their report periods
   * @returns Array of companies with report periods
   */
  public async getCompanies(): Promise<Company[]> {
    await this.initialize();

    try {
      return await AppDataSource.getRepository(Company).find({
        relations: [
          "reportPeriods",
          "reportPeriods.categories",
          "reportPeriods.categories.lineItems",
        ],
      });
    } catch (error) {
      console.error("Error getting companies:", error);
      throw error;
    }
  }

  /**
   * Gets a company by ID with all related data
   * @param companyId - The company ID
   * @returns Company with all related data
   */
  public async getCompanyById(companyId: number): Promise<Company | null> {
    await this.initialize();

    try {
      return await AppDataSource.getRepository(Company).findOne({
        where: { id: companyId },
        relations: [
          "reportPeriods",
          "reportPeriods.categories",
          "reportPeriods.categories.lineItems",
        ],
      });
    } catch (error) {
      console.error("Error getting company by ID:", error);
      throw error;
    }
  }

  /**
   * Deletes all data from the database (for testing/cleanup)
   */
  public async clearAllData(): Promise<void> {
    await this.initialize();

    try {
      await AppDataSource.manager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          // Delete all line items
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(FinancialLineItem)
            .execute();

          // Delete all categories
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(FinancialCategory)
            .execute();

          // Delete all report periods
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(ReportPeriod)
            .execute();

          // Delete all companies
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(Company)
            .execute();
        }
      );

      console.log("✅ All data cleared successfully");
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }

  /**
   * Determines the category type based on the category key
   * @param categoryKey - The category key
   * @returns The category type
   */
  private getCategoryType(categoryKey: string): string {
    const incomeCategories = ["income", "other_income"];
    const expenseCategories = ["cogs", "expenses", "other_expenses"];
    const profitCategories = [
      "gross_profit",
      "operating_income",
      "net_other_income",
      "net_income",
    ];

    if (incomeCategories.includes(categoryKey)) return "income";
    if (expenseCategories.includes(categoryKey)) return "expense";
    if (profitCategories.includes(categoryKey)) return "profit";

    return "other";
  }

  /**
   * Determines the item type based on the category key
   * @param categoryKey - The category key
   * @returns The item type
   */
  private getItemType(categoryKey: string): string {
    const incomeCategories = ["income", "other_income"];
    const expenseCategories = ["cogs", "expenses", "other_expenses"];

    if (incomeCategories.includes(categoryKey)) return "revenue";
    if (expenseCategories.includes(categoryKey)) return "expense";

    return "other";
  }

  /**
   * Gets all report dates
   * @returns Array of report periods with company information
   */
  public async getReportDates(): Promise<any[]> {
    await this.initialize();

    try {
      return await AppDataSource.getRepository(ReportPeriod).find({
        relations: ["company"],
        order: {
          startDate: "ASC",
        },
      });
    } catch (error) {
      console.error("Error getting report dates:", error);
      throw error;
    }
  }

  /**
   * Gets categories with their line items by report period ID
   * @param reportPeriodId - The report period ID
   * @returns Array of categories with their line items
   */
  public async getCategoriesByReportPeriod(
    reportPeriodId: number
  ): Promise<any[]> {
    await this.initialize();

    try {
      return await AppDataSource.getRepository(FinancialCategory).find({
        where: { reportPeriod: { id: reportPeriodId } },
        relations: ["lineItems"],
        order: {
          name: "ASC",
        },
      });
    } catch (error) {
      console.error("Error getting categories by report period:", error);
      throw error;
    }
  }

  /**
   * Gets categories by date range and merges categories with the same name
   * @param startDate - The start date to match
   * @param endDate - The end date to match
   * @returns Array of merged categories with their line items
   */
  public async getCategoriesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    await this.initialize();

    try {
      // Get all categories from report periods that match the date range
      const categories = await AppDataSource.getRepository(
        FinancialCategory
      ).find({
        where: {
          reportPeriod: {
            startDate: startDate,
            endDate: endDate,
          },
        },
        relations: ["lineItems", "reportPeriod", "reportPeriod.company"],
        order: {
          name: "ASC",
        },
      });

      // Group categories by name and merge them
      const mergedCategories = new Map<string, any>();

      for (const category of categories) {
        const categoryName = category.name;

        if (!mergedCategories.has(categoryName)) {
          mergedCategories.set(categoryName, {
            id: `merged_${categoryName}`,
            name: categoryName,
            value: 0,
            categoryType: category.categoryType,
            lineItems: [],
            reportPeriods: [],
            companies: [],
          });
        }

        const mergedCategory = mergedCategories.get(categoryName);

        // Sum the values
        mergedCategory.value += Number(category.value);

        // Add line items (concatenate)
        if (category.lineItems && category.lineItems.length > 0) {
          mergedCategory.lineItems.push(...category.lineItems);
        }

        if (category.reportPeriod) {
          mergedCategory.reportPeriods.push({
            id: category.reportPeriod.id,
            startDate: category.reportPeriod.startDate,
            endDate: category.reportPeriod.endDate,
            company: category.reportPeriod.company,
          });

          if (category.reportPeriod.company) {
            const companyExists = mergedCategory.companies.some(
              (c: any) => c.id === category.reportPeriod.company.id
            );
            if (!companyExists) {
              mergedCategory.companies.push(category.reportPeriod.company);
            }
          }
        }
      }

      // Convert map to array and sort by name
      return Array.from(mergedCategories.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    } catch (error) {
      console.error("Error getting categories by date range:", error);
      throw error;
    }
  }

  /**
   * Gets income data for a specific company grouped by year
   * @param companyId - The company ID
   * @returns Array of income data grouped by year
   */
  public async getCompanyIncomeByYear(companyId: number): Promise<any[]> {
    await this.initialize();

    try {
      // Get all income categories for the company
      const incomeCategories = await AppDataSource.getRepository(
        FinancialCategory
      ).find({
        where: {
          name: "income",
          reportPeriod: {
            company: { id: companyId },
          },
        },
        relations: ["reportPeriod"],
        order: {
          reportPeriod: {
            startDate: "ASC",
          },
        },
      });

      // Return simplified data with just period info and income value
      return incomeCategories.map((category) => ({
        periodStart: category.reportPeriod.startDate,
        periodEnd: category.reportPeriod.endDate,
        income: category.value,
      }));
    } catch (error) {
      console.error("Error getting company income by year:", error);
      throw error;
    }
  }
}
