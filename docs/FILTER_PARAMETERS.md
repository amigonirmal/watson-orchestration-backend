# API Filter Parameters Guide

This document describes the new filtering capabilities added to the WatsonX Orchestration Agent API endpoints.

## Overview

The following query parameters have been added to multiple endpoints to enable fine-grained filtering of statistics data:

- `service_name` - Filter by service name (supports partial matching with ILIKE)
- `service_type` - Filter by service type (exact match: API, INTEGRATION, AGENT, SERVICE)
- `statistic_name` - Filter by statistic name (supports partial matching with ILIKE)

## Supported Endpoints

### 1. Component Performance (`/api/query/component/performance`)

**Purpose**: Get performance metrics for components with optional filtering

**Parameters**:
- `component` - Server name to filter (optional)
- `date_start` - Start date (default: last_7_days)
- `date_end` - End date (default: today)
- `metric` - Metric type (default: all)
- `service_name` - Filter by service name (optional)
- `service_type` - Filter by service type (optional)
- `statistic_name` - Filter by statistic name (optional)

**Example**:
```bash
# Get only INTEGRATION service types for createOrder
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?component=IKEACreateOrder&service_type=INTEGRATION&date_start=2025-10-21&date_end=2025-10-22"

# Get only Invocations statistics
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?component=IKEACreateOrder&statistic_name=Invocations&date_start=2025-10-21&date_end=2025-10-22"

# Combine filters: API services with Average statistics
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?component=IKEACreateOrder&service_type=API&statistic_name=Average&date_start=2025-10-21&date_end=2025-10-22"
```

### 2. Time Series Data (`/api/query/timeseries`)

**Purpose**: Get time series data for visualization with optional filtering

**Parameters**:
- `component` - Server name to filter (optional)
- `date_start` - Start date (default: last_7_days)
- `date_end` - End date (default: today)
- `metric` - Metric type (default: response_time)
- `aggregation` - Time aggregation (hourly/daily, default: hourly)
- `service_name` - Filter by service name (optional)
- `service_type` - Filter by service type (optional)
- `statistic_name` - Filter by statistic name (optional)

**Example**:
```bash
# Get hourly invocations for a specific service
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/timeseries?component=IKEACreateOrder&service_name=IKEACreateOrderAPIMsgAsyncService_0&statistic_name=Invocations&aggregation=hourly&date_start=2025-10-21&date_end=2025-10-22"

# Get daily average response times for INTEGRATION services
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/timeseries?component=IKEACreateOrder&service_type=INTEGRATION&statistic_name=Average&aggregation=daily&date_start=2025-10-21&date_end=2025-10-22"
```

### 3. General Statistics (`/api/query/stats`)

**Purpose**: Get aggregated statistics for a date range with optional filtering

**Parameters**:
- `date_start` - Start date (default: last_7_days)
- `date_end` - End date (default: today)
- `service_name` - Filter by service name (optional)
- `service_type` - Filter by service type (optional)
- `statistic_name` - Filter by statistic name (optional)

**Example**:
```bash
# Get statistics for INTEGRATION services only
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/stats?service_type=INTEGRATION&date_start=2025-10-21&date_end=2025-10-22"

# Get statistics for a specific service
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/stats?service_name=createOrder&date_start=2025-10-21&date_end=2025-10-22"
```

## Filter Behavior

### Service Name (`service_name`)
- Uses case-insensitive partial matching (ILIKE)
- Example: `service_name=createOrder` matches "createOrder", "IKEACreateOrderAPIMsgAsyncService_0", etc.

### Service Type (`service_type`)
- Uses exact matching
- Valid values: `API`, `INTEGRATION`, `AGENT`, `SERVICE`
- Example: `service_type=INTEGRATION` only returns INTEGRATION type services

### Statistic Name (`statistic_name`)
- Uses case-insensitive partial matching (ILIKE)
- Common values: `Invocations`, `Average`, `Maximum`, `Minimum`
- Example: `statistic_name=Invocations` matches "Invocations", "NumOrdersCreated", etc.

## Combining Filters

All filter parameters can be combined to create precise queries:

```bash
# Get hourly invocations for API services in createOrder
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/timeseries?component=IKEACreateOrder&service_type=API&statistic_name=Invocations&aggregation=hourly&date_start=2025-10-21&date_end=2025-10-22"
```

## Response Format

All endpoints return the filter parameters in the metadata section:

```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "component": "IKEACreateOrder",
    "dateStart": "2025-10-21T00:00:00.000Z",
    "dateEnd": "2025-10-22T00:00:00.000Z",
    "serviceName": "createOrder",
    "serviceType": "API",
    "statisticName": "Invocations",
    "count": 10
  }
}
```

## Use Cases

### 1. Monitor Specific Service Performance
```bash
# Track createOrder service performance over time
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/timeseries?service_name=createOrder&statistic_name=Average&aggregation=hourly"
```

### 2. Compare Service Types
```bash
# Get statistics for INTEGRATION vs API services
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/stats?service_type=INTEGRATION"

curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/stats?service_type=API"
```

### 3. Focus on Specific Metrics
```bash
# Only get invocation counts
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/api/query/component/performance?statistic_name=Invocations"
```

## Testing

A test script is provided to verify filter functionality:

```bash
node test-filters.js
```

This script tests:
1. Individual filter parameters
2. Combined filters
3. Time series with filters
4. General statistics with filters

## Notes

- Filters are optional - omitting them returns all matching records
- When `service_type` is not specified in `/component/performance` and `/timeseries`, it defaults to `('INTEGRATION', 'AGENT')`
- Partial matching (ILIKE) is case-insensitive
- All filters work together using AND logic