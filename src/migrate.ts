/**
 * @fileoverview Database Migration Runner
 * This script handles database migrations for the financial data ETL application.
 * It can run migrations, revert migrations, and show migration status.
 */

import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import { DataSource } from "typeorm";

/**
 * Run all pending migrations
 */
async function runMigrations(): Promise<void> {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Running migrations...");
    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log("✅ No pending migrations to run");
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

/**
 * Revert the last migration
 */
async function revertLastMigration(): Promise<void> {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Reverting last migration...");
    await AppDataSource.undoLastMigration();
    console.log("✅ Last migration reverted successfully");
  } catch (error) {
    console.error("❌ Error reverting migration:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

/**
 * Show migration status
 */
async function showMigrationStatus(): Promise<void> {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("📊 Migration Status:");
    const migrations = await AppDataSource.showMigrations();

    // showMigrations returns a boolean, so we'll use a different approach
    console.log("   Migration status check completed");
    console.log("   Use 'npm run migrate:run' to run pending migrations");
  } catch (error) {
    console.error("❌ Error showing migration status:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

/**
 * Create the database if it doesn't exist
 */
async function createDatabase(): Promise<void> {
  try {
    console.log("🔄 Creating database if it doesn't exist...");

    // Create a temporary connection to postgres database
    const tempDataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "blankstreet",
      database: "postgres", // Connect to default postgres database
    });

    await tempDataSource.initialize();

    const databaseName = process.env.DB_NAME || "ahs";

    // Check if database exists
    const result = await tempDataSource.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (result.length === 0) {
      console.log(`🔄 Creating database: ${databaseName}`);
      await tempDataSource.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`✅ Database '${databaseName}' created successfully`);
    } else {
      console.log(`✅ Database '${databaseName}' already exists`);
    }

    await tempDataSource.destroy();
  } catch (error) {
    console.error("❌ Error creating database:", error);
    throw error;
  }
}

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case "run":
      await runMigrations();
      break;
    case "revert":
      await revertLastMigration();
      break;
    case "status":
      await showMigrationStatus();
      break;
    case "create-db":
      await createDatabase();
      break;
    case "setup":
      console.log("🔄 Setting up database...");
      await createDatabase();
      await runMigrations();
      console.log("✅ Database setup completed successfully");
      break;
    default:
      console.log("📖 Database Migration Commands:");
      console.log("   npm run migrate:run        - Run all pending migrations");
      console.log("   npm run migrate:revert     - Revert the last migration");
      console.log("   npm run migrate:status     - Show migration status");
      console.log(
        "   npm run migrate:create-db  - Create database if it doesn't exist"
      );
      console.log(
        "   npm run migrate:setup      - Create database and run migrations"
      );
      break;
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
}

export {
  runMigrations,
  revertLastMigration,
  showMigrationStatus,
  createDatabase,
};
