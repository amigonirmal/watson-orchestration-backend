# IBM Watson Assistant Agent for PostgreSQL Statistics Queries

A comprehensive solution for querying YFS_STATISTICS_DETAIL database using IBM Watson Assistant with natural language processing, REST API endpoints, and visualization capabilities.

## 🎯 Overview

This project provides an intelligent conversational interface powered by IBM Watson Assistant to query performance statistics from a PostgreSQL database. Users can ask questions in natural language and receive formatted responses with optional visualizations.

### Key Features

- 🤖 **Natural Language Queries**: Ask questions in plain English
- 📊 **Statistics Analysis**: Query order statistics, service performance, and trends
- 📈 **Visualizations**: Generate charts and graphs automatically
- 🔍 **300+ Components**: Support for querying hundreds of different services
- ⚡ **Real-time Data**: Query live statistics from PostgreSQL
- 🔐 **Secure API**: API key authentication and rate limiting
- 📱 **Multi-channel**: Deploy on web, Slack, MS Teams, etc.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interfaces                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Web Chat │  │  Slack   │  │ MS Teams │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│              IBM Watson Assistant                          │
│  • Natural Language Understanding                          │
│  • Intent Recognition                                      │
│  • Entity Extraction                                       │
│  • Dialog Management                                       │
└─────────────────────┬─────────────────────────────────────┘
                      │ Webhook
                      │
┌─────────────────────▼─────────────────────────────────────┐
│              Backend API (Node.js)                         │
│  • Query Processing                                        │
│  • Database Integration                                    │
│  • Visualization Generation                                │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│              PostgreSQL Database                           │
│  • YFS_STATISTICS_DETAIL table                            │
│  • Materialized views for performance                      │
│  • Indexes for fast queries                                │
└────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **PostgreSQL**: 13.x or higher
- **IBM Cloud Account**: For Watson Assistant
- **Docker** (optional): For containerized deployment

## 🚀 Quick Start

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres -d your_database

# Run schema creation script
\i database/yfs_statistics_detail_schema.sql

# Verify table creation
\dt YFS_STATISTICS_DETAIL
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd watson-orchestration-agent/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### 3. Watson Assistant Setup

