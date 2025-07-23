/**
 * @fileoverview Text utility functions
 * This file contains utility functions for text processing, normalization, and formatting.
 */

/**
 * Cleans and normalizes line item titles for consistent naming
 * @param title - The original title to clean
 * @returns The cleaned and normalized title
 */
export const cleanLineItemTitles = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

/**
 * Formats a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value);
};

/**
 * Capitalizes the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Truncates a string to a specified length
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @param suffix - The suffix to add (default: "...")
 * @returns The truncated string
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix: string = "..."
): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Removes special characters from a string
 * @param str - The string to clean
 * @returns The cleaned string
 */
export const removeSpecialCharacters = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9\s]/g, "");
};
