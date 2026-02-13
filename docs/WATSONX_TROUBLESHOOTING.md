# WatsonX Orchestrate Agent - Troubleshooting Guide

## Common Errors and Solutions

---

## Error: "Please reduce the length of the messages or completion"

### Error Details
```
Error code: 400
Message: 'groq error: Please reduce the length of the messages or completion.'
Type: invalid_request_error
Provider: groq
```

### Root Cause
This error occurs when the total token count (input + output) exceeds the model's context window limit. This typically happens when:
1. The agent instructions/behavior configuration is too long
2. The conversation history is too long
3. The API response data is too large
4. The combination of all inputs exceeds the model's limit

### Solutions

#### Solution 1: Reduce Agent Instructions (Recommended)

**Current Issue**: The behavior configuration is too detailed for the model's context window.

**Action**: Use a **concise** version of the agent instructions.

**Concise Agent Instructions Template**:
```
You are the YFS Statistics Intelligence Agent. You provide real-time YFS performance data.

CAPABILITIES:
- Query 74 servers (YFSAPP01-YFSAPP74)
- Filter by service type (INTEGRATION/AGENT)
- Compare performance metrics
- Analyze trends (hourly/daily)

RESPONSE FORMAT:
- Use structured data (tables, lists)
- Include visual indicators (📊, ⬆️, ⬇️, ⚠️)
- Provide insights and recommendations
- Keep responses concise

SERVER NAME MATCHING:
- Exact: "YFSAPP01" → YFSAPP01
- Partial: "APP01" → YFSAPP01
- Typo: "YFSAP01" → YFSAPP01 (suggest correction)
- If ambiguous, ask for clarification

ERROR HANDLING:
- No data: Suggest alternatives
- Invalid input: Provide examples
- API error: Retry or show cached data

TONE: Professional, data-driven, actionable
```

#### Solution 2: Switch to a Model with Larger Context Window

**Current Model**: Groq (limited context window)

**Recommended Alternatives**:

| Model | Context Window | Best For |
|-------|---------------|----------|
| **IBM Granite 13B Chat v2** | 8,192 tokens | Balanced performance (RECOMMENDED) |
| IBM Granite 20B Code | 8,192 tokens | Complex queries |
| Llama 2 70B Chat | 4,096 tokens | Conversational |
| Mixtral 8x7B | 32,768 tokens | Large context needs |
| GPT-4 Turbo | 128,000 tokens | Maximum context |

**Action**: Switch to **IBM Granite 13B Chat v2** in WatsonX Orchestrate settings.

#### Solution 3: Reduce Max Output Tokens

**Current Setting**: May be set too high

**Recommended Settings**:
```yaml
Model: IBM Granite 13B Chat v2
Temperature: 0.3
Max Tokens: 1024  # Reduced from 2048
Top P: 0.85
```

**Why**: Limiting output tokens leaves more room for input context.

#### Solution 4: Implement Response Truncation

**Add to Agent Instructions**:
```
RESPONSE LENGTH:
- Keep responses under 500 words
- For large datasets, show top 10 items only
- Offer pagination: "Show next 10" or "See more"
- Summarize instead of listing all details
```

#### Solution 5: Clear Conversation History

**Action**: Start a new conversation session

**Why**: Long conversation histories consume context window space.

**In WatsonX Orchestrate**:
- Click "New Conversation" or "Clear History"
- This resets the context window

#### Solution 6: Optimize API Response Size

**Backend Optimization** (if you control the API):

Add pagination to API endpoints:
```javascript
// Example: Limit results
GET /api/query/stats?limit=10&offset=0
```

**Agent Instruction Addition**:
```
API QUERIES:
- Always use limit=10 for initial queries
- Offer "show more" for additional results
- Summarize large datasets
```

---

## Recommended Configuration for WatsonX Orchestrate

### Minimal Agent Instructions (Copy-Paste Ready)

