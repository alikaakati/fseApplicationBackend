import { UnifiedETLService } from "../../src/services/etl/unified-etl.service";
import { ETLConfig } from "../../src/interfaces/etl.interface";
import {
  QuickBooksData,
  RootfiData,
} from "../../src/interfaces/financial-data.interface";
import {
  readQuickBooksTestData,
  readRootfiTestData,
} from "../../src/utils/helpers/file.utils";

// Mock the dependencies
jest.mock("../../src/services/etl/quickbooks-etl.service");
jest.mock("../../src/services/etl/rootfi-etl.service");
jest.mock("../../src/services/database/database.service");
jest.mock("../../src/utils/helpers/http.utils");

describe("UnifiedETLService", () => {
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

  describe("constructor", () => {
    it("should create a UnifiedETLService instance with config", () => {
      expect(unifiedETLService).toBeInstanceOf(UnifiedETLService);
    });
  });

  describe("processQuickBooksData", () => {
    it("should handle errors during QuickBooks data processing", async () => {
      const {
        fetchJsonFromUrl,
      } = require("../../src/utils/helpers/http.utils");
      fetchJsonFromUrl.mockRejectedValue(new Error("Network error"));

      const result = await unifiedETLService.processQuickBooksData(
        "http://test-url.com"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("QuickBooks data processing failed");
      expect(result.errors).toContain(
        "Failed to load QuickBooks data: Error: Network error"
      );
    });

    it("should process QuickBooks data from local file successfully", async () => {
      // Read actual QuickBooks test data
      const quickBooksData = await readQuickBooksTestData<QuickBooksData>();

      const service = unifiedETLService as any;

      // Mock the database service save method
      const mockSaveResult = { success: true, message: "Data saved" };
      service.databaseService.saveCompanyData = jest
        .fn()
        .mockResolvedValue(mockSaveResult);

      // Mock the QuickBooks ETL transform method
      const mockPeriodData = {
        company: { name: "Test Company", id: "123" },
        periods: [],
      };
      service.quickBooksETL.transformData = jest
        .fn()
        .mockReturnValue(mockPeriodData);
      service.quickBooksETL.validateData = jest.fn().mockReturnValue(true);

      // Mock the HTTP fetch to return our local data
      const {
        fetchJsonFromUrl,
      } = require("../../src/utils/helpers/http.utils");
      fetchJsonFromUrl.mockResolvedValue(quickBooksData);

      const result = await unifiedETLService.processQuickBooksData(
        "http://test-url.com"
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("QuickBooks data processed successfully");
      expect(result.results).toEqual(mockSaveResult);
      expect(service.quickBooksETL.transformData).toHaveBeenCalledWith(
        quickBooksData
      );
    });
  });

  describe("processRootfiData", () => {
    it("should handle errors during Rootfi data processing", async () => {
      const {
        fetchJsonFromUrl,
      } = require("../../src/utils/helpers/http.utils");
      fetchJsonFromUrl.mockRejectedValue(new Error("Network error"));

      const result = await unifiedETLService.processRootfiData(
        "http://test-url.com"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("Rootfi data processing failed");
      expect(result.errors).toContain(
        "Failed to load Rootfi data: Error: Network error"
      );
    });

    it("should process Rootfi data from local file successfully", async () => {
      // Read actual Rootfi test data
      const rootfiData = await readRootfiTestData<RootfiData>();

      const service = unifiedETLService as any;

      // Mock the database service save method
      const mockSaveResult = { success: true, message: "Data saved" };
      service.databaseService.saveCompanyData = jest
        .fn()
        .mockResolvedValue(mockSaveResult);

      // Mock the Rootfi ETL transform method
      const mockPeriodData = {
        company: { name: "Test Company", id: "123" },
        periods: [],
      };
      service.rootfiETL.transformData = jest
        .fn()
        .mockReturnValue(mockPeriodData);
      service.rootfiETL.validateData = jest.fn().mockReturnValue(true);

      // Mock the HTTP fetch to return our local data
      const {
        fetchJsonFromUrl,
      } = require("../../src/utils/helpers/http.utils");
      fetchJsonFromUrl.mockResolvedValue(rootfiData);

      const result = await unifiedETLService.processRootfiData(
        "http://test-url.com"
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Rootfi data processed successfully");
      expect(result.results).toEqual(mockSaveResult);
      expect(service.rootfiETL.transformData).toHaveBeenCalledWith(rootfiData);
    });
  });

  describe("processAllData", () => {
    it("should handle errors during combined data processing", async () => {
      const {
        fetchJsonFromUrl,
      } = require("../../src/utils/helpers/http.utils");
      fetchJsonFromUrl.mockRejectedValue(new Error("Network error"));

      const result = await unifiedETLService.processAllData(
        "http://random-url-1.com",
        "http://random-url-2.com"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("Unified data processing failed");
      expect(result.errors).toContain(
        "Failed to load QuickBooks data: Error: Network error"
      );
    });
  });
});
