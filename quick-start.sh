#!/bin/bash

# Watson Orchestration Backend - Quick Start Script
# This script helps you quickly set up and test the backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Watson Orchestration Backend - Quick Start          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check PostgreSQL
echo -e "${YELLOW}[1/6] Checking PostgreSQL...${NC}"
if docker ps | grep -q postgres-db; then
    echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL container not found. Starting it...${NC}"
    docker run --name postgres-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:14.20
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
    sleep 3
fi

# Step 2: Check if table exists
echo -e "\n${YELLOW}[2/6] Checking database table...${NC}"
TABLE_EXISTS=$(docker exec postgres-db psql -U postgres -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'yfs_statistics_detail');")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo -e "${GREEN}✅ Table yfs_statistics_detail exists${NC}"
else
    echo -e "${YELLOW}⚠️  Table not found. Please create it manually.${NC}"
    echo -e "${BLUE}Run: docker exec -it postgres-db psql -U postgres${NC}"
    echo -e "${BLUE}Then paste the CREATE TABLE statement from your schema${NC}"
fi

# Step 3: Check for test data
echo -e "\n${YELLOW}[3/6] Checking test data...${NC}"
RECORD_COUNT=$(docker exec postgres-db psql -U postgres -tAc "SELECT COUNT(*) FROM yfs_statistics_detail;" 2>/dev/null || echo "0")

if [ "$RECORD_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $RECORD_COUNT records in database${NC}"
else
    echo -e "${YELLOW}⚠️  No data found. Inserting test data...${NC}"
    if [ -f "database/insert_test_data.sql" ]; then
        docker exec -i postgres-db psql -U postgres < database/insert_test_data.sql
        echo -e "${GREEN}✅ Test data inserted${NC}"
    else
        echo -e "${RED}❌ Test data file not found${NC}"
    fi
fi

# Step 4: Install dependencies
echo -e "\n${YELLOW}[4/6] Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
cd ..

# Step 5: Check .env file
echo -e "\n${YELLOW}[5/6] Checking configuration...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Configuration file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Configuration file created${NC}"
fi

# Step 6: Instructions
echo -e "\n${YELLOW}[6/6] Setup complete!${NC}"
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Next Steps                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "\n${GREEN}1. Start the backend server:${NC}"
echo -e "   ${BLUE}cd backend && npm start${NC}"
echo -e "\n${GREEN}2. In a new terminal, run the test script:${NC}"
echo -e "   ${BLUE}node test-backend.js${NC}"
echo -e "\n${GREEN}3. Or test manually with curl:${NC}"
echo -e "   ${BLUE}curl http://localhost:3000/api/health${NC}"
echo -e "\n${GREEN}4. View the full testing guide:${NC}"
echo -e "   ${BLUE}cat TESTING_GUIDE.md${NC}"
echo -e "\n${YELLOW}📚 For detailed instructions, see TESTING_GUIDE.md${NC}"
echo ""

# Made with Bob
