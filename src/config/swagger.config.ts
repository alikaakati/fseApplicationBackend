/**
 * @fileoverview Swagger/OpenAPI Configuration
 * This file contains the Swagger configuration for API documentation.
 */

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Financial Data ETL API",
      version: "1.0.0",
      description:
        "A comprehensive ETL backend API for processing financial data from multiple sources including QuickBooks and Rootfi",
      contact: {
        name: "Alika Akati",
        url: "https://github.com/alikaakati/fseApplicationBackend",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Error message",
            },
            message: {
              type: "string",
              example: "Detailed error description",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        ETLResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "ETL process completed successfully",
            },
            processedRecords: {
              type: "number",
              example: 150,
            },
            source: {
              type: "string",
              example: "quickbooks",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
