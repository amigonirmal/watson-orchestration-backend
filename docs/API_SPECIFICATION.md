# API Specification for YFS_STATISTICS_DETAIL

## Overview

This document specifies the REST API endpoints for querying statistics from the YFS_STATISTICS_DETAIL table. The API supports natural language queries through Watson Assistant and direct REST API calls.

## Base URL

```
Production: https://api.example.com/api
Development: http://localhost:3000/api
```

## Authentication

All API requests require authentication using an API key.

**Header:**
```
X-API-Key: your-api-key-here
```

**Query Parameter (alternative):**
```
?api_key=your-api-key-here
```

---

## API Endpoints

### 1. Get Order Statistics

**Endpoint:** `GET /api/query/orders/stats`

**Description:** Fetch total number of orders created based on SERVER_NAME, SERVICE_TYPE, and STATISTIC_NAME filters.

**Business Logic:**
- Filters: SERVER_NAME = 'createorder', SERVICE_TYPE = 'INTEGRATION', STATISTIC_NAME = 'Invocations'
- Aggregates STATISTIC_VALUE using SUM, AVG, MIN, or MAX

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `server_name` | string | No | 'createorder' | Server name to filter |
| `service_type` | string | No | 'INTEGRATION' | Service type to filter |
| `statistic_name` | string | No | 'Invocations' | Statistic name to filter |
| `date_start` | string | No | 'last_7_days' | Start date (ISO 8601 or relative) |
| `date_end` | string | No | 'today' | End date (ISO 8601 or relative) |
| `aggregation` | string | No | 'daily' | Time aggregation (hourly, daily, weekly, monthly) |
| `statistic_type` | string | No | 'total' | Aggregation type (total, maximum, minimum, average) |

**Request Example:**
```http
GET /api/query/orders/stats?server_name=createorder&service_type=INTEGRATION&statistic_name=Invocations&date_start=2026-02-01&date_end=2026-02-10&aggregation=daily&statistic_type=total
X-API-Key: your-api-key-here
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "total_orders": 15420,
    "aggregation": "daily",
    "breakdown": [
      {
        "date": "2026-02-10",
        "value": 1850,
        "record_count": 24
      },
      {
        "date": "2026-02-09",
        "value": 1720,
        "record_count": 24
      }
    ]
  },
  "metadata": {
    "server_name": "createorder",
    "service_type": "INTEGRATION",
    "statistic_name": "Invocations",
    "date_start": "2026-02-01T00:00:00Z",
    "date_end": "2026-02-10T23:59:59Z",
    "aggregation": "daily",
    "count": 10
  }
}
```

---

### 2. Get Component Performance

**Endpoint:** `GET /api/query/component/performance`

**Description:** Fetch performance metrics for specific components (servers/services).

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `server_name` | string | No | null | Server name to filter (supports wildcards) |
| `service_type` | string | No | null | Service type to filter |
| `service_name` | string | No | null | Service name to filter |
| `statistic_name` | string | No | null | Specific statistic to query |
| `date_start` | string | No | 'last_7_days' | Start date |
| `date_end` | string | No | 'today' | End date |
| `metric` | string | No | 'all' | Metric type (all, avg, max, min, sum) |

**Request Example:**
```http
GET /api/query/component/performance?server_name=createorder&service_type=INTEGRATION&date_start=2026-02-01&date_end=2026-02-10&metric=all
X-API-Key: your-api-key-here
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "server_name": "createorder",
      "service_type": "INTEGRATION",
      "service_name": "CreateOrderService",
      "statistics": {
        "Invocations": {
          "total": 15420,
          "average": 642.5,
          "maximum": 850,
          "minimum": 420,
          "stddev": 125.3
        },
        "ResponseTime": {
          "total": 45230.50,
          "average": 2.93,
          "maximum": 15.2,
          "minimum": 0.8,
          "stddev": 2.1
        }
      },
      "record_count": 240
    }
  ],
  "metadata": {
    "server_name": "createorder",
    "service_type": "INTEGRATION",
    "date_start": "2026-02-01T00:00:00Z",
    "date_end": "2026-02-10T23:59:59Z",
    "count": 1
  }
}
```

