/**
 * @fileoverview Database data source configuration
 * This file configures the TypeORM data source for the application's database connection.
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseConfig } from "../config/database.config";
import { join } from "path";

/**
 * Application data source instance
 * Configured with TypeORM for PostgreSQL database connection
 */
export const AppDataSource = new DataSource({
  type: databaseConfig.type as "postgres",
  url: databaseConfig.url,
  synchronize: databaseConfig.synchronize,
  logging: databaseConfig.logging,
  entities: databaseConfig.entities,
  migrations: [join(__dirname, "migrations", "*.ts")],
  migrationsTableName: "migrations",
  subscribers: [],
});

/**
 * Initialize the database connection
 * @returns Promise<void>
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection established successfully");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

/**
 * Close the database connection
 * @returns Promise<void>
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✅ Database connection closed successfully");
    }
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
    throw error;
  }
};
