/**
 * @fileoverview File utility functions for testing
 * This file contains utility functions for reading local files during testing.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Reads a JSON file from the utils directory
 * @param filename - The name of the JSON file to read
 * @returns Promise with the parsed JSON data
 */
export async function readJsonFile<T>(filename: string): Promise<T> {
  try {
    const filePath = path.join(__dirname, "..", filename);
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(fileContent) as T;
  } catch (error) {
    throw new Error(`Failed to read JSON file ${filename}: ${error}`);
  }
}

/**
 * Reads the QuickBooks test data file
 * @returns Promise with the QuickBooks data
 */
export async function readQuickBooksTestData<T>(): Promise<T> {
  return readJsonFile<T>("a.json");
}

/**
 * Reads the Rootfi test data file
 * @returns Promise with the Rootfi data
 */
export async function readRootfiTestData<T>(): Promise<T> {
  return readJsonFile<T>("b.json");
}