---

### 3. Get Service List

**Endpoint:** `GET /api/query/services/list`

**Description:** List all available services/components with their statistics.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | null | Search term for filtering |
| `service_type` | string | No | null | Filter by service type |
| `limit` | integer | No | 300 | Maximum number of results |
| `sort_by` | string | No | 'invocations' | Sort field (invocations, name, type) |
| `order` | string | No | 'desc' | Sort order (asc, desc) |

**Request Example:**
```http
GET /api/query/services/list?service_type=INTEGRATION&limit=50&sort_by=invocations&order=desc
X-API-Key: your-api-key-here
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "server_name": "createorder",
      "service_type": "INTEGRATION",
      "service_name": "CreateOrderService",
      "total_invocations": 15420,
      "avg_invocations": 642.5,
      "last_activity": "2026-02-10T14:30:00Z",
      "record_count": 240
    },
    {
      "server_name": "getorder",
      "service_type": "INTEGRATION",
      "service_name": "GetOrderService",
      "total_invocations": 28350,
      "avg_invocations": 1181.25,
      "last_activity": "2026-02-10T14:28:00Z",
      "record_count": 240
    }
  ],
  "metadata": {
    "service_type": "INTEGRATION",
    "count": 2,
    "limit": 50,
    "total_available": 45
  }
}
```

---

### 4. Get Time Series Data

**Endpoint:** `GET /api/query/timeseries`

**Description:** Fetch time series data for visualization and trend analysis.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `server_name` | string | Yes | - | Server name to query |
| `service_type` | string | No | null | Service type filter |
| `statistic_name` | string | Yes | - | Statistic to track |
| `date_start` | string | No | 'last_7_days' | Start date |
| `date_end` | string | No | 'today' | End date |
| `aggregation` | string | No | 'hourly' | Time granularity |

**Request Example:**
```http
GET /api/query/timeseries?server_name=createorder&statistic_name=Invocations&date_start=2026-02-10&aggregation=hourly
X-API-Key: your-api-key-here
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-02-10T00:00:00Z",
      "value": 45,
      "record_count": 1
    },
    {
      "timestamp": "2026-02-10T01:00:00Z",
      "value": 38,
      "record_count": 1
    },
    {
      "timestamp": "2026-02-10T02:00:00Z",
      "value": 52,
      "record_count": 1
    }
  ],
  "metadata": {
    "server_name": "createorder",
    "statistic_name": "Invocations",
    "date_start": "2026-02-10T00:00:00Z",
    "date_end": "2026-02-10T23:59:59Z",
    "aggregation": "hourly",
    "count": 24
  }
}
```

---

### 5. Get Statistics Summary

**Endpoint:** `GET /api/query/stats/summary`

**Description:** Get comprehensive statistics summary for a date range.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `server_name` | string | No | null | Server name filter |
| `service_type` | string | No | null | Service type filter |
| `date_start` | string | No | 'last_7_days' | Start date |
| `date_end` | string | No | 'today' | End date |

**Request Example:**
```http
GET /api/query/stats/summary?server_name=createorder&date_start=2026-02-01&date_end=2026-02-10
X-API-Key: your-api-key-here
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "total_records": 240,
    "date_range": {
      "start": "2026-02-01T00:00:00Z",
      "end": "2026-02-10T23:59:59Z",
      "days": 10
    },
    "statistics": {
      "Invocations": {
        "total": 15420,
        "average": 64.25,
        "maximum": 850,
        "minimum": 420,
        "median": 625,
        "p95": 780,
        "p99": 820
      },
      "ResponseTime": {
        "total": 45230.50,
        "average": 188.46,
        "maximum": 1520,
        "minimum": 80,
        "median": 175,
        "p95": 350,
        "p99": 450
      }
    },
    "unique_services": 1,
    "peak_hour": {
      "timestamp": "2026-02-05T14:00:00Z",
      "invocations": 850
    },
    "lowest_hour": {
      "timestamp": "2026-02-03T03:00:00Z",
      "invocations": 420
    }
  },
  "metadata": {
    "server_name": "createorder",
    "date_start": "2026-02-01T00:00:00Z",
    "date_end": "2026-02-10T23:59:59Z"
  }
}
```

