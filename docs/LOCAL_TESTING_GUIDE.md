# Local Testing Guide - REST API

## 🎯 Overview

This guide shows you how to test the REST API locally on your machine using various tools and methods.

---

## 📋 Prerequisites

Before testing, ensure you have:
- ✅ PostgreSQL running locally (port 5432)
- ✅ Database `YFS_STATISTICS_DETAIL` table created
- ✅ Backend API running (port 3000)
- ✅ Sample data in the database

---

## 🚀 Step-by-Step Setup

### Step 1: Start PostgreSQL and Create Database

```bash
# Start PostgreSQL (if not running)
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE statistics_db;
CREATE USER gatling WITH PASSWORD 'gatling123';
GRANT ALL PRIVILEGES ON DATABASE statistics_db TO gatling;

# Exit and reconnect to new database
\q
psql -U gatling -d statistics_db

# Run schema script
\i /path/to/watson-orchestration-agent/database/yfs_statistics_detail_schema.sql
```

### Step 2: Insert Test Data

```sql
-- Insert sample data for testing
INSERT INTO YFS_STATISTICS_DETAIL VALUES
('STAT001', '2026-02-10 10:00:00', '2026-02-10 10:59:59', 'createorder', 'SERVER001', 'hostname001', 'CreateOrderService', 'INTEGRATION', 'OrderManagement', 'Invocations', 150.00, 'system', 'system', 'STATS_COLLECTOR', 'STATS_COLLECTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('STAT002', '2026-02-10 11:00:00', '2026-02-10 11:59:59', 'createorder', 'SERVER001', 'hostname001', 'CreateOrderService', 'INTEGRATION', 'OrderManagement', 'Invocations', 200.00, 'system', 'system', 'STATS_COLLECTOR', 'STATS_COLLECTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('STAT003', '2026-02-10 12:00:00', '2026-02-10 12:59:59', 'createorder', 'SERVER001', 'hostname001', 'CreateOrderService', 'INTEGRATION', 'OrderManagement', 'Invocations', 180.00, 'system', 'system', 'STATS_COLLECTOR', 'STATS_COLLECTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('STAT004', '2026-02-10 10:00:00', '2026-02-10 10:59:59', 'getorder', 'SERVER002', 'hostname002', 'GetOrderService', 'INTEGRATION', 'OrderManagement', 'Invocations', 300.00, 'system', 'system', 'STATS_COLLECTOR', 'STATS_COLLECTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('STAT005', '2026-02-10 11:00:00', '2026-02-10 11:59:59', 'getorder', 'SERVER002', 'hostname002', 'GetOrderService', 'INTEGRATION', 'OrderManagement', 'Invocations', 350.00, 'system', 'system', 'STATS_COLLECTOR', 'STATS_COLLECTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);

-- Verify data
SELECT * FROM YFS_STATISTICS_DETAIL;
```

### Step 3: Configure Backend

```bash
# Navigate to backend directory
cd watson-orchestration-agent/backend

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Configure `.env`:**
```bash
NODE_ENV=development
PORT=3000
API_KEY=test-api-key-12345

DB_HOST=localhost
DB_PORT=5432
DB_NAME=statistics_db
DB_USER=gatling
DB_PASSWORD=gatling123
DB_SSL=false

LOG_LEVEL=debug
CORS_ORIGIN=*
```

### Step 4: Install Dependencies and Start Server

```bash
# Install dependencies
npm install

# Start server
npm start

# You should see:
# Server started on port 3000
# Database connection established
```

---

## 🧪 Testing Methods

### Method 1: Using cURL (Command Line)

#### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T15:00:00.000Z",
  "uptime": 123.45,
  "database": {
    "connected": true,
    "pool": {
      "total": 2,
      "idle": 2,
      "waiting": 0
    }
  }
}
```

#### Test 2: Get Order Statistics
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/orders/stats?server_name=createorder&service_type=INTEGRATION&statistic_name=Invocations&date_start=2026-02-10&date_end=2026-02-10&aggregation=hourly"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 530,
    "aggregation": "hourly",
    "breakdown": [
      {
        "date": "2026-02-10T10:00:00Z",
        "value": 150,
        "record_count": 1
      },
      {
        "date": "2026-02-10T11:00:00Z",
        "value": 200,
        "record_count": 1
      },
      {
        "date": "2026-02-10T12:00:00Z",
        "value": 180,
        "record_count": 1
      }
    ]
  },
  "metadata": {
    "server_name": "createorder",
    "service_type": "INTEGRATION",
    "statistic_name": "Invocations",
    "date_start": "2026-02-10T00:00:00Z",
    "date_end": "2026-02-10T23:59:59Z",
    "aggregation": "hourly",
    "count": 3
  }
}
```

#### Test 3: Get Component Performance
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?server_name=createorder&service_type=INTEGRATION&date_start=2026-02-10&date_end=2026-02-10"
```

