/**
 * @fileoverview Database interfaces and types
 * This file contains all interfaces and types related to database operations,
 * including entity interfaces, repository interfaces, and database configuration.
 */

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Company entity interface
 */
export interface CompanyEntity extends BaseEntity {
  name: string;
  reportPeriods?: ReportPeriodEntity[];
}

/**
 * Report period entity interface
 */
export interface ReportPeriodEntity extends BaseEntity {
  company: CompanyEntity;
  startDate: string;
  endDate: string;
  categories?: FinancialCategoryEntity[];
}

/**
 * Financial category entity interface
 */
export interface FinancialCategoryEntity extends BaseEntity {
  reportPeriod: ReportPeriodEntity;
  name: string;
  value: number;
  lineItems?: FinancialLineItemEntity[];
}

/**
 * Financial line item entity interface
 */
export interface FinancialLineItemEntity extends BaseEntity {
  category: FinancialCategoryEntity;
  name: string;
  value: number;
}

/**
 * User entity interface
 */
export interface UserEntity extends BaseEntity {
  name: string;
}

/**
 * Database statistics interface
 */
export interface DatabaseStatistics {
  companies: number;
  reportPeriods: number;
  categories: number;
  lineItems: number;
}

/**
 * Transaction result interface
 */
export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
