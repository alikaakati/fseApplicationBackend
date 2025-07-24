# Financial Data ETL Backend

A comprehensive ETL (Extract, Transform, Load) backend application for processing financial data from multiple sources including QuickBooks and Rootfi. Built with TypeScript, TypeORM, and PostgreSQL.

## 🚀 Features

- **Multi-Source ETL Processing**: Support for QuickBooks and Rootfi data sources
- **Unified Data Model**: Standardized financial data structure across different sources
- **Database Integration**: PostgreSQL database with TypeORM for data persistence
- **Modular Architecture**: Clean separation of concerns with services and interfaces
- **Error Handling**: Comprehensive error handling and logging
- **Type Safety**: Full TypeScript support with strict typing
- **API Documentation**: Interactive OpenAPI/Swagger documentation
- **Documentation**: Well-documented codebase with JSDoc comments

## 📋 Prerequisites

- Node.js (>= 16.0.0)
- npm (>= 8.0.0)
- PostgreSQL database
- TypeScript knowledge

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/alikaakati/fseApplicationBackend.git
   cd fseApplicationBackend/test
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=ahs
   DB_LOGGING=false

   # Application Configuration
   NODE_ENV=development
   PORT=3001
   ENABLE_CORS=true
   ```

4. **Set up the database**

   **Option 1: Automatic setup (recommended)**

   ```bash
   npm run migrate:setup
   ```

   This will create the database and run all migrations automatically.

   **Option 2: Manual setup**

   ```bash
   # Create database only
   npm run migrate:create-db

   # Run migrations to create schema
   npm run migrate:run
   ```

## 🏗️ Project Structure

```
src/
├── config/                 # Configuration files
│   └── database.config.ts
├── database/              # Database-related files
│   ├── entities/          # TypeORM entities
│   │   ├── company.entity.ts
│   │   ├── financial-category.entity.ts
│   │   ├── financial-line-item.entity.ts
│   │   ├── report-period.entity.ts
│   │   └── user.entity.ts
│   ├── migrations/        # Database migrations
│   │   └── 001-initial-schema.ts
│   └── data-source.ts     # Database connection
├── interfaces/            # TypeScript interfaces
│   ├── database.interface.ts
│   ├── etl.interface.ts
│   ├── financial-data.interface.ts
│   └── index.ts
├── services/             # Business logic services
│   ├── database/         # Database operations
│   │   └── database.service.ts
│   └── etl/             # ETL processing services
```

## 📊 API Endpoints

### Data Endpoints

#### Get All Companies

```http
GET /api/data/companies
```

Returns a list of all companies in the system.

#### Get Company Income by Year

```http
GET /api/data/companies/{companyId}/income-by-year
```

Returns income data for a specific company with period start, period end, and income value for each period.

**Parameters:**

- `companyId` (path, required): The ID of the company

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "periodStart": "2023-01-01",
      "periodEnd": "2023-01-31",
      "income": 125000.0
    },
    {
      "periodStart": "2023-02-01",
      "periodEnd": "2023-02-28",
      "income": 135000.0
    }
  ],
  "message": "Income data retrieved successfully"
}
```

**Chart Integration:**
You can easily format this data for charting libraries:

```javascript
// Example with Chart.js
const response = await fetch("/api/data/companies/1/income-by-year");
const result = await response.json();

const chartData = {
  labels: result.data.map((item) => item.periodStart),
  datasets: [
    {
      label: "Income",
      data: result.data.map((item) => item.income),
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 2,
    },
  ],
};

const ctx = document.getElementById("incomeChart").getContext("2d");
new Chart(ctx, {
  type: "bar",
  data: chartData,
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
```

## 🏗️ Project Structure

```
src/
├── config/                 # Configuration files
│   └── database.config.ts
├── database/              # Database-related files
│   ├── entities/          # TypeORM entities
│   │   ├── company.entity.ts
│   │   ├── financial-category.entity.ts
│   │   ├── financial-line-item.entity.ts
│   │   ├── report-period.entity.ts
│   │   └── user.entity.ts
│   ├── migrations/        # Database migrations
│   │   └── 001-initial-schema.ts
│   └── data-source.ts     # Database connection
├── interfaces/            # TypeScript interfaces
│   ├── database.interface.ts
│   ├── etl.interface.ts
│   ├── financial-data.interface.ts
│   └── index.ts
├── services/             # Business logic services
│   ├── database/         # Database operations
│   │   └── database.service.ts
│   └── etl/             # ETL processing services
│       ├── quickbooks-etl.service.ts
│       ├── rootfi-etl.service.ts
│       └── unified-etl.service.ts
├── routes/             # Express route handlers
│   ├── health.routes.ts
│   ├── etl.routes.ts
│   ├── data.routes.ts
│   └── index.ts
├── utils/               # Utility functions
│   ├── helpers/         # Helper functions
│   │   ├── text.utils.ts
│   │   └── validation.utils.ts
│   ├── a.json          # QuickBooks sample data
│   └── b.json          # Rootfi sample data
└── app.ts              # Main application entry point
```

## 🚀 Usage

### Development Mode (CLI)

```bash
npm run dev
```

### API Server Mode

```bash
npm run server
```

### Build and Run

```bash
npm run build
npm start
```

### Process Specific Data Sources

**Process QuickBooks data only:**

```bash
npm run etl-quickbooks
```

**Process Rootfi data only:**

```bash
npm run etl-rootfi
```

**Process all data sources:**

```bash
npm run etl-all
```

