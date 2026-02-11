#!/bin/bash

# Watson Orchestration Backend - GCP Cloud Run Deployment Script
# This script automates the deployment process to Google Cloud Run

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="watson-backend"
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-}"

echo -e "${GREEN}=== Watson Orchestration Backend - GCP Deployment ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if project ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}GCP Project ID not set. Please enter your project ID:${NC}"
    read -r PROJECT_ID
fi

# Set the project
echo -e "${GREEN}Setting GCP project to: $PROJECT_ID${NC}"
gcloud config set project "$PROJECT_ID"

# Check if Cloud SQL instance is configured
if [ -z "$CLOUD_SQL_INSTANCE" ]; then
    echo -e "${YELLOW}Cloud SQL instance not configured.${NC}"
    echo "Enter Cloud SQL connection name (format: PROJECT:REGION:INSTANCE) or press Enter to skip:"
    read -r CLOUD_SQL_INSTANCE
fi

# Prompt for secrets
echo -e "\n${YELLOW}=== Configure Secrets ===${NC}"
echo "Do you want to create/update secrets in Secret Manager? (y/n)"
read -r CREATE_SECRETS

if [ "$CREATE_SECRETS" = "y" ]; then
    echo "Enter database password:"
    read -rs DB_PASSWORD
    echo "$DB_PASSWORD" | gcloud secrets create watson-db-password --data-file=- --replication-policy=automatic 2>/dev/null || \
    echo "$DB_PASSWORD" | gcloud secrets versions add watson-db-password --data-file=-
    
    echo -e "\nEnter API key:"
    read -rs API_KEY
    echo "$API_KEY" | gcloud secrets create watson-api-key --data-file=- --replication-policy=automatic 2>/dev/null || \
    echo "$API_KEY" | gcloud secrets versions add watson-api-key --data-file=-
    
    echo -e "${GREEN}Secrets created/updated successfully${NC}"
fi

# Build deployment command
DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
  --source ./backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars=NODE_ENV=production"

# Add Cloud SQL if configured
if [ -n "$CLOUD_SQL_INSTANCE" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --add-cloudsql-instances=$CLOUD_SQL_INSTANCE"
    echo -e "${GREEN}Cloud SQL instance configured: $CLOUD_SQL_INSTANCE${NC}"
fi

# Add secrets if they exist
if gcloud secrets describe watson-db-password &>/dev/null && gcloud secrets describe watson-api-key &>/dev/null; then
    DEPLOY_CMD="$DEPLOY_CMD --set-secrets=DB_PASSWORD=watson-db-password:latest,API_KEY=watson-api-key:latest"
    echo -e "${GREEN}Secrets will be mounted from Secret Manager${NC}"
fi

# Confirm deployment
echo -e "\n${YELLOW}=== Deployment Configuration ===${NC}"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Cloud SQL: ${CLOUD_SQL_INSTANCE:-Not configured}"
echo ""
echo "Ready to deploy? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

# Deploy
echo -e "\n${GREEN}=== Deploying to Cloud Run ===${NC}"
eval "$DEPLOY_CMD"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "Service URL: ${GREEN}$SERVICE_URL${NC}"
echo -e "\nTest your deployment:"
echo -e "  Health check: ${GREEN}curl $SERVICE_URL/api/health${NC}"
echo -e "  API docs: ${GREEN}$SERVICE_URL/api-docs${NC}"
echo -e "\nWith API key:"
echo -e "  ${GREEN}curl -H \"X-API-Key: YOUR_KEY\" $SERVICE_URL/api/query/components/list${NC}"

# Optional: Test health endpoint
echo -e "\n${YELLOW}Test health endpoint now? (y/n)${NC}"
read -r TEST_HEALTH

if [ "$TEST_HEALTH" = "y" ]; then
    echo -e "\n${GREEN}Testing health endpoint...${NC}"
    curl -s "$SERVICE_URL/api/health" | jq '.' || curl -s "$SERVICE_URL/api/health"
fi

echo -e "\n${GREEN}Deployment script completed!${NC}"
echo -e "For more information, see: ${YELLOW}docs/GCP_CLOUD_RUN_DEPLOYMENT.md${NC}"

# Made with Bob
