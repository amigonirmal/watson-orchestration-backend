# WatsonX Orchestrate - Prompt Examples & Expected Responses

## Quick Reference Guide

This document provides ready-to-use prompts for testing your WatsonX Orchestrate agent with the Watson Orchestration Backend APIs.

---

## Table of Contents

1. [Basic Queries](#basic-queries)
2. [Filtered Queries](#filtered-queries)
3. [Comparison Queries](#comparison-queries)
4. [Trend Analysis](#trend-analysis)
5. [Complex Multi-Step Queries](#complex-multi-step-queries)
6. [Natural Language Variations](#natural-language-variations)

---

## Basic Queries

### Example 1: List All Servers

**User Prompt**:
```
"What servers are available?"
```

**Alternative Prompts**:
- "Show me all servers"
- "List servers"
- "Which servers do we have?"

**Expected API Call**:
```http
GET /api/query/servers
```

**Expected Response**:
```
Available Servers (74 total):

📋 Server List:
1. YFSAPP01
2. YFSAPP02
3. YFSAPP03
4. YFSAPP04
5. YFSAPP05
... (69 more servers)

💡 Tip: You can query statistics for any server by name.
Example: "Show me statistics for YFSAPP01"
```

---

### Example 2: Get Server Statistics

**User Prompt**:
```
"Show me statistics for server YFSAPP01"
```

**Alternative Prompts**:
- "What's the performance of YFSAPP01?"
- "Get stats for YFSAPP01"
- "YFSAPP01 statistics"

**Expected API Call**:
```http
GET /api/query/server/YFSAPP01
```

**Expected Response**:
```
YFSAPP01 Statistics (Last 7 Days):

📊 Overview:
- Total Services: 45
- Total Invocations: 15,234
- Average Response Time: 245ms
- Data Points: 1,250

🔝 Top Services by Invocations:
1. processOrder: 3,450 invocations
2. getOrderDetails: 2,890 invocations
3. updateInventory: 2,120 invocations
4. createShipment: 1,850 invocations
5. validatePayment: 1,620 invocations

⚡ Performance Metrics:
- Fastest Service: getOrderStatus (avg: 85ms)
- Slowest Service: generateReport (avg: 1,250ms)
- Most Active Hour: 14:00-15:00 (2,450 invocations)

Would you like to see detailed statistics for any specific service?
```

---

### Example 3: Get Component List

**User Prompt**:
```
"List all components"
```

**Alternative Prompts**:
- "What components are available?"
- "Show me all components"
- "Component list"

**Expected API Call**:
```http
GET /api/query/components
```

**Expected Response**:
```
Available Components (Hierarchical Structure):

📦 Components:

1. YFSExtnOrderProcessOrderImplService
   └── Services:
       • processOrder (INTEGRATION)
       • validateOrder (INTEGRATION)
       • cancelOrder (INTEGRATION)

2. YFSExtnInventoryManagementService
   └── Services:
       • updateInventory (INTEGRATION)
       • checkAvailability (INTEGRATION)
       • reserveInventory (INTEGRATION)

3. YFSExtnShipmentService
   └── Services:
       • createShipment (INTEGRATION)
       • trackShipment (INTEGRATION)
       • updateShipmentStatus (INTEGRATION)

... (42 more components)

💡 Total: 45 components with 180 services
```

---

## Filtered Queries

### Example 4: Filter by Service Type

**User Prompt**:
```
"Show me all INTEGRATION services"
```

**Alternative Prompts**:
- "List INTEGRATION type services"
- "What INTEGRATION services do we have?"
- "Get all integration services"

**Expected API Call**:
```http
GET /api/query/stats?service_type=INTEGRATION
```

**Expected Response**:
```
INTEGRATION Services (Last 7 Days):

📊 Summary:
- Total Services: 120
- Total Invocations: 125,450
- Average Response Time: 312ms
- Success Rate: 99.1%

🏆 Top 10 Services:
1. processOrder: 25,340 invocations (avg: 245ms)
2. getOrderDetails: 18,920 invocations (avg: 180ms)
3. updateInventory: 15,680 invocations (avg: 290ms)
4. createShipment: 12,450 invocations (avg: 320ms)
5. validatePayment: 10,890 invocations (avg: 410ms)
6. checkAvailability: 9,120 invocations (avg: 150ms)
7. cancelOrder: 7,650 invocations (avg: 380ms)
8. trackShipment: 6,890 invocations (avg: 220ms)
9. generateInvoice: 5,420 invocations (avg: 560ms)
10. sendNotification: 4,890 invocations (avg: 95ms)

📈 Trend: ⬆️ +12% compared to previous week
```

---

### Example 5: Filter by Date Range

**User Prompt**:
```
"Show me statistics from January 1st to January 31st, 2024"
```

**Alternative Prompts**:
- "Get stats for January 2024"
- "What happened in January?"
- "January statistics"

**Expected API Call**:
```http
GET /api/query/stats?start_date=2024-01-01&end_date=2024-01-31
```

**Expected Response**:
```
Statistics for January 2024:

📊 Monthly Overview:
- Total Invocations: 425,680
- Daily Average: 13,732
- Total Services: 180
- Active Servers: 74

📈 Weekly Breakdown:
- Week 1 (Jan 1-7): 85,240 invocations
- Week 2 (Jan 8-14): 95,680 invocations
- Week 3 (Jan 15-21): 105,890 invocations
- Week 4 (Jan 22-28): 110,450 invocations
- Week 5 (Jan 29-31): 28,420 invocations

🎯 Key Insights:
- Peak Day: January 15 (18,920 invocations)
- Lowest Day: January 1 (8,450 invocations)
- Growth Rate: +29% month-over-month
- Weekend Average: 35% lower than weekdays

⚠️ Attention Points:
- Week 3 showed unusual spike (+10% vs Week 2)
- Consider capacity planning for similar patterns
```

---

### Example 6: Filter by Service Name

**User Prompt**:
```
"Show me statistics for processOrder service"
```

**Alternative Prompts**:
- "processOrder performance"
- "How is processOrder doing?"
- "Get processOrder stats"

**Expected API Call**:
```http
GET /api/query/service/processOrder
```

**Expected Response**:
```
processOrder Service Statistics (Last 7 Days):

📊 Performance Metrics:
- Total Invocations: 8,750
- Average Response Time: 245ms
- Success Rate: 99.2%
- Error Rate: 0.8% (70 errors)

📈 Daily Breakdown:
┌─────────┬──────────────┬──────────┐
│ Day     │ Invocations  │ Avg Time │
├─────────┼──────────────┼──────────┤
│ Mon     │ 1,250        │ 240ms    │
│ Tue     │ 1,380        │ 250ms    │
│ Wed     │ 1,420        │ 245ms    │
│ Thu     │ 1,350        │ 248ms    │
│ Fri     │ 1,450        │ 242ms    │
│ Sat     │ 980          │ 235ms    │
│ Sun     │ 920          │ 238ms    │
└─────────┴──────────────┴──────────┘

🖥️ Server Distribution:
- YFSAPP01: 3,200 invocations (36.6%)
- YFSAPP02: 2,950 invocations (33.7%)
- YFSAPP03: 2,600 invocations (29.7%)

⚡ Performance Insights:
✅ Consistent performance across all servers
✅ Better response times on weekends
⚠️ Slight increase in response time on Tuesday
```

---

### Example 7: Multiple Filters Combined

**User Prompt**:
```
"Show me INTEGRATION services for processOrder from January 1 to January 15"
```

**Alternative Prompts**:
- "Get processOrder INTEGRATION stats for first half of January"
- "processOrder integration service statistics Jan 1-15"

**Expected API Call**:
```http
GET /api/query/service/processOrder?service_type=INTEGRATION&start_date=2024-01-01&end_date=2024-01-15
```

**Expected Response**:
```
processOrder (INTEGRATION) - Jan 1-15, 2024:

📊 Period Summary:
- Total Invocations: 4,250
- Daily Average: 283
- Average Response Time: 242ms
- Success Rate: 99.3%

📈 Trend Analysis:
- First Week: 1,890 invocations (avg: 270/day)
- Second Week: 2,360 invocations (avg: 337/day)
- Growth: +24.9% week-over-week

🎯 Peak Performance:
- Best Day: January 12 (450 invocations, 235ms avg)
- Worst Day: January 3 (180 invocations, 265ms avg)
- Peak Hour: 14:00-15:00 (avg 45 invocations/hour)

💡 Insights:
- Steady growth throughout the period
- Consistent performance across all days
- No significant anomalies detected
```

---

## Comparison Queries

### Example 8: Compare Servers

**User Prompt**:
```
"Compare invocations across all servers"
```

**Alternative Prompts**:
- "Which server has the most invocations?"
- "Server comparison"
- "Compare server performance"

**Expected API Call**:
```http
GET /api/query/comparison?type=server&statistic_name=Invocations
```

**Expected Response**:
```
Server Invocation Comparison (Last 7 Days):

📊 Top 10 Servers:
┌──────────┬──────────────┬─────────┬────────────┐
│ Rank     │ Server       │ Invocs  │ % of Total │
├──────────┼──────────────┼─────────┼────────────┤
│ 1        │ YFSAPP01     │ 15,234  │ 8.2%       │
│ 2        │ YFSAPP02     │ 14,890  │ 8.0%       │
│ 3        │ YFSAPP03     │ 14,120  │ 7.6%       │
│ 4        │ YFSAPP04     │ 13,450  │ 7.2%       │
│ 5        │ YFSAPP05     │ 12,890  │ 6.9%       │
│ 6        │ YFSAPP06     │ 12,340  │ 6.6%       │
│ 7        │ YFSAPP07     │ 11,920  │ 6.4%       │
│ 8        │ YFSAPP08     │ 11,450  │ 6.2%       │
│ 9        │ YFSAPP09     │ 10,890  │ 5.9%       │
│ 10       │ YFSAPP10     │ 10,340  │ 5.6%       │
└──────────┴──────────────┴─────────┴────────────┘

📈 Distribution Analysis:
- Top 10 servers: 127,524 invocations (68.5%)
- Remaining 64 servers: 58,656 invocations (31.5%)
- Average per server: 2,516 invocations

⚖️ Load Balance:
- Most loaded: YFSAPP01 (15,234)
- Least loaded: YFSAPP74 (890)
- Variance: 17.1x difference
- Recommendation: Consider load balancing optimization
```

---

### Example 9: Compare Services

**User Prompt**:
```
"Compare average response times across services"
```

**Alternative Prompts**:
- "Which service is fastest?"
- "Service performance comparison"
- "Compare service response times"

**Expected API Call**:
```http
GET /api/query/comparison?type=service&statistic_name=Average
```

**Expected Response**:
```
Service Response Time Comparison (Last 7 Days):

⚡ Fastest Services (Top 10):
┌──────────────────────────┬──────────┬──────────────┐
│ Service                  │ Avg Time │ Invocations  │
├──────────────────────────┼──────────┼──────────────┤
│ getOrderStatus           │ 85ms     │ 8,920        │
│ checkAvailability        │ 95ms     │ 9,120        │
│ sendNotification         │ 105ms    │ 4,890        │
│ validateAddress          │ 120ms    │ 3,450        │
│ getCustomerInfo          │ 135ms    │ 6,780        │
│ getOrderDetails          │ 180ms    │ 18,920       │
│ trackShipment            │ 220ms    │ 6,890        │
│ processOrder             │ 245ms    │ 25,340       │
│ updateInventory          │ 290ms    │ 15,680       │
│ createShipment           │ 320ms    │ 12,450       │
└──────────────────────────┴──────────┴──────────────┘

🐌 Slowest Services (Bottom 5):
┌──────────────────────────┬──────────┬──────────────┐
│ Service                  │ Avg Time │ Invocations  │
├──────────────────────────┼──────────┼──────────────┤
│ generateReport           │ 1,250ms  │ 2,340        │
│ processRefund            │ 980ms    │ 1,890        │
│ calculateTax             │ 850ms    │ 3,120        │
│ generateInvoice          │ 560ms    │ 5,420        │
│ validatePayment          │ 410ms    │ 10,890       │
└──────────────────────────┴──────────┴──────────────┘

💡 Insights:
- Read operations are generally faster (avg: 150ms)
- Write operations take longer (avg: 380ms)
- Report generation needs optimization (1,250ms)
```

---

### Example 10: Daily Comparison

**User Prompt**:
```
"Compare daily invocations for the last week"
```

**Alternative Prompts**:
- "Show me daily comparison"
- "Day-by-day invocation comparison"
- "Weekly daily breakdown"

**Expected API Call**:
```http
GET /api/query/comparison?type=server&aggregation=daily&start_date=2024-01-08&end_date=2024-01-15
```

**Expected Response**:
```
Daily Invocation Comparison (Jan 8-15, 2024):

📊 Daily Totals:
┌────────────┬──────────────┬────────────┬──────────┐
│ Date       │ Invocations  │ vs Prev    │ Trend    │
├────────────┼──────────────┼────────────┼──────────┤
│ Mon Jan 8  │ 18,450       │ -          │ -        │
│ Tue Jan 9  │ 19,230       │ +4.2%      │ ⬆️       │
│ Wed Jan 10 │ 19,890       │ +3.4%      │ ⬆️       │
│ Thu Jan 11 │ 19,120       │ -3.9%      │ ⬇️       │
│ Fri Jan 12 │ 20,450       │ +7.0%      │ ⬆️       │
│ Sat Jan 13 │ 12,340       │ -39.7%     │ ⬇️       │
│ Sun Jan 14 │ 11,890       │ -3.6%      │ ⬇️       │
└────────────┴──────────────┴────────────┴──────────┘

📈 Weekly Insights:
- Total Week: 121,370 invocations
- Daily Average: 17,339
- Weekday Average: 19,428
- Weekend Average: 12,115
- Weekend Drop: 37.6%

🎯 Patterns:
- Peak Day: Friday (20,450 invocations)
- Lowest Day: Sunday (11,890 invocations)
- Weekday Trend: Steady increase Mon-Fri
- Weekend Pattern: Consistent 35-40% drop
```

---

## Trend Analysis

### Example 11: Hourly Trends

**User Prompt**:
```
"Show me hourly invocation trends for today"
```

**Alternative Prompts**:
- "Hourly breakdown for today"
- "Today's hourly statistics"
- "Hour by hour invocations"

**Expected API Call**:
```http
GET /api/query/invocations?aggregation=hourly&start_date=2024-01-15&end_date=2024-01-15
```

**Expected Response**:
```
Hourly Invocation Trends (Today - Jan 15, 2024):

📊 Hourly Breakdown:
┌──────────┬──────────────┬──────────┬──────────┐
│ Hour     │ Invocations  │ Avg Time │ Status   │
├──────────┼──────────────┼──────────┼──────────┤
│ 00:00    │ 450          │ 235ms    │ 🌙 Low   │
│ 01:00    │ 380          │ 228ms    │ 🌙 Low   │
│ 02:00    │ 320          │ 225ms    │ 🌙 Low   │
│ 03:00    │ 290          │ 220ms    │ 🌙 Low   │
│ 04:00    │ 340          │ 230ms    │ 🌙 Low   │
│ 05:00    │ 520          │ 240ms    │ 🌅 Rising│
│ 06:00    │ 890          │ 245ms    │ 🌅 Rising│
│ 07:00    │ 1,450        │ 250ms    │ ☀️ High  │
│ 08:00    │ 2,120        │ 260ms    │ ☀️ High  │
│ 09:00    │ 2,680        │ 265ms    │ ☀️ High  │
│ 10:00    │ 2,890        │ 270ms    │ ☀️ High  │
│ 11:00    │ 2,950        │ 268ms    │ ☀️ High  │
│ 12:00    │ 2,340        │ 255ms    │ ☀️ High  │
│ 13:00    │ 2,780        │ 262ms    │ ☀️ High  │
│ 14:00    │ 3,120        │ 275ms    │ 🔥 Peak  │
│ 15:00    │ 2,890        │ 270ms    │ ☀️ High  │
│ 16:00    │ 2,450        │ 258ms    │ ☀️ High  │
│ 17:00    │ 1,890        │ 248ms    │ 🌆 Falling│
│ 18:00    │ 1,340        │ 242ms    │ 🌆 Falling│
│ 19:00    │ 980          │ 238ms    │ 🌙 Low   │
│ 20:00    │ 720          │ 235ms    │ 🌙 Low   │
│ 21:00    │ 580          │ 230ms    │ 🌙 Low   │
│ 22:00    │ 490          │ 228ms    │ 🌙 Low   │
│ 23:00    │ 420          │ 225ms    │ 🌙 Low   │
└──────────┴──────────────┴──────────┴──────────┘

📈 Key Insights:
- Peak Hour: 14:00 (3,120 invocations)
- Lowest Hour: 03:00 (290 invocations)
- Business Hours (8-17): 23,120 invocations (78.5%)
- Off Hours: 6,330 invocations (21.5%)
- Current Status: ☀️ High activity period
```

---

### Example 12: Weekly Trends

**User Prompt**:
```
"Show me weekly trends for the last month"
```

**Alternative Prompts**:
- "Monthly weekly breakdown"
- "Week by week statistics"
- "Last 4 weeks comparison"

**Expected API Call**:
```http
GET /api/query/invocations?aggregation=daily&start_date=2024-01-01&end_date=2024-01-31
```

**Expected Response**:
```
Weekly Trends (January 2024):

📊 Weekly Summary:
┌────────────────┬──────────────┬──────────┬──────────┐
│ Week           │ Invocations  │ vs Prev  │ Trend    │
├────────────────┼──────────────┼──────────┼──────────┤
│ Week 1 (1-7)   │ 85,240       │ -        │ -        │
│ Week 2 (8-14)  │ 95,680       │ +12.2%   │ ⬆️       │
│ Week 3 (15-21) │ 105,890      │ +10.7%   │ ⬆️       │
│ Week 4 (22-28) │ 110,450      │ +4.3%    │ ⬆️       │
│ Week 5 (29-31) │ 28,420       │ -        │ -        │
└────────────────┴──────────────┴──────────┴──────────┘

📈 Growth Analysis:
- Total Month: 425,680 invocations
- Average Week: 106,420 invocations
- Growth Rate: +5.5% per week
- Month-over-Month: +29%

🎯 Patterns Identified:
1. Consistent weekly growth (4-12%)
2. Week 3 showed highest growth (+10.7%)
3. Week 4 growth slowed but remained positive
4. Projected Week 5 full: ~95,000 invocations

💡 Recommendations:
- Capacity planning for continued 5-10% weekly growth
- Monitor Week 3 pattern for potential capacity issues
- Consider scaling resources for peak weeks
```

---

## Complex Multi-Step Queries

### Example 13: Performance Investigation

**User Prompt**:
```
"Which server has the slowest average response time and what services are running on it?"
```

**Expected Flow**:
1. Compare servers by average response time
2. Identify slowest server
3. Query services on that server
4. Provide detailed analysis

**Expected Response**:
```
Performance Investigation Results:

🔍 Step 1: Server Comparison
Slowest Server: YFSAPP45 (avg: 485ms)

📊 YFSAPP45 Details:
- Average Response Time: 485ms
- Total Invocations: 8,920
- Active Services: 38
- Status: ⚠️ Needs attention

🔝 Services on YFSAPP45 (Top 10 by response time):
┌──────────────────────────┬──────────┬──────────────┐
│ Service                  │ Avg Time │ Invocations  │
├──────────────────────────┼──────────┼──────────────┤
│ generateReport           │ 1,850ms  │ 450          │
│ processRefund            │ 1,320ms  │ 380          │
│ calculateComplexTax      │ 980ms    │ 620          │
│ generateInvoice          │ 750ms    │ 890          │
│ validatePayment          │ 520ms    │ 1,240        │
│ processOrder             │ 380ms    │ 2,450        │
│ updateInventory          │ 340ms    │ 1,890        │
│ createShipment           │ 310ms    │ 980          │
│ getOrderDetails          │ 220ms    │ 1,450        │
│ checkAvailability        │ 180ms    │ 890          │
└──────────────────────────┴──────────┴──────────────┘

🎯 Root Cause Analysis:
1. Report generation services are significantly slow
2. Complex calculation services need optimization
3. High invocation count on slower services

💡 Recommendations:
1. Optimize generateReport service (1,850ms → target: <500ms)
2. Consider caching for calculateComplexTax
3. Review database queries in processRefund
4. Load balance report generation to dedicated server
5. Implement async processing for long-running tasks

Would you like me to:
- Compare this server with others?
- Show historical trends for these services?
- Provide detailed optimization suggestions?
```

---

### Example 14: Capacity Planning

**User Prompt**:
```
"Based on last month's trends, what capacity do we need for next month?"
```

**Expected Flow**:
1. Get monthly statistics
2. Calculate growth rate
3. Identify peak patterns
4. Project future capacity needs

**Expected Response**:
```
Capacity Planning Analysis:

📊 Historical Data (January 2024):
- Total Invocations: 425,680
- Daily Average: 13,732
- Peak Day: 18,920 invocations
- Growth Rate: +29% MoM

📈 Trend Analysis:
- Week 1: 85,240 invocations
- Week 2: 95,680 invocations (+12.2%)
- Week 3: 105,890 invocations (+10.7%)
- Week 4: 110,450 invocations (+4.3%)
- Average Weekly Growth: +9.1%

🎯 February 2024 Projections:

Conservative Estimate (5% growth):
- Total Month: ~447,000 invocations
- Daily Average: ~14,400
- Peak Day: ~19,900 invocations

Moderate Estimate (10% growth):
- Total Month: ~468,000 invocations
- Daily Average: ~15,100
- Peak Day: ~20,800 invocations

Aggressive Estimate (15% growth):
- Total Month: ~489,500 invocations
- Daily Average: ~15,800
- Peak Day: ~21,800 invocations

💡 Capacity Recommendations:

1. Server Capacity:
   - Current: 74 servers handling ~13,700/day
   - Recommended: Plan for 15,800/day capacity
   - Action: Add 2-3 servers or optimize existing

2. Peak Hour Handling:
   - Current Peak: 3,120 invocations/hour
   - Projected Peak: 3,600 invocations/hour
   - Action: Ensure 20% buffer capacity

3. Database Capacity:
   - Current Load: ~186 queries/minute
   - Projected Load: ~215 queries/minute
   - Action: Review connection pool settings

4. Storage Requirements:
   - Current: ~74,700 records/month
   - Projected: ~86,000 records/month
   - Action: Plan for 100K records/month

5. Monitoring Thresholds:
   - Set alerts at 80% capacity
   - Review weekly growth patterns
   - Adjust scaling policies

Would you like me to:
- Create detailed scaling plan?
- Analyze specific server capacity?
- Review cost implications?
```

---

## Natural Language Variations

### Example 15: Casual Conversational Queries

**User Prompts** (All equivalent):
```
"How's YFSAPP01 doing?"
"What's up with YFSAPP01?"
"Tell me about YFSAPP01"
"YFSAPP01 status"
"Check YFSAPP01"
"Is YFSAPP01 okay?"
"YFSAPP01 performance"
```

**Expected Response**: Same as Example 2 (Get Server Statistics)

---

### Example 16: Time-Based Natural Language

**User Prompts** (All equivalent):
```
"Show me today's statistics"
"What happened today?"
"Today's performance"
"Stats for today"
"How are we doing today?"
```

**Expected API Call**:
```http
GET /api/query/stats?start_date=2024-01-15&end_date=2024-01-15
```

---

### Example 17: Comparative Natural Language

**User Prompts** (All equivalent):
```
"Which server is the busiest?"
"What's the most active server?"
"Top server by invocations"
"Busiest server"
"Server with most traffic"
```

**Expected API Call**:
```http
GET /api/query/comparison?type=server&statistic_name=Invocations
```

---

## Testing Checklist

Use these prompts to verify your WatsonX Orchestrate configuration:

### Basic Functionality
- [ ] "List all servers"
- [ ] "Show me statistics for YFSAPP01"
- [ ] "List all components"

### Filtering
- [ ] "Show me INTEGRATION services"
- [ ] "Get statistics for January 2024"
- [ ] "Show me processOrder service statistics"

### Comparison
- [ ] "Compare servers by invocations"
- [ ] "Which service is fastest?"
- [ ] "Compare daily invocations"

### Trends
- [ ] "Show me hourly trends for today"
- [ ] "Weekly trends for last month"

### Complex Queries
- [ ] "Which server has the slowest response time?"
- [ ] "What capacity do we need for next month?"

### Natural Language
- [ ] "How's YFSAPP01 doing?"
- [ ] "What happened today?"
- [ ] "Which server is busiest?"

---

## Tips for Best Results

### 1. Be Specific with Dates
✅ Good: "Show me statistics from January 1 to January 15"
❌ Vague: "Show me recent statistics"

### 2. Use Exact Names
✅ Good: "Statistics for YFSAPP01"
❌ Vague: "Statistics for app server 1"

### 3. Specify Metrics
✅ Good: "Compare average response times"
❌ Vague: "Compare performance"

### 4. Request Specific Time Ranges
✅ Good: "Hourly trends for today"
❌ Vague: "Show me trends"

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-12  
**Author**: IBM Bob (AI Assistant)