#### Test 4: List All Services
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/services/list?limit=10"
```

#### Test 5: Get Time Series Data
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/timeseries?server_name=createorder&statistic_name=Invocations&date_start=2026-02-10&aggregation=hourly"
```

#### Test 6: Test Watson Webhook
```bash
curl -X POST http://localhost:3000/api/webhook/watson \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-12345" \
  -d '{
    "intent": "query_order_statistics",
    "entities": {
      "server_name": "createorder",
      "service_type": "INTEGRATION",
      "statistic_name": "Invocations",
      "date_start": "2026-02-10",
      "aggregation": "hourly"
    },
    "context": {}
  }'
```

---

### Method 2: Using Postman

#### Setup Postman Collection

1. **Open Postman**
2. **Create New Collection**: "Watson Statistics API"
3. **Add Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `api_key`: `test-api-key-12345`

#### Request 1: Health Check

```
Method: GET
URL: {{base_url}}/api/health
Headers: (none required)
```

#### Request 2: Order Statistics

```
Method: GET
URL: {{base_url}}/api/query/orders/stats
Headers:
  X-API-Key: {{api_key}}
Query Params:
  server_name: createorder
  service_type: INTEGRATION
  statistic_name: Invocations
  date_start: 2026-02-10
  date_end: 2026-02-10
  aggregation: hourly
```

#### Request 3: Component Performance

```
Method: GET
URL: {{base_url}}/api/query/component/performance
Headers:
  X-API-Key: {{api_key}}
Query Params:
  server_name: createorder
  date_start: 2026-02-10
  date_end: 2026-02-10
```

#### Request 4: Watson Webhook

```
Method: POST
URL: {{base_url}}/api/webhook/watson
Headers:
  Content-Type: application/json
  X-API-Key: {{api_key}}
Body (JSON):
{
  "intent": "query_order_statistics",
  "entities": {
    "server_name": "createorder",
    "service_type": "INTEGRATION",
    "statistic_name": "Invocations",
    "date_start": "2026-02-10"
  }
}
```

---

### Method 3: Using HTTPie (Prettier than cURL)

```bash
# Install HTTPie
pip install httpie  # or: brew install httpie

# Test health endpoint
http GET localhost:3000/api/health

# Test order statistics
http GET localhost:3000/api/query/orders/stats \
  X-API-Key:test-api-key-12345 \
  server_name==createorder \
  service_type==INTEGRATION \
  statistic_name==Invocations \
  date_start==2026-02-10

# Test webhook
http POST localhost:3000/api/webhook/watson \
  X-API-Key:test-api-key-12345 \
  intent=query_order_statistics \
  entities:='{"server_name":"createorder"}'
```

---

### Method 4: Using Browser (for GET requests)

Simply open your browser and navigate to:

```
http://localhost:3000/api/health
```

For authenticated endpoints, you'll need a browser extension like:
- **ModHeader** (Chrome/Firefox) - to add X-API-Key header
- **RESTClient** (Firefox)
- **Advanced REST Client** (Chrome)

---

### Method 5: Using Node.js Script

Create a test script `test-api.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'test-api-key-12345';

async function testAPI() {
  try {
    // Test 1: Health Check
    console.log('Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health:', health.data.status);

    // Test 2: Order Statistics
    console.log('\nTesting Order Statistics...');
    const stats = await axios.get(`${BASE_URL}/api/query/orders/stats`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        server_name: 'createorder',
        service_type: 'INTEGRATION',
        statistic_name: 'Invocations',
        date_start: '2026-02-10',
        date_end: '2026-02-10'
      }
    });
    console.log('✅ Total Orders:', stats.data.data.total_orders);

    // Test 3: Services List
    console.log('\nTesting Services List...');
    const services = await axios.get(`${BASE_URL}/api/query/services/list`, {
      headers: { 'X-API-Key': API_KEY },
      params: { limit: 5 }
    });
    console.log('✅ Services Found:', services.data.data.length);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
```

Run it:
```bash
node test-api.js
```

---

### Method 6: Using Python Script

Create `test_api.py`:

