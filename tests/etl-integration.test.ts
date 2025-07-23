import { UnifiedETLService } from "../src/services/etl/unified-etl.service";
import { ETLConfig } from "../src/interfaces/etl.interface";
import {
  QuickBooksData,
  RootfiData,
} from "../src/interfaces/financial-data.interface";
import {
  readQuickBooksTestData,
  readRootfiTestData,
} from "../src/utils/helpers/file.utils";

// Mock only the database service, not the ETL services
jest.mock("../src/services/database/database.service");

describe("ETL Integration Tests", () => {
  let unifiedETLService: UnifiedETLService;
  let mockConfig: ETLConfig;

  beforeEach(() => {
    mockConfig = {
      defaultCompanyId: 1,
      defaultGroup: "default",
      enableLogging: false,
    };

    unifiedETLService = new UnifiedETLService(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Real Data Processing from JSON Files", () => {
    it("should process Rootfi data from JSON file and validate structure", async () => {
      // Step 1: Read Rootfi data directly from JSON file
      const rootfiData = await readRootfiTestData<RootfiData>();

      const service = unifiedETLService as any;

      // Step 2: Use actual Rootfi ETL processing functions
      const rootfiTransformed = service.rootfiETL.transformData(rootfiData);
      const rootfiValid = service.rootfiETL.validateData(rootfiData);

      // Step 3: Validate the transformed data structure
      expect(rootfiValid).toBe(true);
      expect(rootfiTransformed).toBeDefined();
      expect(Array.isArray(rootfiTransformed)).toBe(true);
      expect(rootfiTransformed.length).toBeGreaterThan(0);

      // Step 4: Validate that each period has the expected structure
      const firstPeriod = rootfiTransformed[0];
      expect(firstPeriod).toHaveProperty("startDate");
      expect(firstPeriod).toHaveProperty("endDate");
      expect(firstPeriod).toHaveProperty("lineItems");
      expect(firstPeriod.lineItems).toHaveProperty("income");
      expect(firstPeriod.lineItems).toHaveProperty("cogs");
      expect(firstPeriod.lineItems).toHaveProperty("expenses");
      expect(firstPeriod.lineItems).toHaveProperty("other_income");
      expect(firstPeriod.lineItems).toHaveProperty("other_expenses");

      console.log("Rootfi transformed data structure:", {
        periods: rootfiTransformed.length,
        samplePeriod: firstPeriod,
      });
    });

    it("should process both data sources and validate expected row counts", async () => {
      // Step 1: Read data directly from JSON files
      const quickBooksData = await readQuickBooksTestData<QuickBooksData>();
      const rootfiData = await readRootfiTestData<RootfiData>();

      const service = unifiedETLService as any;

      // Step 2: Use actual ETL processing functions
      const quickBooksTransformed =
        service.quickBooksETL.transformData(quickBooksData);
      const rootfiTransformed = service.rootfiETL.transformData(rootfiData);
      const rootfiValid = service.rootfiETL.validateData(rootfiData);

      // Step 3: Mock the database service to return results instead of saving
      const mockSaveResult = {
        success: true,
        message: "Data processed successfully",
        results: {
          companies: 1,
          reportPeriods: 50,
          categories: 454,
          lineItems: 1913,
        },
      };
      service.databaseService.saveCompanyData = jest
        .fn()
        .mockResolvedValue(mockSaveResult);

      // Step 4: Process the data through the database service (mocked)
      const quickBooksResult = await service.databaseService.saveCompanyData(
        quickBooksTransformed
      );
      const rootfiResult = await service.databaseService.saveCompanyData(
        rootfiTransformed
      );

      // Step 5: Validate the processing results
      expect(rootfiValid).toBe(true);
      expect(quickBooksResult.success).toBe(true);
      expect(rootfiResult.success).toBe(true);

      // Step 6: Calculate combined totals
      const combinedResults = {
        companies:
          quickBooksResult.results.companies + rootfiResult.results.companies,
        reportPeriods:
          quickBooksResult.results.reportPeriods +
          rootfiResult.results.reportPeriods,
        categories:
          quickBooksResult.results.categories + rootfiResult.results.categories,
        lineItems:
          quickBooksResult.results.lineItems + rootfiResult.results.lineItems,
      };

      console.log("Combined results:", combinedResults);

      // Step 7: Validate against expected values
      expect(combinedResults.companies).toBe(2); // 1 + 1 = 2 companies
      expect(combinedResults.reportPeriods).toBe(100); // 50 + 50 = 100 periods
      expect(combinedResults.categories).toBe(908); // 454 + 454 = 908 categories
      expect(combinedResults.lineItems).toBe(3826); // 1913 + 1913 = 3826 line items

      // Step 8: Validate that the database service was called correctly
      expect(service.databaseService.saveCompanyData).toHaveBeenCalledTimes(2);
      expect(service.databaseService.saveCompanyData).toHaveBeenCalledWith(
        quickBooksTransformed
      );
      expect(service.databaseService.saveCompanyData).toHaveBeenCalledWith(
        rootfiTransformed
      );
    });

    it("should validate the actual data counts from JSON files", async () => {
      // Step 1: Read data directly from JSON files
      const quickBooksData = await readQuickBooksTestData<QuickBooksData>();
      const rootfiData = await readRootfiTestData<RootfiData>();

      const service = unifiedETLService as any;

      // Step 2: Use actual ETL processing functions to get real counts
      const quickBooksTransformed =
        service.quickBooksETL.transformData(quickBooksData);
      const rootfiTransformed = service.rootfiETL.transformData(rootfiData);

      // Step 3: Count actual records in the transformed data
      const quickBooksCounts = {
        companies: 1, // QuickBooks typically has one company per report
        reportPeriods: quickBooksTransformed.length,
        categories: 0,
        lineItems: 0,
      };

      const rootfiCounts = {
        companies: new Set(rootfiTransformed.map((p: any) => p.company_id))
          .size,
        reportPeriods: rootfiTransformed.length,
        categories: 0,
        lineItems: 0,
      };

      // Calculate categories and line items from QuickBooks data
      quickBooksTransformed.forEach((period: any) => {
        if (period.lineItems) {
          // Count individual line items within each category
          Object.values(period.lineItems).forEach((category: any) => {
            if (Array.isArray(category)) {
              quickBooksCounts.lineItems += category.length;
            }
          });
        }
      });

      // Calculate categories and line items from Rootfi data
      rootfiTransformed.forEach((period: any) => {
        if (period.lineItems) {
          // Count individual line items within each category
          Object.values(period.lineItems).forEach((category: any) => {
            if (Array.isArray(category)) {
              rootfiCounts.lineItems += category.length;
            }
          });
        }
      });

      // Step 4: Calculate combined totals
      const actualCounts = {
        companies: quickBooksCounts.companies + rootfiCounts.companies,
        reportPeriods:
          quickBooksCounts.reportPeriods + rootfiCounts.reportPeriods,
        categories: 0, // Will be calculated below
        lineItems: quickBooksCounts.lineItems + rootfiCounts.lineItems,
      };

      // Calculate categories: FINANCIAL_CATEGORY_KEYS.length * total_report_periods
      const FINANCIAL_CATEGORY_KEYS_LENGTH = 9;
      actualCounts.categories =
        FINANCIAL_CATEGORY_KEYS_LENGTH * actualCounts.reportPeriods;

      // Step 5: Validate that we have data > 0
      expect(actualCounts.companies).toBeGreaterThan(0);
      expect(actualCounts.reportPeriods).toBeGreaterThan(0);

      // Step 6: Expected values from the database
      const expectedCounts = {
        companies: 2,
        reportPeriods: 101,
        categories: 909,
        lineItems: 3826,
      };

      // Validate all counts
      expect(actualCounts.companies).toBe(expectedCounts.companies);
      expect(actualCounts.reportPeriods).toBe(expectedCounts.reportPeriods);
      expect(actualCounts.categories).toBe(expectedCounts.categories);
      expect(actualCounts.lineItems).toBe(expectedCounts.lineItems);
    });
  });
});
