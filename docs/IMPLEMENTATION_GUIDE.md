# Complete Implementation Guide - Watson Assistant for PostgreSQL Statistics

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Database Setup](#step-1-database-setup)
3. [Step 2: Backend API Setup](#step-2-backend-api-setup)
4. [Step 3: Watson Assistant Configuration](#step-3-watson-assistant-configuration)
5. [Step 4: Testing](#step-4-testing)
6. [Step 5: Deployment](#step-5-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **PostgreSQL**: 13.x or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **curl** or **Postman**: For API testing

### Required Accounts
- **IBM Cloud Account**: [Sign up here](https://cloud.ibm.com/registration)
- **Watson Assistant Service**: Create in IBM Cloud

### Skills Required
- Basic SQL knowledge
- Basic Node.js/JavaScript knowledge
- Understanding of REST APIs
- Familiarity with command line

---

## Step 1: Database Setup

### 1.1 Connect to PostgreSQL

```bash
# Connect as postgres user
psql -U postgres

# Or connect to specific database
psql -U postgres -d your_database_name
```

### 1.2 Create Database (if needed)

```sql
-- Create database
CREATE DATABASE statistics_db;

-- Connect to the database
\c statistics_db

-- Create user
CREATE USER gatling WITH PASSWORD 'gatling123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE statistics_db TO gatling;
```

### 1.3 Run Schema Creation Script

```bash
# From project root directory
cd watson-orchestration-agent

# Run the schema script
psql -U gatling -d statistics_db -f database/yfs_statistics_detail_schema.sql
```

### 1.4 Verify Table Creation

```sql
-- List tables
\dt

-- Describe YFS_STATISTICS_DETAIL table
\d YFS_STATISTICS_DETAIL

-- Check indexes
\di

-- Verify sample data
SELECT COUNT(*) FROM YFS_STATISTICS_DETAIL;
```

### 1.5 Insert Test Data (Optional)

```sql
-- Insert sample records for testing
INSERT INTO YFS_STATISTICS_DETAIL VALUES
('STAT001', 
 '2026-02-10 10:00:00.000000', 
 '2026-02-10 10:59:59.999999',
 'createorder', 
 'SERVER001', 
 'hostname001',
 'CreateOrderService', 
 'INTEGRATION', 
 'OrderManagement',
 'Invocations', 
 150.00,
 'system', 
 'system', 
 'STATS_COLLECTOR', 
 'STATS_COLLECTOR',
 CURRENT_TIMESTAMP, 
 CURRENT_TIMESTAMP, 
 1);

-- Verify insertion
SELECT * FROM YFS_STATISTICS_DETAIL WHERE STATISTICS_DETAIL_KEY = 'STAT001';
```

---

## Step 2: Backend API Setup

### 2.1 Clone/Download Project

```bash
# Navigate to your workspace
cd ~/projects

# If using git
git clone <repository-url>
cd watson-orchestration-agent

# Or if you have the files locally
cd watson-orchestration-agent
```

### 2.2 Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# This will install:
# - express (web framework)
# - pg (PostgreSQL client)
# - winston (logging)
# - joi (validation)
# - and other dependencies
```

### 2.3 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

**Edit `.env` file:**

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_KEY=my-secure-api-key-12345

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=statistics_db
DB_USER=gatling
DB_PASSWORD=gatling123
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# Watson Assistant Configuration (will add later)
WATSON_API_KEY=
WATSON_ASSISTANT_ID=
WATSON_URL=https://api.us-south.assistant.watson.cloud.ibm.com
WATSON_VERSION=2021-11-27

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Visualization
QUICKCHART_API_URL=https://quickchart.io/chart

# CORS
CORS_ORIGIN=*
```

### 2.4 Test Database Connection

```bash
# Start the server
npm start

# In another terminal, test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "database": {
#     "connected": true
#   }
# }
```

### 2.5 Test API Endpoints

```bash
# Test order statistics endpoint
curl -H "X-API-Key: my-secure-api-key-12345" \
  "http://localhost:3000/api/query/orders/stats?server_name=createorder&service_type=INTEGRATION&statistic_name=Invocations&date_start=2026-02-01&date_end=2026-02-10"

# Test services list endpoint
curl -H "X-API-Key: my-secure-api-key-12345" \
  "http://localhost:3000/api/query/services/list?limit=10"

# Test component performance endpoint
curl -H "X-API-Key: my-secure-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?server_name=createorder&date_start=last_7_days"
```

---

## Step 3: Watson Assistant Configuration

### 3.1 Create Watson Assistant Service

1. **Log in to IBM Cloud**
   - Go to [IBM Cloud Console](https://cloud.ibm.com)
   - Log in with your credentials

2. **Create Watson Assistant Service**
   - Click "Create resource"
   - Search for "Watson Assistant"
   - Select "Watson Assistant"
   - Choose a plan (Lite/Plus/Enterprise)
   - Select region (e.g., Dallas, London)
   - Click "Create"

3. **Get API Credentials**
   - Go to service instance
   - Click "Service credentials"
   - Click "New credential"
   - Copy the API key and URL

### 3.2 Create Assistant

1. **Launch Watson Assistant**
   - Click "Launch Watson Assistant"
   - Click "Create assistant"
   - Name: "Statistics Query Assistant"
   - Description: "Query PostgreSQL statistics"
   - Click "Create assistant"

2. **Note Assistant ID**
   - Go to Assistant settings
   - Copy the Assistant ID
   - Update `.env` file with credentials:

```bash
WATSON_API_KEY=your-api-key-here
WATSON_ASSISTANT_ID=your-assistant-id-here
WATSON_URL=https://api.us-south.assistant.watson.cloud.ibm.com
```

### 3.3 Import Intents

1. **Navigate to Intents**
   - In Watson Assistant, click "Intents"
   - Click "Create intent"

2. **Import from JSON**
   - Click "Upload/Download"
   - Click "Upload"
   - Select `watson-assistant/intents.json`
   - Click "Upload"

3. **Verify Intents**
   - You should see intents like:
     - `query_order_statistics`
     - `query_component_performance`
     - `query_component_list`
     - `generate_visualization`
     - `query_date_range_stats`

### 3.4 Import Entities

1. **Navigate to Entities**
   - Click "Entities"
   - Click "Create entity"

2. **Import from JSON**
   - Click "Upload/Download"
   - Click "Upload"
   - Select `watson-assistant/entities.json`
   - Click "Upload"

3. **Verify Entities**
   - You should see entities like:
     - `@date`
     - `@metric`
     - `@aggregation`
     - `@component`
     - `@statistic_type`

### 3.5 Configure Dialog

1. **Navigate to Dialog**
   - Click "Dialog"
   - Click "Create dialog"

2. **Import Dialog Nodes**
   - Click "Upload/Download"
   - Click "Upload"
   - Select `watson-assistant/dialog-nodes.json`
   - Click "Upload"

3. **Verify Dialog Flow**
   - Check that nodes are created:
     - Welcome
     - Query Order Statistics
     - Query Component Performance
     - Generate Visualization
     - etc.

### 3.6 Configure Webhook

1. **Go to Options**
   - Click "Options" in left sidebar
   - Click "Webhooks"

2. **Add Webhook URL**
   - URL: `http://your-server:3000/api/webhook/watson`
   - For local testing: `http://localhost:3000/api/webhook/watson`
   - For production: `https://your-domain.com/api/webhook/watson`

3. **Add Authentication**
   - Header name: `X-API-Key`
   - Header value: `my-secure-api-key-12345`

4. **Save Configuration**

### 3.7 Test in Watson Assistant

1. **Open Preview**
   - Click "Preview" button (chat icon)
   - Try sample queries:

```
"What's the maximum number of orders created yesterday?"
"Show me performance of createorder service"
"List all available components"
"Generate a graph of order trends"
```

2. **Check Responses**
   - Verify Watson calls your webhook
   - Check backend logs for webhook calls
   - Verify responses are formatted correctly

---

## Step 4: Testing

### 4.1 Unit Tests

```bash
# Run unit tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

### 4.2 Integration Tests

```bash
# Test database queries
npm run test:db

# Test API endpoints
npm run test:api

# Test Watson webhook
npm run test:webhook
```

### 4.3 Manual Testing Checklist

**Database Tests:**
- [ ] Can connect to PostgreSQL
- [ ] Can query YFS_STATISTICS_DETAIL table
- [ ] Indexes are working
- [ ] Sample data exists

**API Tests:**
- [ ] Health endpoint returns 200
- [ ] Order statistics endpoint works
- [ ] Component performance endpoint works
- [ ] Services list endpoint works
- [ ] Time series endpoint works
- [ ] Authentication works (API key required)
- [ ] Rate limiting works

**Watson Tests:**
- [ ] Intents are recognized correctly
- [ ] Entities are extracted correctly
- [ ] Webhook is called successfully
- [ ] Responses are formatted correctly
- [ ] Visualizations are generated

### 4.4 Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install ab  # macOS

# Run load test
ab -n 1000 -c 10 -H "X-API-Key: my-secure-api-key-12345" \
  http://localhost:3000/api/query/orders/stats?server_name=createorder
```

---

## Step 5: Deployment

### 5.1 Production Preparation

```bash
# Set production environment
export NODE_ENV=production

# Update .env for production
nano .env
```

**Production `.env`:**
```bash
NODE_ENV=production
PORT=3000
API_KEY=<strong-random-api-key>
DB_HOST=<production-db-host>
DB_PASSWORD=<strong-db-password>
DB_SSL=true
LOG_LEVEL=warn
CORS_ORIGIN=https://your-domain.com
```

### 5.2 Docker Deployment

```bash
# Build Docker image
cd watson-orchestration-agent/backend
docker build -t watson-backend:latest .

# Run container
docker run -d \
  --name watson-backend \
  -p 3000:3000 \
  --env-file .env \
  watson-backend:latest

# Check logs
docker logs -f watson-backend
```

### 5.3 Docker Compose Deployment

```bash
# Navigate to deployment directory
cd watson-orchestration-agent/deployment

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 5.4 Cloud Deployment (IBM Cloud)

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login
ibmcloud login

# Target Cloud Foundry
ibmcloud target --cf

# Deploy application
cd watson-orchestration-agent/backend
ibmcloud cf push watson-backend

# Check status
ibmcloud cf apps

# View logs
ibmcloud cf logs watson-backend --recent
```

### 5.5 Configure Production Watson Webhook

1. **Update Webhook URL**
   - Go to Watson Assistant
   - Options → Webhooks
   - Update URL to production: `https://your-domain.com/api/webhook/watson`

2. **Test Production Webhook**
   - Use Watson Assistant preview
   - Verify it calls production API
   - Check production logs

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U gatling -d statistics_db -h localhost

# Check pg_hba.conf for authentication
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### API Not Responding

**Problem:** API endpoints return errors

**Solutions:**
```bash
# Check server is running
curl http://localhost:3000/api/health

# Check logs
tail -f backend/logs/combined.log

# Restart server
npm start

# Check environment variables
cat .env
```

### Watson Webhook Fails

**Problem:** Watson cannot call webhook

**Solutions:**
1. **Check webhook URL is accessible**
   ```bash
   curl -X POST http://your-server:3000/api/webhook/watson \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{"intent":"query_order_statistics","entities":{}}'
   ```

2. **Check firewall rules**
   - Ensure port 3000 is open
   - Check cloud security groups

3. **Check API key**
   - Verify API key in Watson matches .env

4. **Check logs**
   ```bash
   # Backend logs
   tail -f backend/logs/combined.log
   
   # Watson Assistant logs
   # Check in Watson Assistant dashboard
   ```

### No Data Returned

**Problem:** Queries return empty results

**Solutions:**
```sql
-- Check if data exists
SELECT COUNT(*) FROM YFS_STATISTICS_DETAIL;

-- Check date ranges
SELECT MIN(START_TIME_STAMP), MAX(END_TIME_STAMP) 
FROM YFS_STATISTICS_DETAIL;

-- Check server names
SELECT DISTINCT SERVER_NAME FROM YFS_STATISTICS_DETAIL;

-- Insert test data
INSERT INTO YFS_STATISTICS_DETAIL VALUES (...);
```

### Performance Issues

**Problem:** Queries are slow

**Solutions:**
```sql
-- Check indexes
\di

-- Analyze query performance
EXPLAIN ANALYZE 
SELECT SUM(STATISTIC_VALUE) 
FROM YFS_STATISTICS_DETAIL 
WHERE SERVER_NAME = 'createorder';

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY MV_YFS_STATISTICS_HOURLY;

-- Update statistics
ANALYZE YFS_STATISTICS_DETAIL;
```

---

## Next Steps

1. **Customize for Your Needs**
   - Add more intents
   - Modify dialog flows
   - Add custom queries

2. **Enhance Security**
   - Implement JWT authentication
   - Add role-based access control
   - Enable HTTPS

3. **Add Monitoring**
   - Set up Prometheus metrics
   - Configure Grafana dashboards
   - Add alerting

4. **Scale the System**
   - Add load balancer
   - Implement caching (Redis)
   - Use database read replicas

---

## Support

For issues and questions:
- Check [README.md](../README.md)
- Review [API Specification](API_SPECIFICATION.md)
- Check [Architecture Design](ARCHITECTURE.md)
- Create an issue in the repository

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-10  
**Author:** Bob (AI Assistant)