```python
import requests
import json

BASE_URL = 'http://localhost:3000'
API_KEY = 'test-api-key-12345'
HEADERS = {'X-API-Key': API_KEY}

def test_health():
    print('Testing Health Check...')
    response = requests.get(f'{BASE_URL}/api/health')
    print(f'✅ Status: {response.json()["status"]}')

def test_order_stats():
    print('\nTesting Order Statistics...')
    params = {
        'server_name': 'createorder',
        'service_type': 'INTEGRATION',
        'statistic_name': 'Invocations',
        'date_start': '2026-02-10',
        'date_end': '2026-02-10'
    }
    response = requests.get(
        f'{BASE_URL}/api/query/orders/stats',
        headers=HEADERS,
        params=params
    )
    data = response.json()
    print(f'✅ Total Orders: {data["data"]["total_orders"]}')

def test_services_list():
    print('\nTesting Services List...')
    response = requests.get(
        f'{BASE_URL}/api/query/services/list',
        headers=HEADERS,
        params={'limit': 5}
    )
    data = response.json()
    print(f'✅ Services Found: {len(data["data"])}')

if __name__ == '__main__':
    test_health()
    test_order_stats()
    test_services_list()
    print('\n✅ All tests passed!')
```

Run it:
```bash
python test_api.py
```

---

## 🔍 Testing Checklist

### Basic Tests
- [ ] Health endpoint returns 200
- [ ] Database connection is healthy
- [ ] API requires authentication (test without API key)
- [ ] Invalid API key returns 403

### Order Statistics Tests
- [ ] Get total orders for createorder service
- [ ] Get hourly breakdown
- [ ] Get daily breakdown
- [ ] Test with different date ranges
- [ ] Test with invalid server name (should return empty)

### Component Performance Tests
- [ ] Get performance for specific component
- [ ] Get performance for all components
- [ ] Test with date filters
- [ ] Test different metrics (avg, max, min)

### Services List Tests
- [ ] List all services
- [ ] Search by service type
- [ ] Test pagination (limit parameter)
- [ ] Test sorting

### Time Series Tests
- [ ] Get hourly time series
- [ ] Get daily time series
- [ ] Test with different statistics
- [ ] Verify data points count

### Watson Webhook Tests
- [ ] Test query_order_statistics intent
- [ ] Test query_component_performance intent
- [ ] Test query_component_list intent
- [ ] Test with various entity combinations

---

## 🐛 Troubleshooting

### Issue: Connection Refused

```bash
# Check if server is running
curl http://localhost:3000/api/health

# If not running, start it
cd backend
npm start
```

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql -U gatling -d statistics_db -c "SELECT 1"

# Check .env configuration
cat .env | grep DB_
```

### Issue: No Data Returned

```sql
-- Check if data exists
SELECT COUNT(*) FROM YFS_STATISTICS_DETAIL;

-- Check date ranges
SELECT MIN(START_TIME_STAMP), MAX(END_TIME_STAMP) 
FROM YFS_STATISTICS_DETAIL;

-- Insert test data if needed
-- (see Step 2 above)
```

### Issue: 401 Unauthorized

```bash
# Make sure you're including the API key
curl -H "X-API-Key: test-api-key-12345" \
  http://localhost:3000/api/query/orders/stats

# Check .env file has correct API_KEY
grep API_KEY .env
```

---

## 📊 Expected Results Summary

| Endpoint | Expected Status | Expected Data |
|----------|----------------|---------------|
| `/api/health` | 200 | `{"status": "healthy"}` |
| `/api/query/orders/stats` | 200 | Order statistics with breakdown |
| `/api/query/component/performance` | 200 | Component metrics |
| `/api/query/services/list` | 200 | Array of services |
| `/api/query/timeseries` | 200 | Time series data points |
| `/api/webhook/watson` | 200 | Formatted text response |

---

## 🎯 Quick Test Script

Save this as `quick-test.sh`:

```bash
#!/bin/bash

API_KEY="test-api-key-12345"
BASE_URL="http://localhost:3000"

echo "🧪 Testing Watson Statistics API..."
echo ""

echo "1️⃣ Health Check..."
curl -s $BASE_URL/api/health | jq .status
echo ""

echo "2️⃣ Order Statistics..."
curl -s -H "X-API-Key: $API_KEY" \
  "$BASE_URL/api/query/orders/stats?server_name=createorder&service_type=INTEGRATION&statistic_name=Invocations&date_start=2026-02-10" \
  | jq .data.total_orders
echo ""

echo "3️⃣ Services List..."
curl -s -H "X-API-Key: $API_KEY" \
  "$BASE_URL/api/query/services/list?limit=5" \
  | jq '.data | length'
echo ""

echo "✅ Tests complete!"
```

Make it executable and run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

**Happy Testing! 🚀**