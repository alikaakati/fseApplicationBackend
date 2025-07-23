/**
 * @fileoverview HTTP utility functions
 * This file contains utility functions for making HTTP requests and fetching data from URLs.
 */

import fetch from "node-fetch";

/**
 * Fetches JSON data from a URL
 * @param url - The URL to fetch data from
 * @returns Promise with the parsed JSON data
 */
export async function fetchJsonFromUrl<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new Error(`Failed to fetch data from URL: ${error}`);
  }
}

/**
 * Fetches text data from a URL
 * @param url - The URL to fetch data from
 * @returns Promise with the text data
 */
export async function fetchTextFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch text from URL: ${error}`);
  }
}
