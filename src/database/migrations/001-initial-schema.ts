/**
 * @fileoverview Initial Database Schema Migration
 * This migration creates all the necessary tables for the financial data ETL application.
 * It includes tables for companies, report periods, financial categories, and line items
 * with proper relationships and constraints.
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if all tables already exist
    const companyExists = await queryRunner.hasTable("company");
    const userExists = await queryRunner.hasTable("user");
    const reportPeriodExists = await queryRunner.hasTable("report_period");
    const financialCategoryExists = await queryRunner.hasTable(
      "financial_category"
    );
    const financialLineItemExists = await queryRunner.hasTable(
      "financial_line_item"
    );

    if (
      companyExists &&
      userExists &&
      reportPeriodExists &&
      financialCategoryExists &&
      financialLineItemExists
    ) {
      console.log("✅ All tables already exist, skipping creation");
      return;
    }

    console.log("🔄 Creating database schema...");

    // Create companies table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" character varying(500),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company" PRIMARY KEY ("id")
      )
    `);

    // Create report_periods table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "report_period" (
        "id" SERIAL NOT NULL,
        "companyId" integer NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "periodType" character varying(50),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_report_period" PRIMARY KEY ("id")
      )
    `);

    // Create financial_categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "financial_category" (
        "id" SERIAL NOT NULL,
        "reportPeriodId" integer NOT NULL,
        "name" character varying(255) NOT NULL,
        "value" decimal(15,2) NOT NULL DEFAULT 0,
        "categoryType" character varying(50),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_financial_category" PRIMARY KEY ("id")
      )
    `);

    // Create financial_line_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "financial_line_item" (
        "id" SERIAL NOT NULL,
        "categoryId" integer NOT NULL,
        "originalName" character varying(255) NOT NULL,
        "name" character varying(255) NOT NULL,
        "value" decimal(15,2) NOT NULL DEFAULT 0,
        "accountId" character varying(100),
        "itemType" character varying(50),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_financial_line_item" PRIMARY KEY ("id")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "email" character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    // Add foreign key constraints (only if they don't exist)
    try {
      await queryRunner.query(`
        ALTER TABLE "report_period" 
        ADD CONSTRAINT "FK_report_period_company" 
        FOREIGN KEY ("companyId") REFERENCES "company"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    } catch (error) {
      console.log("⚠️  Foreign key FK_report_period_company already exists");
    }

    try {
      await queryRunner.query(`
        ALTER TABLE "financial_category" 
        ADD CONSTRAINT "FK_financial_category_report_period" 
        FOREIGN KEY ("reportPeriodId") REFERENCES "report_period"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    } catch (error) {
      console.log(
        "⚠️  Foreign key FK_financial_category_report_period already exists"
      );
    }

    try {
      await queryRunner.query(`
        ALTER TABLE "financial_line_item" 
        ADD CONSTRAINT "FK_financial_line_item_category" 
        FOREIGN KEY ("categoryId") REFERENCES "financial_category"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    } catch (error) {
      console.log(
        "⚠️  Foreign key FK_financial_line_item_category already exists"
      );
    }

    // Create indexes for better performance
    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_company_name" ON "company" ("name")
      `);
    } catch (error) {
      console.log("⚠️  Index IDX_company_name already exists or failed");
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_report_period_company" ON "report_period" ("companyId")
      `);
    } catch (error) {
      console.log(
        "⚠️  Index IDX_report_period_company already exists or failed"
      );
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_report_period_dates" ON "report_period" ("startDate", "endDate")
      `);
    } catch (error) {
      console.log("⚠️  Index IDX_report_period_dates already exists or failed");
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_financial_category_report_period" ON "financial_category" ("reportPeriodId")
      `);
    } catch (error) {
      console.log(
        "⚠️  Index IDX_financial_category_report_period already exists or failed"
      );
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_financial_category_name" ON "financial_category" ("name")
      `);
    } catch (error) {
      console.log(
        "⚠️  Index IDX_financial_category_name already exists or failed"
      );
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_financial_line_item_category" ON "financial_line_item" ("categoryId")
      `);
    } catch (error) {
      console.log(
        "⚠️  Index IDX_financial_line_item_category already exists or failed"
      );
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_financial_line_item_name" ON "financial_line_item" ("name")
      `);
    } catch (error) {
      console.log(
        "⚠️  Index IDX_financial_line_item_name already exists or failed"
      );
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_user_email" ON "user" ("email")
      `);
    } catch (error) {
      console.log(
        "⚠️  Index IDX_user_email already exists or failed (user table might not have email column)"
      );
    }

    console.log("✅ Database schema created successfully");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("🔄 Dropping database schema...");

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_email"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_financial_line_item_key"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_financial_line_item_category"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_financial_category_key"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_financial_category_report_period"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_period_dates"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_period_company"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_company_name"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "financial_line_item" DROP CONSTRAINT IF EXISTS "FK_financial_line_item_category"`
    );
    await queryRunner.query(
      `ALTER TABLE "financial_category" DROP CONSTRAINT IF EXISTS "FK_financial_category_report_period"`
    );
    await queryRunner.query(
      `ALTER TABLE "report_period" DROP CONSTRAINT IF EXISTS "FK_report_period_company"`
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "financial_line_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "financial_category"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "report_period"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company"`);

    console.log("✅ Database schema dropped successfully");
  }
}
