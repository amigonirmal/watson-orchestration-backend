# GCP Cloud Run Deployment Guide

This guide explains how to deploy the Watson Orchestration Backend API to Google Cloud Platform (GCP) Cloud Run.

## Prerequisites

1. **GCP Account**: Active Google Cloud Platform account
2. **GCP Project**: Created GCP project with billing enabled
3. **gcloud CLI**: Installed and configured ([Install Guide](https://cloud.google.com/sdk/docs/install))
4. **Docker**: Installed locally for testing (optional)
5. **PostgreSQL Database**: 
   - Cloud SQL PostgreSQL instance in GCP, OR
   - External PostgreSQL database accessible from GCP

## Architecture Overview

```
┌─────────────────┐
│   Cloud Run     │
│   (Backend API) │
└────────┬────────┘
         │
         │ Private IP / Cloud SQL Proxy
         │
┌────────▼────────┐
│   Cloud SQL     │
│   (PostgreSQL)  │
└─────────────────┘
```

## Step 1: Prepare Your Database

### Option A: Use Cloud SQL (Recommended)

1. **Create Cloud SQL PostgreSQL Instance**:
```bash
gcloud sql instances create watson-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD
```

2. **Create Database**:
```bash
gcloud sql databases create yfs_statistics \
  --instance=watson-postgres
```

3. **Import Your Data**:
```bash
# Export from local PostgreSQL
pg_dump -h localhost -U postgres -d yfs_statistics > backup.sql

# Import to Cloud SQL
gcloud sql import sql watson-postgres gs://YOUR_BUCKET/backup.sql \
  --database=yfs_statistics
```

### Option B: Use External PostgreSQL

Ensure your PostgreSQL database:
- Is accessible from GCP (public IP or VPN)
- Has proper firewall rules configured
- Uses SSL/TLS for secure connections

## Step 2: Configure Environment Variables

Create a file `backend/.env.production` with your Cloud SQL or external database credentials:

```env
# Database Configuration
DB_HOST=YOUR_CLOUD_SQL_CONNECTION_NAME  # For Cloud SQL: /cloudsql/PROJECT:REGION:INSTANCE
DB_PORT=5432
DB_NAME=yfs_statistics
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD

# API Configuration
API_KEY=YOUR_PRODUCTION_API_KEY
PORT=8080

# Node Environment
NODE_ENV=production
```

## Step 3: Update server.js for Cloud Run

The server is already configured to use `process.env.PORT || 3000`. Cloud Run sets PORT to 8080 automatically.

Verify in [`backend/src/server.js`](../backend/src/server.js):
```javascript
const PORT = process.env.PORT || 3000;
```

## Step 4: Build and Test Docker Image Locally (Optional)

```bash
cd backend

# Build the image
docker build -t watson-backend .

# Test locally
docker run -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=yfs_statistics \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your-password \
  -e API_KEY=test-key \
  watson-backend

# Test the API
curl http://localhost:8080/api/health
```

## Step 5: Deploy to Cloud Run

### Method 1: Deploy from Source (Recommended)

```bash
cd backend

# Deploy to Cloud Run (builds image automatically)
gcloud run deploy watson-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,API_KEY=YOUR_API_KEY" \
  --set-secrets="DB_PASSWORD=watson-db-password:latest" \
  --add-cloudsql-instances=PROJECT_ID:REGION:INSTANCE_NAME \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

### Method 2: Deploy from Container Registry

```bash
# Set project ID
export PROJECT_ID=your-gcp-project-id

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/watson-backend backend/

# Deploy to Cloud Run
gcloud run deploy watson-backend \
  --image gcr.io/$PROJECT_ID/watson-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,API_KEY=YOUR_API_KEY" \
  --add-cloudsql-instances=PROJECT_ID:REGION:INSTANCE_NAME \
  --memory=512Mi \
  --cpu=1
```

## Step 6: Configure Secrets (Recommended)

Store sensitive data in Secret Manager:

```bash
# Create secret for database password
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create watson-db-password --data-file=-

# Create secret for API key
echo -n "YOUR_API_KEY" | gcloud secrets create watson-api-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding watson-db-password \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Deploy with secrets
gcloud run deploy watson-backend \
  --source . \
  --region us-central1 \
  --set-secrets=DB_PASSWORD=watson-db-password:latest,API_KEY=watson-api-key:latest \
  --add-cloudsql-instances=PROJECT_ID:REGION:INSTANCE_NAME
```

## Step 7: Configure Cloud SQL Connection

For Cloud SQL, use Unix socket connection:

Update your deployment:
```bash
gcloud run deploy watson-backend \
  --set-env-vars="DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME" \
  --add-cloudsql-instances=PROJECT_ID:REGION:INSTANCE_NAME
```

## Step 8: Set Up Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service watson-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

## Step 9: Configure CORS and Security

The application already includes:
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ API key authentication

For production, update CORS in [`backend/src/server.js`](../backend/src/server.js):
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://watsonx.ibm.com'],
  credentials: true
}));
```

## Step 10: Monitor and Scale

### View Logs
```bash
gcloud run services logs read watson-backend --region us-central1
```

### Update Service
```bash
gcloud run services update watson-backend \
  --region us-central1 \
  --memory=1Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=20
```

### Set Up Monitoring
```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime-checks create watson-health \
  --display-name="Watson Backend Health" \
  --resource-type=uptime-url \
  --monitored-resource=url \
  --host=YOUR_CLOUD_RUN_URL \
  --path=/api/health
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DB_HOST` | Yes | Database host | `/cloudsql/project:region:instance` or `10.0.0.1` |
| `DB_PORT` | Yes | Database port | `5432` |
| `DB_NAME` | Yes | Database name | `yfs_statistics` |
| `DB_USER` | Yes | Database user | `postgres` |
| `DB_PASSWORD` | Yes | Database password | Use Secret Manager |
| `API_KEY` | Yes | API authentication key | Use Secret Manager |
| `PORT` | No | Server port (auto-set by Cloud Run) | `8080` |
| `NODE_ENV` | No | Node environment | `production` |

## Cost Estimation

**Cloud Run Pricing** (us-central1):
- CPU: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GiB-second
- Requests: $0.40 per million requests
- Free tier: 2 million requests/month

**Example Monthly Cost** (moderate usage):
- 1 million requests
- 512 MB memory, 1 vCPU
- Average 200ms response time
- **Estimated: $5-10/month**

**Cloud SQL Pricing**:
- db-f1-micro: ~$7.67/month
- db-g1-small: ~$25/month
- Storage: $0.17/GB/month

## Troubleshooting

### Connection Issues
```bash
# Test Cloud SQL connection
gcloud sql connect watson-postgres --user=postgres

# Check Cloud Run logs
gcloud run services logs read watson-backend --limit=50
```

### Database Connection Timeout
- Ensure Cloud SQL instance is in same region as Cloud Run
- Verify `--add-cloudsql-instances` flag is correct
- Check database user permissions

### API Key Issues
- Verify API_KEY environment variable is set
- Check Secret Manager permissions
- Test with: `curl -H "X-API-Key: YOUR_KEY" https://YOUR_URL/api/health`

## Security Best Practices

1. ✅ Use Secret Manager for sensitive data
2. ✅ Enable Cloud SQL SSL/TLS
3. ✅ Use private IP for Cloud SQL
4. ✅ Implement API key rotation
5. ✅ Enable Cloud Armor for DDoS protection
6. ✅ Set up VPC Service Controls
7. ✅ Regular security audits

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy watson-backend \
            --source ./backend \
            --region us-central1 \
            --platform managed
```

## Next Steps

1. Set up monitoring and alerting
2. Configure backup strategy for Cloud SQL
3. Implement CI/CD pipeline
4. Set up staging environment
5. Configure custom domain and SSL
6. Enable Cloud CDN for static assets
7. Implement request logging and analytics

## Support

For issues or questions:
- GCP Documentation: https://cloud.google.com/run/docs
- Cloud SQL: https://cloud.google.com/sql/docs
- This project: See main README.md