### Testing

```bash
npm test
```

### Database Migration

```bash
npm run migrate
```

### Available Scripts

#### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run server` - Start API server

#### ETL Operations

- `npm run test` - Run tests
- `npm run test-etl` - Run ETL tests with sample data
- `npm run etl-quickbooks` - Process QuickBooks data only
- `npm run etl-rootfi` - Process Rootfi data only
- `npm run etl-all` - Process both data sources

#### Database Migrations

- `npm run migrate` - Show migration help
- `npm run migrate:setup` - Create database and run all migrations
- `npm run migrate:create-db` - Create database if it doesn't exist
- `npm run migrate:run` - Run all pending migrations
- `npm run migrate:status` - Show migration status
- `npm run migrate:revert` - Revert the last migration
- `npm run migrate:reset` - Reset migration state (when tables manually deleted)
- `npm run migrate:drop-tables` - Drop all tables for clean slate

#### Code Quality

- `npm run clean` - Clean build artifacts
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🌐 REST API

The application provides a REST API for ETL operations. Start the server with:

```bash
npm run server
```

### Available Endpoints

- **GET** `/health` - Health check
- **GET** `/api/data/statistics` - Get database statistics
- **POST** `/api/etl/quickbooks` - Process QuickBooks data
- **POST** `/api/etl/rootfi` - Process Rootfi data
- **POST** `/api/etl/all` - Process both data sources
- **DELETE** `/api/data/clear` - Clear all data from database

### Example API Usage

```bash
# Get statistics
curl http://localhost:3001/api/data/statistics

# Process QuickBooks data
curl -X POST http://localhost:3001/api/etl/quickbooks

# Process all data
curl -X POST http://localhost:3001/api/etl/all

# Clear database
curl -X DELETE http://localhost:3001/api/data/clear
```

## 📚 API Documentation

The application includes interactive OpenAPI/Swagger documentation that can be accessed at:

**http://localhost:3001/api-docs**

The documentation provides:

- Complete API endpoint descriptions
- Request/response schemas
- Interactive testing interface
- Example requests and responses

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 📊 Data Models

### Company

- Basic company information
- Associated with multiple report periods

### Report Period

- Financial reporting periods (monthly, quarterly, annual)
- Contains multiple financial categories

### Financial Category

- Standardized financial categories (income, expenses, etc.)
- Contains multiple line items

### Financial Line Item

- Individual financial transactions or line items

## 🔧 Configuration

### Database Configuration

The application uses TypeORM with PostgreSQL and migrations for schema management. Configuration is handled in `src/config/database.config.ts`:

```typescript
export const databaseConfig: DatabaseConfig = {
  type: "postgres",
  url: "",
  synchronize: false, // Disabled in favor of migrations for better control
  logging: process.env.DB_LOGGING === "true",
  entities: [User, Company, ReportPeriod, FinancialCategory, FinancialLineItem],
  migrations: [join(__dirname, "..", "database", "migrations", "*.ts")],
  migrationsTableName: "migrations",
};
```

**Note**: The application uses migrations instead of `synchronize: true` for better control over database schema changes. Always run migrations when setting up the database or deploying updates.

### ETL Configuration

ETL processing configuration in `src/config/database.config.ts`:

```typescript
export const etlConfig = {
  defaultCompanyId: 1,
  defaultGroup: "Ungrouped",
  enableLogging: true,
};
```

## 🔄 ETL Process

### QuickBooks Data Processing

1. **Extract**: Load QuickBooks JSON data
2. **Transform**: Convert to unified data structure
3. **Load**: Save to PostgreSQL database

### Rootfi Data Processing

1. **Extract**: Load Rootfi JSON data
2. **Transform**: Convert to unified data structure
3. **Load**: Save to PostgreSQL database

### Unified Processing

- Processes both data sources
- Maintains data integrity with transactions
- Provides comprehensive error handling

## 📈 API Usage

### Basic Usage

```typescript
import { FinancialDataApplication } from "./src/app";

const app = new FinancialDataApplication();

// Initialize the application
await app.initialize();

// Process all data
const result = await app.processAllData(
  "path/to/quickbooks.json",
  "path/to/rootfi.json"
);

// Display statistics
await app.displayStatistics();

// Shutdown gracefully
await app.shutdown();
```

### Individual Data Source Processing

```typescript
// Process QuickBooks data only
const quickBooksResult = await app.processQuickBooksData(
  "path/to/quickbooks.json"
);

// Process Rootfi data only
const rootfiResult = await app.processRootfiData("path/to/rootfi.json");
```

## 🧪 Testing

The application includes sample data files (`a.json` for QuickBooks and `b.json` for Rootfi) for testing purposes.

### Running Tests

```bash
npm test
```

This will:

1. Build the TypeScript code
2. Copy sample data files to the dist directory
3. Run the ETL process with sample data
4. Display results and statistics

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure PostgreSQL is running
   - Check database credentials in `.env` file
   - Verify database `ahs` exists

2. **TypeScript Compilation Errors**

   - Run `npm run type-check` to identify issues
   - Ensure all dependencies are installed

3. **ETL Processing Errors**
   - Check data file paths
   - Verify JSON data format
   - Review error logs for specific issues

### Debug Mode

Enable detailed logging by setting `DB_LOGGING=true` in your `.env` file.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- Create an issue on GitHub
- Contact the maintainer

## 🔄 Version History

- **v1.0.0**: Initial release with QuickBooks and Rootfi ETL support
