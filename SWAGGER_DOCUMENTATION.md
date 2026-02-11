# Swagger API Documentation

## Overview

The Watson Orchestration Backend API now includes comprehensive Swagger/OpenAPI documentation for easy API exploration and testing.

## Accessing Swagger UI

### Option 1: Restart the Server (Recommended)

1. **Stop the current server** (Press `Ctrl+C` in the terminal running the server)

2. **Start the server again**:
   ```bash
   cd backend
   npm start
   ```

3. **Open Swagger UI in your browser**:
   ```
   http://localhost:3000/api-docs
   ```

### Option 2: View the Swagger JSON

The OpenAPI specification is available at:
- **File**: [`backend/swagger.json`](backend/swagger.json)
- **URL**: You can import this file into any Swagger/OpenAPI tool

## What's Included

The Swagger documentation includes:

### 📋 All API Endpoints

1. **Health Endpoints**
   - `GET /` - API information
   - `GET /api/health` - Health check

2. **Query Endpoints** (Requires API Key)
   - `GET /api/query/stats` - General statistics
   - `GET /api/query/components/list` - List all components
   - `GET /api/query/component/performance` - Component performance metrics
   - `GET /api/query/timeseries` - Time series data
   - `GET /api/query/orders/stats` - Order statistics
   - `POST /api/query/components/compare` - Compare multiple components

3. **Webhook Endpoints** (Requires API Key)
   - `POST /api/webhook/watson` - Watson Assistant webhook

### 🔐 Authentication

All protected endpoints require an API key in the header:
```
X-API-Key: test-api-key-12345
```

You can test this directly in Swagger UI by clicking the "Authorize" button.

### 📝 Request/Response Examples

Each endpoint includes:
- ✅ Detailed parameter descriptions
- ✅ Request body schemas
- ✅ Response examples
- ✅ Error responses
- ✅ Try it out functionality

## Using Swagger UI

### 1. Authorize

Click the **"Authorize"** button at the top right and enter:
```
test-api-key-12345
```

### 2. Try an Endpoint

1. Click on any endpoint to expand it
2. Click **"Try it out"**
3. Fill in the parameters
4. Click **"Execute"**
5. View the response

### 3. Example: Get Components List

1. Navigate to `GET /api/query/components/list`
2. Click "Try it out"
3. Set `limit` to `5`
4. Click "Execute"
5. See the response with your actual data

## Quick Test Examples

### Using Swagger UI

**Test 1: Health Check**
- Endpoint: `GET /api/health`
- No authentication required
- Click "Try it out" → "Execute"

**Test 2: Get Statistics**
- Endpoint: `GET /api/query/stats`
- Authorize first with API key
- Parameters:
  - `date_start`: `2025-10-21`
  - `date_end`: `2025-10-21`
- Click "Execute"

**Test 3: List Components**
- Endpoint: `GET /api/query/components/list`
- Authorize first
- Parameter: `limit`: `10`
- Click "Execute"

## Importing to Other Tools

### Postman

1. Open Postman
2. Click "Import"
3. Select [`backend/swagger.json`](backend/swagger.json)
4. All endpoints will be imported with examples

### Insomnia

1. Open Insomnia
2. Click "Import/Export"
3. Import from file: [`backend/swagger.json`](backend/swagger.json)

### VS Code REST Client

You can also use the Swagger spec to generate REST Client files.

## API Features Documented

### Query Parameters
- Date ranges (absolute and relative)
- Aggregation levels (hourly, daily, weekly, monthly)
- Filtering by component/server
- Metric selection
- Pagination (limit)

### Response Formats
- Success responses with data and metadata
- Error responses with clear messages
- Consistent JSON structure

### Data Models
- Health status
- Statistics summaries
- Component lists
- Performance metrics
- Time series data
- Watson webhook requests/responses

## Benefits of Swagger Documentation

✅ **Interactive Testing** - Test all endpoints directly in the browser
✅ **Auto-generated** - Always up-to-date with the API
✅ **Clear Examples** - See request/response formats
✅ **Authentication** - Built-in API key testing
✅ **Export Options** - Import to Postman, Insomnia, etc.
✅ **Standards-based** - OpenAPI 3.0 specification

## Troubleshooting

### Swagger UI Not Loading

1. Ensure the server is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check if swagger-ui-express is installed:
   ```bash
   cd backend
   npm list swagger-ui-express
   ```

3. Restart the server:
   ```bash
   cd backend
   npm start
   ```

### Can't Authorize

Make sure you're using the correct API key:
```
test-api-key-12345
```

This is set in [`backend/.env`](backend/.env)

## Next Steps

1. ✅ Restart the server to enable Swagger UI
2. 🌐 Open http://localhost:3000/api-docs in your browser
3. 🔐 Click "Authorize" and enter the API key
4. 🧪 Test the endpoints interactively
5. 📤 Export to your preferred API client

---

**Made with Bob** 🤖