```
ROLE: YFS Statistics Intelligence Agent - Provides real-time performance data for 74 YFS servers.

CORE FUNCTIONS:
1. Query server statistics (YFSAPP01-YFSAPP74)
2. Filter by service type (INTEGRATION/AGENT)
3. Compare metrics across servers/services
4. Analyze trends (hourly/daily)

RESPONSE STYLE:
- Structured format (tables/lists)
- Visual indicators (📊⬆️⬇️⚠️)
- Concise insights
- Actionable recommendations
- Max 500 words per response

SERVER MATCHING:
- Exact: YFSAPP01
- Partial: APP01 → YFSAPP01
- Typo: YFSAP01 → suggest YFSAPP01
- Ambiguous: ask clarification

DATA LIMITS:
- Show top 10 items by default
- Offer "show more" for additional data
- Summarize large datasets

ERROR HANDLING:
- No data: suggest alternatives
- Invalid input: provide examples
- API error: retry or use cache

TONE: Professional, data-driven, concise
```

### Optimal Model Configuration

```yaml
Provider: IBM WatsonX
Model: granite-13b-chat-v2
Temperature: 0.3
Max Output Tokens: 1024
Top P: 0.85
Frequency Penalty: 0.2
Presence Penalty: 0.1
Stop Sequences: None
```

---

## Testing the Fix

### Test Query 1: Simple Server Query
```
"Show me statistics for YFSAPP01"
```

**Expected**: Should work without errors

### Test Query 2: Comparison Query
```
"Compare YFSAPP01 and YFSAPP02"
```

**Expected**: Should return concise comparison

### Test Query 3: Trend Analysis
```
"Show me hourly trends for today"
```

**Expected**: Should return top 10 hours with summary

---

## Additional Troubleshooting

### If Error Persists After Reducing Instructions

**Check**:
1. ✅ Model has sufficient context window (min 4,096 tokens)
2. ✅ Max output tokens set to 1024 or less
3. ✅ Conversation history is cleared
4. ✅ API responses are not too large

**Debug Steps**:
```
1. Test with minimal query: "List servers"
2. If works, gradually add complexity
3. Identify which query triggers the error
4. Optimize that specific query
```

### Contact Support

If issues continue:
- **WatsonX Support**: watsonx-support@ibm.com
- **API Issues**: Check backend logs
- **Model Issues**: Try different model (Granite 13B → Mixtral 8x7B)

---

## Prevention Best Practices

### 1. Keep Instructions Concise
```yaml
DO:
  - Use bullet points
  - Focus on essential behaviors
  - Limit to 500 words
  - Use abbreviations where clear

DON'T:
  - Include detailed examples in instructions
  - Repeat information
  - Add unnecessary explanations
  - Use verbose descriptions
```

### 2. Implement Smart Pagination
```yaml
Default Behavior:
  - Show top 10 results
  - Provide summary statistics
  - Offer "show more" option
  - Use aggregation for large datasets
```

### 3. Monitor Token Usage
```yaml
Track:
  - Average tokens per query
  - Peak token usage
  - Failed queries
  - Model context limits

Alert when:
  - Usage > 80% of context window
  - Frequent 400 errors
  - Response truncation occurs
```

### 4. Use Appropriate Models
```yaml
For Simple Queries:
  - Granite 13B Chat v2 (8K context)
  - Fast, efficient, cost-effective

For Complex Analysis:
  - Mixtral 8x7B (32K context)
  - Handles larger contexts

For Maximum Context:
  - GPT-4 Turbo (128K context)
  - Use only when necessary (higher cost)
```

---

## Quick Reference

### Error → Solution Mapping

| Error | Quick Fix |
|-------|-----------|
| 400 - Message too long | Reduce agent instructions to <500 words |
| 400 - Completion too long | Set max_tokens to 1024 |
| Context window exceeded | Switch to Granite 13B or Mixtral |
| Slow responses | Reduce max_tokens, use simpler model |
| Inconsistent results | Increase temperature to 0.4 |
| Too verbose | Add "max 500 words" to instructions |

### Model Selection Guide

| Use Case | Recommended Model | Context | Tokens |
|----------|------------------|---------|--------|
| Production (general) | Granite 13B Chat v2 | 8K | 1024 |
| Simple queries | Granite 13B Chat v2 | 8K | 512 |
| Complex analysis | Mixtral 8x7B | 32K | 2048 |
| Large context | GPT-4 Turbo | 128K | 4096 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-13  
**Author**: IBM Bob (AI Assistant)