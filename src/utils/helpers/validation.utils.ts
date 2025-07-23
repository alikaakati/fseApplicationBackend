/**
 * @fileoverview Validation utility functions
 * This file contains utility functions for data validation, type checking, and error handling.
 */

/**
 * Validates if a value is a valid number
 * @param value - The value to validate
 * @returns True if the value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
};

/**
 * Validates if a value is a valid date string
 * @param dateString - The date string to validate
 * @returns True if the value is a valid date string
 */
export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validates if a value is a valid email address
 * @param email - The email to validate
 * @returns True if the value is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a value is not null, undefined, or empty string
 * @param value - The value to validate
 * @returns True if the value is not null, undefined, or empty
 */
export const isNotEmpty = (value: any): boolean => {
  return value !== null && value !== undefined && value !== "";
};

/**
 * Validates if a value is a valid UUID
 * @param uuid - The UUID to validate
 * @returns True if the value is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates if a value is within a specified range
 * @param value - The value to validate
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns True if the value is within the range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validates if a string has a minimum length
 * @param str - The string to validate
 * @param minLength - The minimum length required
 * @returns True if the string meets the minimum length requirement
 */
export const hasMinLength = (str: string, minLength: number): boolean => {
  return str.length >= minLength;
};

/**
 * Validates if a string has a maximum length
 * @param str - The string to validate
 * @param maxLength - The maximum length allowed
 * @returns True if the string is within the maximum length
 */
export const hasMaxLength = (str: string, maxLength: number): boolean => {
  return str.length <= maxLength;
};
