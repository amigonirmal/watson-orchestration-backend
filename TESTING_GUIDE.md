# Backend Testing Guide

This guide will help you test the Watson Orchestration Backend API with your local PostgreSQL database.

## Prerequisites

✅ PostgreSQL running in Docker (port 5432)
✅ Database with `yfs_statistics_detail` table
✅ Node.js installed (v18+)

## Quick Start

### Step 1: Verify PostgreSQL is Running

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# If not running, start it:
docker run --name postgres-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:14.20
```

### Step 2: Create Table and Insert Test Data

```bash
# Connect to PostgreSQL
docker exec -it postgres-db psql -U postgres

# Create the table (paste the CREATE TABLE statement from your schema)
# Or run the SQL file:
```

```sql
-- Create table
CREATE TABLE yfs_statistics_detail (
    statistics_detail_key   CHAR(24) NOT NULL DEFAULT ' ',
    start_time_stamp        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time_stamp          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    server_name             VARCHAR(100) NOT NULL DEFAULT ' ',
    server_id               VARCHAR(100) NOT NULL DEFAULT ' ',
    hostname                VARCHAR(100) NOT NULL DEFAULT ' ',
    service_name            VARCHAR(100) NOT NULL DEFAULT ' ',
    service_type            VARCHAR(40)  NOT NULL DEFAULT ' ',
    context_name            VARCHAR(255) NOT NULL DEFAULT ' ',
    statistic_name          VARCHAR(80)  NOT NULL DEFAULT ' ',
    statistic_value         NUMERIC(15,2) NOT NULL DEFAULT 0,
    createuserid            VARCHAR(40) NOT NULL DEFAULT ' ',
    modifyuserid            VARCHAR(40) NOT NULL DEFAULT ' ',
    createprogid            VARCHAR(40) NOT NULL DEFAULT ' ',
    modifyprogid            VARCHAR(40) NOT NULL DEFAULT ' ',
    createts                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modifyts                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lockid                  INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT yfs_statistics_detail_pk PRIMARY KEY (statistics_detail_key)
);
```

Then insert test data:

```bash
# From your host machine, run:
docker exec -i postgres-db psql -U postgres < database/insert_test_data.sql
```

Or manually in psql:
```sql
\i /path/to/database/insert_test_data.sql
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Start the Backend Server

```bash
# From the backend directory
npm start

# Or for development with auto-reload:
npm run dev
```

You should see:
```
Server started on port 3000
Database connection established
```

### Step 5: Run the Test Script

Open a new terminal and run:

```bash
# From the project root directory
node test-backend.js
```

## Manual Testing with cURL

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

### Test 2: Get Components List
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/components/list?limit=10"
```

### Test 3: Get General Statistics
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/stats?date_start=2026-02-01&date_end=2026-02-28"
```

### Test 4: Get Component Performance
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?date_start=2026-02-01&date_end=2026-02-28"
```

### Test 5: Get Time Series Data
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/timeseries?date_start=2026-02-10&date_end=2026-02-10&aggregation=hourly"
```

### Test 6: Get Order Statistics
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/orders/stats?date_start=2026-02-10&date_end=2026-02-10&aggregation=hourly"
```

## Testing with Postman

1. **Import Collection**: Create a new collection called "Watson API Tests"
2. **Set Variables**:
   - `base_url`: `http://localhost:3000`
   - `api_key`: `test-api-key-12345`

3. **Create Requests**:

#### Request 1: Health Check
- Method: `GET`
- URL: `{{base_url}}/api/health`

#### Request 2: Components List
- Method: `GET`
- URL: `{{base_url}}/api/query/components/list`
- Headers: `X-API-Key: {{api_key}}`
- Params: `limit=10`

#### Request 3: General Stats
- Method: `GET`
- URL: `{{base_url}}/api/query/stats`
- Headers: `X-API-Key: {{api_key}}`
- Params: 
  - `date_start=2026-02-01`
  - `date_end=2026-02-28`

## Verifying Data in Database

```bash
# Connect to PostgreSQL
docker exec -it postgres-db psql -U postgres

# Check if table exists
\dt

# Count records
SELECT COUNT(*) FROM yfs_statistics_detail;

# View sample data
SELECT 
    server_name,
    service_name,
    statistic_name,
    statistic_value,
    start_time_stamp
FROM yfs_statistics_detail
LIMIT 10;

# Check data by server
SELECT 
    server_name,
    COUNT(*) as record_count,
    SUM(statistic_value) as total_value
FROM yfs_statistics_detail
GROUP BY server_name
ORDER BY record_count DESC;
```

## Troubleshooting

### Issue: "Connection refused"
**Solution**: Make sure the backend server is running
```bash
cd backend
npm start
```

### Issue: "Database connection failed"
**Solution**: Check PostgreSQL is running and credentials are correct
```bash
docker ps | grep postgres
# Check .env file has correct DB credentials
```

### Issue: "No data returned"
**Solution**: Insert test data
```bash
docker exec -i postgres-db psql -U postgres < database/insert_test_data.sql
```

### Issue: "401 Unauthorized"
**Solution**: Include the API key header
```bash
curl -H "X-API-Key: test-api-key-12345" http://localhost:3000/api/query/stats
```

### Issue: "Module not found"
**Solution**: Install dependencies
```bash
cd backend
npm install
```

## Expected Test Results

When running `node test-backend.js`, you should see:

```
✅ Root endpoint accessible
✅ Health check passed: healthy
✅ Database has 10 records
✅ Authentication properly enforced
✅ Order statistics retrieved successfully
✅ Component performance retrieved: 4 components found
✅ Components list retrieved: 4 components found
✅ Time series data retrieved: X data points
✅ General statistics retrieved successfully

Success Rate: 100.0%
🎉 All tests passed! Your backend is working correctly.
```

## API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/health` | GET | No | Health check |
| `/` | GET | No | API info |
| `/api/query/stats` | GET | Yes | General statistics |
| `/api/query/components/list` | GET | Yes | List all components |
| `/api/query/component/performance` | GET | Yes | Component performance metrics |
| `/api/query/timeseries` | GET | Yes | Time series data |
| `/api/query/orders/stats` | GET | Yes | Order statistics |

## Next Steps

1. ✅ Verify all tests pass
2. 📊 Add more test data for comprehensive testing
3. 🔧 Customize queries based on your needs
4. 🚀 Deploy to production environment
5. 📝 Document your specific use cases

## Support

If you encounter issues:
1. Check the backend logs in the terminal
2. Verify PostgreSQL connection
3. Ensure test data is inserted
4. Check API key is correct

---

**Made with Bob** 🤖