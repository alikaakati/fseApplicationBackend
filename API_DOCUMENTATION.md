# Financial Data ETL API Documentation

This document describes the REST API endpoints available for the Financial Data ETL Backend.

## Base URL

```
https://fseapplicationbackend.onrender.com
```

## Endpoints

### Health Check

**GET** `/health`

Check if the server is running.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Financial Data ETL Backend"
}
```

### Get Statistics

**GET** `/api/data/statistics`

Get current database statistics including counts of companies, report periods, categories, and line items.

**Response:**

```json
{
  "success": true,
  "data": {
    "companies": 5,
    "reportPeriods": 325,
    "categories": 2925,
    "lineItems": 6500,
    "monthlyValues": 6500
  },
  "message": "Statistics retrieved successfully"
}
```

### Process QuickBooks Data

**POST** `/api/etl/quickbooks`

Process QuickBooks data from the default data file (`a.json`).

**Response:**

```json
{
  "success": true,
  "message": "QuickBooks data processed successfully",
  "data": {
    "companies": 1,
    "reportPeriods": 65,
    "categories": 585,
    "lineItems": 1300,
    "monthlyValues": 1300
  }
}
```

### Process Rootfi Data

**POST** `/api/etl/rootfi`

Process Rootfi data from the default data file (`b.json`).

**Response:**

```json
{
  "success": true,
  "message": "Rootfi data processed successfully",
  "data": {
    "companies": 1,
    "reportPeriods": 10,
    "categories": 90,
    "lineItems": 200,
    "monthlyValues": 200
  }
}
```

### Process All Data

**POST** `/api/etl/all`

Process both QuickBooks and Rootfi data from their respective default data files.

**Response:**

```json
{
  "success": true,
  "message": "All data processed successfully",
  "data": {
    "companies": 2,
    "reportPeriods": 75,
    "categories": 675,
    "lineItems": 1500,
    "monthlyValues": 1500
  }
}
```

### Refresh All Data

**POST** `/api/data/refresh`

Clear all data from the database and re-fetch the latest data from the configured URLs. This will remove all existing data and then process both QuickBooks and Rootfi data sources.

**Response:**

```json
{
  "success": true,
  "message": "Data refreshed successfully",
  "data": {
    "companies": 2,
    "reportPeriods": 101,
    "categories": 909,
    "lineItems": 3826
  }
}
```

### Get Companies (Placeholder)

**GET** `/api/data/companies`

Get all companies with their data. This endpoint is currently a placeholder and will be implemented in future versions.

**Response:**

```json
{
  "success": true,
  "message": "Companies endpoint - to be implemented",
  "data": []
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (ETL processing failed)
- `404` - Route not found
- `500` - Internal Server Error

## Usage Examples

### Using curl

**Start the server:**

```bash
npm run server
```

**Get statistics:**

```bash
curl https://fseapplicationbackend.onrender.com/api/data/statistics
```

**Process QuickBooks data:**

```bash
curl -X POST https://fseapplicationbackend.onrender.com/api/etl/quickbooks
```

**Process Rootfi data:**

```bash
curl -X POST https://fseapplicationbackend.onrender.com/api/etl/rootfi
```

**Process all data:**

```bash
curl -X POST https://fseapplicationbackend.onrender.com/api/etl/all
```

**Refresh all data:**

```bash
curl -X POST https://fseapplicationbackend.onrender.com/api/data/refresh
```

### Using JavaScript/Fetch

```javascript
// Process QuickBooks data
const response = await fetch(
  "https://fseapplicationbackend.onrender.com/api/etl/quickbooks",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }
);

const result = await response.json();
console.log(result);
```

## Notes

- The server runs on port 3001 by default
- All ETL operations use the default data files (`a.json` for QuickBooks, `b.json` for Rootfi)
- The database connection is automatically managed by the application
- All endpoints include proper error handling and logging
- CORS is enabled for cross-origin requests
