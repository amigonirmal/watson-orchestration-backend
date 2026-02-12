# WatsonX Orchestrate Agent Configuration Guide

## Overview

This guide provides detailed instructions for configuring a WatsonX Orchestrate agent to use the Watson Orchestration Backend APIs for querying YFS statistics data.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Recommended LLM Configuration](#recommended-llm-configuration)
3. [API Integration Setup](#api-integration-setup)
4. [Skill Configuration](#skill-configuration)
5. [Test Scenarios](#test-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Information

- **API Base URL**: Your deployed backend URL (e.g., `https://your-cloud-run-url.run.app` or `http://localhost:3000`)
- **API Key**: Authentication key from your `.env` file (`API_KEY` value)
- **Database Access**: Ensure PostgreSQL database is accessible from the backend
- **WatsonX Orchestrate Access**: Valid IBM Cloud account with WatsonX Orchestrate provisioned

### Backend Deployment Status

Ensure your backend is deployed and accessible:
```bash
# Test health endpoint
curl -X GET "https://your-api-url/api/health"

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-12T15:45:00.000Z"
}
```

---

## Recommended LLM Configuration

### Primary Recommendation: **IBM Granite 13B Chat v2**

**Why Granite 13B Chat v2?**
- ✅ **Optimized for Enterprise**: Built specifically for business applications
- ✅ **SQL Query Understanding**: Excellent at understanding database queries and statistics
- ✅ **JSON Handling**: Strong structured data parsing capabilities
- ✅ **Cost-Effective**: Lower cost per token compared to larger models
- ✅ **Low Latency**: Fast response times for real-time queries
- ✅ **IBM Integration**: Native integration with WatsonX platform

**Configuration Settings**:
```yaml
Model: granite-13b-chat-v2
Temperature: 0.3          # Lower for consistent, factual responses
Max Tokens: 2048          # Sufficient for detailed responses
Top P: 0.85              # Balanced creativity vs accuracy
Frequency Penalty: 0.2   # Reduce repetition
Presence Penalty: 0.1    # Encourage diverse vocabulary
```

### Alternative Options

#### Option 2: **IBM Granite 20B Code**
**Best for**: Complex data transformations and calculations
```yaml
Model: granite-20b-code
Temperature: 0.2
Max Tokens: 4096
Use Case: Advanced analytics, custom calculations
```

#### Option 3: **Llama 2 70B Chat**
**Best for**: Conversational interactions with detailed explanations
```yaml
Model: llama-2-70b-chat
Temperature: 0.4
Max Tokens: 3072
Use Case: User-friendly explanations, natural conversations
```

#### Option 4: **Mixtral 8x7B**
**Best for**: Multi-step reasoning and complex queries
```yaml
Model: mixtral-8x7b-instruct
Temperature: 0.3
Max Tokens: 2048
Use Case: Complex filtering, multi-criteria queries
```

### LLM Selection Matrix

| Use Case | Recommended Model | Temperature | Reasoning |
|----------|------------------|-------------|-----------|
| Simple statistics queries | Granite 13B Chat v2 | 0.3 | Fast, accurate, cost-effective |
| Complex filtering | Mixtral 8x7B | 0.3 | Better multi-step reasoning |
| Data analysis | Granite 20B Code | 0.2 | Strong analytical capabilities |
| User conversations | Llama 2 70B Chat | 0.4 | Natural language understanding |
| Production (general) | Granite 13B Chat v2 | 0.3 | Best balance of all factors |

---

## API Integration Setup

### Step 1: Create Custom Extension in WatsonX Orchestrate

1. **Navigate to Extensions**
   - Go to WatsonX Orchestrate dashboard
   - Click "Extensions" → "Create Extension"

2. **Import OpenAPI Specification**
   - Choose "Import from URL" or "Upload File"
   - Use the Swagger JSON from: `https://your-api-url/api-docs/swagger.json`
   - Or upload `backend/swagger.json` from your repository

3. **Configure Authentication**
   ```yaml
   Authentication Type: API Key
   API Key Location: Header
   Header Name: X-API-Key
   API Key Value: [Your API_KEY from .env file]
   ```

4. **Set Base URL**
   ```
   Base URL: https://your-cloud-run-url.run.app
   ```

### Step 2: Configure API Endpoints

The following endpoints should be automatically imported from the OpenAPI spec:

#### Core Query Endpoints

1. **GET /api/query/stats**
   - **Purpose**: Get general statistics
   - **Parameters**: 
     - `start_date` (optional): YYYY-MM-DD format
     - `end_date` (optional): YYYY-MM-DD format
     - `service_name` (optional): Filter by service name
     - `service_type` (optional): INTEGRATION, AGENT, API, SERVICE
     - `statistic_name` (optional): Invocations, Average, Maximum, Minimum

2. **GET /api/query/servers**
   - **Purpose**: List all available servers
   - **Parameters**: None

3. **GET /api/query/components**
   - **Purpose**: Get hierarchical component structure
   - **Parameters**: 
     - `service_type` (optional): Filter by service type

4. **GET /api/query/server/{serverName}**
   - **Purpose**: Get statistics for a specific server
   - **Parameters**: 
     - `serverName` (required): Server name
     - `start_date`, `end_date`, `service_name`, `service_type`, `statistic_name` (optional)

5. **GET /api/query/component/{componentName}**
   - **Purpose**: Get statistics for a specific component
   - **Parameters**: 
     - `componentName` (required): Component name
     - `start_date`, `end_date`, `service_name`, `service_type`, `statistic_name` (optional)

6. **GET /api/query/service/{serviceName}**
   - **Purpose**: Get statistics for a specific service
   - **Parameters**: 
     - `serviceName` (required): Service name
     - `start_date`, `end_date`, `service_type`, `statistic_name` (optional)

7. **GET /api/query/invocations**
   - **Purpose**: Get invocation statistics with time aggregation
   - **Parameters**: 
     - `start_date`, `end_date` (optional)
     - `service_name`, `service_type`, `statistic_name` (optional)
     - `aggregation` (optional): hourly, daily

8. **GET /api/query/comparison**
   - **Purpose**: Compare statistics across servers/services
   - **Parameters**: 
     - `type` (required): server, service, component
     - `start_date`, `end_date` (optional)
     - `service_name`, `service_type`, `statistic_name` (optional)
     - `aggregation` (optional): hourly, daily

---

## Skill Configuration

### Skill 1: Query Server Statistics

**Skill Name**: "Get Server Statistics"

**Description**: "Retrieve performance statistics for a specific server"

**Input Parameters**:
```json
{
  "serverName": {
    "type": "string",
    "required": true,
    "description": "Name of the server (e.g., YFSAPP01, YFSAPP02)"
  },
  "startDate": {
    "type": "string",
    "required": false,
    "format": "date",
    "description": "Start date in YYYY-MM-DD format"
  },
  "endDate": {
    "type": "string",
    "required": false,
    "format": "date",
    "description": "End date in YYYY-MM-DD format"
  },
  "serviceType": {
    "type": "string",
    "required": false,
    "enum": ["INTEGRATION", "AGENT", "API", "SERVICE"],
    "description": "Filter by service type"
  }
}
```

**API Mapping**:
- Endpoint: `GET /api/query/server/{serverName}`
- Method: GET
- Path Parameter: `serverName`
- Query Parameters: `start_date`, `end_date`, `service_type`

**Sample Prompt**:
```
"Show me statistics for server YFSAPP01 from 2024-01-01 to 2024-01-31"
```

**Expected Response Format**:
```json
{
  "server": "YFSAPP01",
  "statistics": [
    {
      "component_name": "YFSExtnOrderProcessOrderImplService",
      "service_name": "processOrder",
      "service_type": "INTEGRATION",
      "statistic_name": "Invocations",
      "statistic_value": 1250,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "total_invocations": 15000,
    "avg_response_time": 245.5,
    "max_response_time": 1200,
    "min_response_time": 50
  }
}
```

---

### Skill 2: Compare Server Performance

**Skill Name**: "Compare Server Performance"

**Description**: "Compare performance metrics across multiple servers"

**Input Parameters**:
```json
{
  "comparisonType": {
    "type": "string",
    "required": true,
    "enum": ["server", "service", "component"],
    "description": "Type of comparison to perform"
  },
  "startDate": {
    "type": "string",
    "required": false,
    "format": "date"
  },
  "endDate": {
    "type": "string",
    "required": false,
    "format": "date"
  },
  "statisticName": {
    "type": "string",
    "required": false,
    "enum": ["Invocations", "Average", "Maximum", "Minimum"],
    "description": "Specific metric to compare"
  },
  "aggregation": {
    "type": "string",
    "required": false,
    "enum": ["hourly", "daily"],
    "description": "Time aggregation level"
  }
}
```

**API Mapping**:
- Endpoint: `GET /api/query/comparison`
- Method: GET
- Query Parameters: `type`, `start_date`, `end_date`, `statistic_name`, `aggregation`

**Sample Prompts**:
```
"Compare invocations across all servers for last week"
"Show me daily comparison of average response times by service"
"Which server has the highest invocations today?"
```

---

### Skill 3: Get Service Performance

**Skill Name**: "Get Service Performance"

**Description**: "Retrieve performance metrics for a specific service"

**Input Parameters**:
```json
{
  "serviceName": {
    "type": "string",
    "required": true,
    "description": "Name of the service (e.g., processOrder, getOrderDetails)"
  },
  "startDate": {
    "type": "string",
    "required": false,
    "format": "date"
  },
  "endDate": {
    "type": "string",
    "required": false,
    "format": "date"
  },
  "serviceType": {
    "type": "string",
    "required": false,
    "enum": ["INTEGRATION", "AGENT"]
  }
}
```

**API Mapping**:
- Endpoint: `GET /api/query/service/{serviceName}`
- Method: GET
- Path Parameter: `serviceName`
- Query Parameters: `start_date`, `end_date`, `service_type`

**Sample Prompts**:
```
"Show me performance of processOrder service"
"Get statistics for getOrderDetails service for last month"
"How many times was createShipment service called today?"
```

---

### Skill 4: List Available Components

**Skill Name**: "List Components"

**Description**: "Get hierarchical list of all components and services"

**Input Parameters**:
```json
{
  "serviceType": {
    "type": "string",
    "required": false,
    "enum": ["INTEGRATION", "AGENT", "API", "SERVICE"],
    "description": "Filter by service type"
  }
}
```

**API Mapping**:
- Endpoint: `GET /api/query/components`
- Method: GET
- Query Parameters: `service_type`

**Sample Prompts**:
```
"List all available components"
"Show me all INTEGRATION services"
"What components are available?"
```

---

### Skill 5: Get Invocation Trends

**Skill Name**: "Get Invocation Trends"

**Description**: "Retrieve invocation statistics with time-based aggregation"

**Input Parameters**:
```json
{
  "startDate": {
    "type": "string",
    "required": false,
    "format": "date"
  },
  "endDate": {
    "type": "string",
    "required": false,
    "format": "date"
  },
  "aggregation": {
    "type": "string",
    "required": true,
    "enum": ["hourly", "daily"],
    "description": "Time aggregation level"
  },
  "serviceName": {
    "type": "string",
    "required": false,
    "description": "Filter by service name"
  },
  "serviceType": {
    "type": "string",
    "required": false,
    "enum": ["INTEGRATION", "AGENT"]
  }
}
```

**API Mapping**:
- Endpoint: `GET /api/query/invocations`
- Method: GET
- Query Parameters: `start_date`, `end_date`, `aggregation`, `service_name`, `service_type`

**Sample Prompts**:
```
"Show me hourly invocation trends for today"
"Get daily invocation statistics for last week"
"What's the invocation trend for processOrder service?"
```

---

## Test Scenarios

### Scenario 1: Basic Server Query

**User Query**: "Show me statistics for server YFSAPP01"

**WatsonX Orchestrate Configuration**:
```yaml
Skill: Get Server Statistics
Parameters:
  serverName: YFSAPP01
  startDate: null  # Will use default (last 7 days)
  endDate: null
  serviceType: null
```

**Expected API Call**:
```http
GET /api/query/server/YFSAPP01
Headers:
  X-API-Key: your-api-key
```

**Expected Response**:
```json
{
  "server": "YFSAPP01",
  "date_range": {
    "start": "2024-01-08",
    "end": "2024-01-15"
  },
  "statistics": [
    {
      "component_name": "YFSExtnOrderProcessOrderImplService",
      "service_name": "processOrder",
      "service_type": "INTEGRATION",
      "statistic_name": "Invocations",
      "statistic_value": 1250
    }
  ],
  "total_records": 150
}
```

**LLM Response Template**:
```
Server YFSAPP01 Statistics (Last 7 Days):

📊 Summary:
- Total Invocations: 15,000
- Average Response Time: 245.5ms
- Peak Response Time: 1,200ms

🔝 Top Services:
1. processOrder: 1,250 invocations
2. getOrderDetails: 980 invocations
3. createShipment: 750 invocations

Would you like to see detailed statistics for any specific service?
```

---

### Scenario 2: Service Type Filtering

**User Query**: "Show me all INTEGRATION services performance for last month"

**WatsonX Orchestrate Configuration**:
```yaml
Skill: Get Server Statistics
Parameters:
  serverName: null  # Query all servers
  startDate: "2024-01-01"
  endDate: "2024-01-31"
  serviceType: "INTEGRATION"
```

**Expected API Call**:
```http
GET /api/query/stats?start_date=2024-01-01&end_date=2024-01-31&service_type=INTEGRATION
Headers:
  X-API-Key: your-api-key
```

**LLM Response Template**:
```
INTEGRATION Services Performance (January 2024):

📈 Overall Metrics:
- Total Services: 45
- Total Invocations: 125,000
- Average Response Time: 312ms

🏆 Top Performers:
1. processOrder: 25,000 invocations (avg: 245ms)
2. getOrderDetails: 18,500 invocations (avg: 180ms)
3. updateInventory: 15,200 invocations (avg: 290ms)

⚠️ Attention Needed:
- cancelOrder: High response time (avg: 850ms)
- validatePayment: Increased error rate (2.3%)
```

---

### Scenario 3: Server Comparison

**User Query**: "Compare invocations across all servers for today"

**WatsonX Orchestrate Configuration**:
```yaml
Skill: Compare Server Performance
Parameters:
  comparisonType: "server"
  startDate: "2024-01-15"  # Today
  endDate: "2024-01-15"
  statisticName: "Invocations"
  aggregation: "hourly"
```

**Expected API Call**:
```http
GET /api/query/comparison?type=server&start_date=2024-01-15&end_date=2024-01-15&statistic_name=Invocations&aggregation=hourly
Headers:
  X-API-Key: your-api-key
```

**LLM Response Template**:
```
Server Invocation Comparison (Today - Hourly):

📊 Current Status (as of 15:00):
1. YFSAPP01: 2,450 invocations ⬆️ +15% vs yesterday
2. YFSAPP02: 2,380 invocations ⬆️ +12% vs yesterday
3. YFSAPP03: 2,120 invocations ⬇️ -5% vs yesterday

📈 Hourly Trend:
- Peak Hour: 14:00 (8,500 total invocations)
- Lowest Hour: 03:00 (450 total invocations)
- Current Hour: 6,950 invocations

⚖️ Load Distribution:
- YFSAPP01: 34% of total load
- YFSAPP02: 33% of total load
- YFSAPP03: 29% of total load
- Others: 4% of total load
```

---

### Scenario 4: Service-Specific Query with Filters

**User Query**: "Show me processOrder service statistics for INTEGRATION type in the last week"

**WatsonX Orchestrate Configuration**:
```yaml
Skill: Get Service Performance
Parameters:
  serviceName: "processOrder"
  startDate: "2024-01-08"
  endDate: "2024-01-15"
  serviceType: "INTEGRATION"
```

**Expected API Call**:
```http
GET /api/query/service/processOrder?start_date=2024-01-08&end_date=2024-01-15&service_type=INTEGRATION
Headers:
  X-API-Key: your-api-key
```

**LLM Response Template**:
```
processOrder Service Performance (Last 7 Days):

📊 Key Metrics:
- Total Invocations: 8,750
- Average Response Time: 245ms
- Success Rate: 99.2%
- Error Rate: 0.8%

📈 Daily Breakdown:
- Mon: 1,250 invocations (avg: 240ms)
- Tue: 1,380 invocations (avg: 250ms)
- Wed: 1,420 invocations (avg: 245ms)
- Thu: 1,350 invocations (avg: 248ms)
- Fri: 1,450 invocations (avg: 242ms)
- Sat: 980 invocations (avg: 235ms)
- Sun: 920 invocations (avg: 238ms)

🖥️ Server Distribution:
- YFSAPP01: 3,200 invocations (36.6%)
- YFSAPP02: 2,950 invocations (33.7%)
- YFSAPP03: 2,600 invocations (29.7%)

⚡ Performance Insights:
- Peak performance on weekends (lower response times)
- Consistent load distribution across servers
- No significant performance degradation detected
```

---

### Scenario 5: Trend Analysis with Aggregation

**User Query**: "Show me daily invocation trends for all services in the last month"

**WatsonX Orchestrate Configuration**:
```yaml
Skill: Get Invocation Trends
Parameters:
  startDate: "2024-01-01"
  endDate: "2024-01-31"
  aggregation: "daily"
  serviceName: null
  serviceType: null
```

**Expected API Call**:
```http
GET /api/query/invocations?start_date=2024-01-01&end_date=2024-01-31&aggregation=daily
Headers:
  X-API-Key: your-api-key
```

**LLM Response Template**:
```
Daily Invocation Trends (January 2024):

📊 Monthly Summary:
- Total Invocations: 425,000
- Daily Average: 13,710
- Peak Day: Jan 15 (18,500 invocations)
- Lowest Day: Jan 1 (8,200 invocations)

📈 Weekly Patterns:
- Week 1: 85,000 invocations (avg: 12,143/day)
- Week 2: 95,000 invocations (avg: 13,571/day)
- Week 3: 105,000 invocations (avg: 15,000/day)
- Week 4: 110,000 invocations (avg: 15,714/day)
- Week 5: 30,000 invocations (avg: 15,000/day)

📉 Trend Analysis:
- Overall Trend: ⬆️ Increasing (+29% month-over-month)
- Weekday Average: 15,200 invocations
- Weekend Average: 9,800 invocations
- Growth Rate: +2.5% per week

🎯 Recommendations:
- Consider scaling up resources for Week 4-5 pattern
- Weekend capacity can be reduced by 35%
- Monitor Week 3 spike pattern for capacity planning
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Authentication Failure

**Error**: `401 Unauthorized`

**Solution**:
```yaml
Check:
  1. API Key is correctly configured in WatsonX Orchestrate
  2. Header name is exactly "X-API-Key" (case-sensitive)
  3. API Key matches the value in backend/.env file
  4. No extra spaces or characters in the API key
```

#### Issue 2: No Data Returned

**Error**: `200 OK` but empty results

**Solution**:
```yaml
Check:
  1. Date range is valid (start_date < end_date)
  2. Server/service names are spelled correctly
  3. Database has data for the specified date range
  4. Service type filter matches available data (INTEGRATION vs AGENT)
```

#### Issue 3: Timeout Errors

**Error**: `504 Gateway Timeout`

**Solution**:
```yaml
Check:
  1. Database connection is stable
  2. Query date range is not too large (limit to 90 days)
  3. Backend server has sufficient resources
  4. Network connectivity between WatsonX and backend
```

#### Issue 4: Invalid Date Format

**Error**: `400 Bad Request - Invalid date format`

**Solution**:
```yaml
Correct Format: YYYY-MM-DD
Examples:
  ✅ 2024-01-15
  ✅ 2024-12-31
  ❌ 01/15/2024
  ❌ 15-01-2024
  ❌ 2024/01/15
```

---

## Best Practices

### 1. Query Optimization

```yaml
DO:
  - Use specific date ranges (avoid querying all data)
  - Filter by service_type when possible
  - Use aggregation for large date ranges
  - Limit queries to relevant servers/services

DON'T:
  - Query without date filters for production data
  - Use overly broad filters
  - Make multiple redundant queries
```

### 2. Error Handling

```yaml
Configure WatsonX to handle:
  - Empty results gracefully
  - API timeouts with retry logic
  - Invalid parameter errors with user-friendly messages
  - Rate limiting (429 errors)
```

### 3. Response Formatting

```yaml
LLM Prompt Engineering:
  - Use structured formatting (tables, lists)
  - Include visual indicators (📊, ⬆️, ⬇️, ⚠️)
  - Provide context and insights, not just raw data
  - Suggest follow-up actions
  - Use consistent units (ms for time, K for thousands)
```

### 4. Security

```yaml
Security Checklist:
  ✅ API Key stored securely in WatsonX Orchestrate
  ✅ HTTPS used for all API calls
  ✅ Rate limiting configured
  ✅ Audit logging enabled
  ✅ Access controls configured
  ❌ Never log API keys
  ❌ Never expose API keys in responses
```

---

## Advanced Configuration

### Custom Skill: Multi-Step Analysis

**Skill Name**: "Comprehensive Performance Analysis"

**Description**: "Perform multi-step analysis combining multiple API calls"

**Steps**:
1. Get server list
2. Query statistics for each server
3. Compare performance metrics
4. Generate insights and recommendations

**Implementation**:
```yaml
Step 1: List Servers
  API: GET /api/query/servers
  
Step 2: Query Each Server
  API: GET /api/query/server/{serverName}
  Loop: For each server from Step 1
  
Step 3: Compare Results
  API: GET /api/query/comparison?type=server
  
Step 4: Generate Report
  LLM: Analyze results and provide insights
```

---

## Monitoring and Analytics

### Key Metrics to Track

```yaml
API Performance:
  - Response time per endpoint
  - Error rate
  - Request volume
  - Cache hit rate

Business Metrics:
  - Most queried servers
  - Most queried services
  - Peak usage times
  - User query patterns

Quality Metrics:
  - LLM response accuracy
  - User satisfaction scores
  - Query success rate
  - Follow-up query rate
```

---

## Support and Resources

### Documentation Links

- **API Documentation**: `https://your-api-url/api-docs`
- **Swagger UI**: `https://your-api-url/api-docs/swagger`
- **GitHub Repository**: `https://github.com/amigonirmal/watson-orchestration-backend`

### Contact Information

- **Technical Support**: support@example.com
- **API Issues**: api-support@example.com
- **WatsonX Orchestrate**: watsonx-support@ibm.com

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-12  
**Author**: IBM Bob (AI Assistant)