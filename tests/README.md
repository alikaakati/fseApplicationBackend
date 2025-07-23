# Testing Setup

This directory contains comprehensive tests for the Financial Data ETL Backend application.

## Overview

The testing setup uses Jest as the testing framework with TypeScript support. Tests are organized to cover utility functions, services, and integration scenarios.

## Test Structure

```
tests/
├── setup.ts                    # Global test configuration
└── services/                   # Service tests
    └── unified-etl.service.test.ts # ETL service tests
└──etl-integration-test.ts             # ETL integration test
```

## Test Categories

### 1. Service Tests (`tests/services/`)

### 2. Integration Tests (`tests/integration/`)

## Test Data

The tests use real data from the following files:

- `src/utils/a.json`: QuickBooks test data
- `src/utils/b.json`: Rootfi test data

These files contain actual financial data structures that the ETL services process.

## Running Tests

```bash
npm test
```
