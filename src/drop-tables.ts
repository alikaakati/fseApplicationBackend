/**
 * @fileoverview Drop All Tables
 * This script drops all tables to allow recreation with correct schema.
 */

import "reflect-metadata";
import { AppDataSource } from "./database/data-source";

/**
 * Drop all tables
 */
async function dropAllTables(): Promise<void> {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Dropping all tables...");

    // Drop tables in reverse dependency order
    await AppDataSource.query(
      `DROP TABLE IF EXISTS "financial_line_item" CASCADE`
    );
    await AppDataSource.query(
      `DROP TABLE IF EXISTS "financial_category" CASCADE`
    );
    await AppDataSource.query(`DROP TABLE IF EXISTS "report_period" CASCADE`);
    await AppDataSource.query(`DROP TABLE IF EXISTS "company" CASCADE`);
    await AppDataSource.query(`DROP TABLE IF EXISTS "user" CASCADE`);
    await AppDataSource.query(`DROP TABLE IF EXISTS "migrations" CASCADE`);

    console.log("✅ All tables dropped successfully");
    console.log(
      "📝 You can now run 'npm run migrate:run' to recreate the schema"
    );
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await dropAllTables();
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Drop tables failed:", error);
    process.exit(1);
  });
}

export { dropAllTables };