1. **Create Watson Assistant Instance**
   - Go to [IBM Cloud](https://cloud.ibm.com)
   - Create a Watson Assistant service
   - Note your API key and Assistant ID

2. **Import Configuration**
   - Open Watson Assistant dashboard
   - Create new assistant
   - Import intents from `watson-assistant/intents.json`
   - Import entities from `watson-assistant/entities.json`
   - Import dialog nodes from `watson-assistant/dialog-nodes.json`

3. **Configure Webhook**
   - In Watson Assistant settings
   - Add webhook URL: `https://your-domain.com/api/webhook/watson`
   - Add authentication header: `X-API-Key: your-api-key`

### 4. Test the System

```bash
# Test database connection
curl http://localhost:3000/api/health

# Test order statistics query
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/query/orders/stats?server_name=createorder&service_type=INTEGRATION&statistic_name=Invocations&date_start=2026-02-01&date_end=2026-02-10"

# Test Watson webhook
curl -X POST http://localhost:3000/api/webhook/watson \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "intent": "query_order_statistics",
    "entities": {
      "server_name": "createorder",
      "date_start": "yesterday"
    }
  }'
```

## 📊 Database Schema

### YFS_STATISTICS_DETAIL Table

| Column | Type | Description |
|--------|------|-------------|
| STATISTICS_DETAIL_KEY | CHAR(24) | Primary key |
| START_TIME_STAMP | TIMESTAMP(6) | Start time of statistics period |
| END_TIME_STAMP | TIMESTAMP(6) | End time of statistics period |
| SERVER_NAME | VARCHAR(100) | Server/service name (e.g., 'createorder') |
| SERVICE_TYPE | VARCHAR(40) | Service type (e.g., 'INTEGRATION') |
| STATISTIC_NAME | VARCHAR(80) | Statistic name (e.g., 'Invocations') |
| STATISTIC_VALUE | DECIMAL(15,2) | Numeric value of the statistic |

See [Database Schema Documentation](database/yfs_statistics_detail_schema.sql) for complete schema.

## 🔍 Example Queries

### Natural Language (via Watson Assistant)

```
User: "What's the maximum number of orders created yesterday?"
Bot: "The maximum number of orders created was 850 on February 9, 2026 at 2:00 PM."

User: "Show me performance of createorder service for last week"
Bot: "CreateOrderService Performance:
     📊 Total Requests: 15,420
     ⚡ Avg Response Time: 188ms
     ✅ Success Rate: 99.2%"

User: "Generate a graph of order trends for the past month"
Bot: "Here's the line chart for createorder:" [displays chart]
```

### REST API

```bash
# Get total orders created
GET /api/query/orders/stats?server_name=createorder&service_type=INTEGRATION&statistic_name=Invocations&date_start=2026-02-01&date_end=2026-02-10

# Get component performance
GET /api/query/component/performance?server_name=createorder&date_start=last_7_days

# Get time series data
GET /api/query/timeseries?server_name=createorder&statistic_name=Invocations&aggregation=hourly

# List all services
GET /api/query/services/list?service_type=INTEGRATION&limit=50
```

### SQL Queries

```sql
-- Total orders created
SELECT SUM(STATISTIC_VALUE) as total_orders
FROM YFS_STATISTICS_DETAIL
WHERE SERVER_NAME = 'createorder'
  AND SERVICE_TYPE = 'INTEGRATION'
  AND STATISTIC_NAME = 'Invocations'
  AND START_TIME_STAMP >= '2026-02-01'
  AND END_TIME_STAMP <= '2026-02-10';

-- Average invocations per service
SELECT 
    SERVER_NAME,
    AVG(STATISTIC_VALUE) as avg_invocations
FROM YFS_STATISTICS_DETAIL
WHERE STATISTIC_NAME = 'Invocations'
GROUP BY SERVER_NAME
ORDER BY avg_invocations DESC;
```

See [Sample Queries](database/sample_queries.sql) for more examples.

## 📖 Documentation

- [Architecture Design](docs/ARCHITECTURE.md)
- [API Specification](docs/API_SPECIFICATION.md)
- [Watson vs Orchestration Comparison](docs/WATSON_COMPARISON.md)
- [Database Schema](database/yfs_statistics_detail_schema.sql)
- [Sample SQL Queries](database/sample_queries.sql)

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_KEY=your-secure-api-key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=gatling
DB_PASSWORD=gatling123

# Watson Assistant
WATSON_API_KEY=your-watson-api-key
WATSON_ASSISTANT_ID=your-assistant-id
WATSON_URL=https://api.us-south.assistant.watson.cloud.ibm.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎨 Supported Query Types

### 1. Order Statistics
- Maximum/minimum orders in date range
- Hourly/daily/weekly/monthly aggregations
- Peak and low activity periods

### 2. Component Performance
- Response time metrics
- Success/error rates
- Throughput analysis
- Service comparisons

### 3. Time Series Analysis
- Trend visualization
- Historical comparisons
- Growth rate calculations

### 4. Service Discovery
- List available services
- Search by name or type
- Activity rankings

## 📈 Visualization Support

The system can generate various chart types:

- **Line Charts**: Time series trends
- **Bar Charts**: Comparisons
- **Heatmaps**: Hourly patterns
- **Pie Charts**: Distribution analysis

Charts are generated using QuickChart API or Chart.js.

## 🔐 Security

- **API Key Authentication**: All endpoints require valid API key
- **Rate Limiting**: 100 requests/minute per API key
- **SQL Injection Prevention**: Parameterized queries
- **HTTPS/TLS**: Encrypted communication
- **Input Validation**: Joi schema validation

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
cd watson-orchestration-agent/deployment
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Manual Deployment

```bash
# Install dependencies
npm ci --production

# Run database migrations
npm run migrate

# Start server
NODE_ENV=production npm start
```

### Cloud Deployment

See deployment guides for:
- IBM Cloud (Cloud Foundry)
- AWS (ECS/EKS)
- Azure (App Service)
- Google Cloud (Cloud Run)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test database connection
npm run test:db

# Test Watson webhook
npm run test:webhook
```

## 📊 Monitoring

The system includes health check endpoints:

```bash
# Health check
GET /api/health

# Readiness probe (Kubernetes)
GET /api/health/ready

# Liveness probe (Kubernetes)
GET /api/health/live
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation in `/docs`

## 🔄 Version History

- **v1.0.0** (2026-02-10): Initial release
  - Watson Assistant integration
  - YFS_STATISTICS_DETAIL support
  - REST API endpoints
  - Visualization generation
  - 300+ component support

## 🎯 Roadmap

- [ ] Machine learning for anomaly detection
- [ ] Advanced predictive analytics
- [ ] Multi-language support
- [ ] Custom report generation
- [ ] Real-time alerting
- [ ] Dashboard UI

---

**Made with ❤️ by Bob (AI Assistant)**

For detailed implementation guides, see the [docs](docs/) directory.