---

### 6. Compare Services

**Endpoint:** `POST /api/query/services/compare`

**Description:** Compare performance metrics across multiple services.

**Request Body:**
```json
{
  "services": [
    {
      "server_name": "createorder",
      "service_type": "INTEGRATION"
    },
    {
      "server_name": "getorder",
      "service_type": "INTEGRATION"
    }
  ],
  "statistic_name": "Invocations",
  "date_start": "2026-02-01",
  "date_end": "2026-02-10"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "server_name": "createorder",
        "service_type": "INTEGRATION",
        "total": 15420,
        "average": 642.5,
        "maximum": 850,
        "minimum": 420
      },
      {
        "server_name": "getorder",
        "service_type": "INTEGRATION",
        "total": 28350,
        "average": 1181.25,
        "maximum": 1520,
        "minimum": 780
      }
    ],
    "winner": {
      "highest_total": "getorder",
      "highest_average": "getorder",
      "highest_peak": "getorder"
    }
  },
  "metadata": {
    "services_compared": 2,
    "statistic_name": "Invocations",
    "date_start": "2026-02-01T00:00:00Z",
    "date_end": "2026-02-10T23:59:59Z"
  }
}
```

---

### 7. Generate Visualization

**Endpoint:** `POST /api/visualization/generate`

**Description:** Generate chart/graph for statistics data.

**Request Body:**
```json
{
  "server_name": "createorder",
  "service_type": "INTEGRATION",
  "statistic_name": "Invocations",
  "date_start": "2026-02-01",
  "date_end": "2026-02-10",
  "chart_type": "line",
  "aggregation": "daily"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "image_url": "https://quickchart.io/chart?c={...}",
    "chart_type": "line",
    "data_points": 10
  },
  "metadata": {
    "server_name": "createorder",
    "statistic_name": "Invocations",
    "date_range": "2026-02-01 to 2026-02-10"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid query parameters",
  "details": "date_start must be a valid date",
  "code": "INVALID_PARAMETERS"
}
```

### 401 Unauthorized
```json
{
  "error": "API key required",
  "message": "Please provide an API key in the X-API-Key header",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid",
  "code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "No data found for the specified criteria",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

---

## Rate Limiting

- **Rate Limit:** 100 requests per minute per API key
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Watson Assistant Integration

### Webhook Endpoint

**Endpoint:** `POST /api/webhook/watson`

**Description:** Webhook endpoint for Watson Assistant integration.

**Request Body:**
```json
{
  "intent": "query_order_statistics",
  "entities": {
    "server_name": "createorder",
    "service_type": "INTEGRATION",
    "statistic_name": "Invocations",
    "date_start": "yesterday",
    "date_end": "today",
    "aggregation": "hourly",
    "statistic_type": "maximum"
  },
  "context": {
    "conversation_id": "abc123",
    "user_id": "user456"
  }
}
```

**Response Example:**
```json
{
  "response": {
    "text": "The maximum number of orders created was **850** on February 5, 2026 at 2:00 PM.",
    "data": {
      "value": 850,
      "timestamp": "2026-02-05T14:00:00Z"
    }
  },
  "context": {
    "conversation_id": "abc123",
    "last_query": "query_order_statistics",
    "timestamp": "2026-02-10T14:30:00Z"
  }
}
```

---

## Date Format Support

The API supports multiple date formats:

**Absolute Dates:**
- ISO 8601: `2026-02-10T14:30:00Z`
- Date only: `2026-02-10`
- US format: `02/10/2026`

**Relative Dates:**
- `today`, `yesterday`
- `last_week`, `this_week`
- `last_month`, `this_month`
- `last_7_days`, `last_30_days`
- `last_24_hours`, `last_hour`

---

## Pagination

For endpoints returning large datasets, pagination is supported:

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 50, max: 1000)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Page`: Current page
- `X-Per-Page`: Items per page
- `X-Total-Pages`: Total number of pages

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-10  
**Author:** Bob (AI Assistant)