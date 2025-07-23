/**
 * @fileoverview Reset Migration State
 * This script manually clears the migration state when tables have been
 * manually deleted and you need to re-run migrations.
 */

import "reflect-metadata";
import { AppDataSource } from "./database/data-source";

/**
 * Reset migration state by clearing the migrations table
 */
async function resetMigrationState(): Promise<void> {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Clearing migration state...");

    // Drop the migrations table if it exists
    await AppDataSource.query(`DROP TABLE IF EXISTS "migrations"`);

    console.log("✅ Migration state cleared successfully");
    console.log(
      "📝 You can now run 'npm run migrate:run' to create the schema"
    );
  } catch (error) {
    console.error("❌ Error resetting migration state:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await resetMigrationState();
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  });
}

export { resetMigrationState };
