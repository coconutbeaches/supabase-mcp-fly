# MotherBrainGPT CustomGPT Setup Guide

🎉 **MOCK SERVER IS READY FOR TESTING!** 🎉

The Supabase MCP server has been deployed to Fly.io with a fully functional mock server that returns realistic test data. This allows you to build and test your CustomGPT integration immediately without waiting for MCP server issues to be resolved.

## Server Status ✅

- **URL**: https://supabase-mcp-fly.fly.dev
- **Status**: Running mock server (returns realistic test data)
- **Authorization**: Bearer token required
- **Mode**: Testing mode with mock data

## Verified Working Endpoints

All the following endpoints have been tested and confirmed working:

### Basic Info
- ✅ `GET /` - Handshake (MCP protocol info)
- ✅ `GET /api/status` - Server status
- ✅ `GET /api/capabilities` - API capabilities
- ✅ `GET /api/tools` - Available tools list

### Database Operations
- ✅ `POST /api/tools/run_sql` - Execute SQL queries
- ✅ `POST /api/tools/list_tables` - List database tables  
- ✅ `POST /api/tools/select_rows` - Select data from tables
- ✅ `POST /api/tools/insert_rows` - Insert data into tables
- ✅ `POST /api/tools/get_table_schema` - Get table structure
- ✅ All other tool endpoints working

## Step-by-Step CustomGPT Creation

### 1. Go to ChatGPT Plus
Visit: https://chatgpt.com/gpts/editor

### 2. Create New GPT
Click "Create a GPT" and choose "Configure" tab

### 3. Basic Configuration

**Name:** `MotherBrainGPT`

**Description:** 
```
AI assistant with direct access to Supabase database operations. I can execute SQL queries, manage tables, insert/update/delete data, and provide database insights through the MCP server integration.
```

**Instructions:**
```
You are MotherBrainGPT, an advanced AI assistant with direct access to a Supabase database through a Model Context Protocol (MCP) server. Your capabilities include:

## Core Functions:
- Execute raw SQL queries with real-time results
- List and describe database tables and schemas
- Insert, update, select, and delete data from tables
- Analyze database structure and relationships
- Provide data insights and analytics
- Troubleshoot database issues

## Behavior Guidelines:
- Always confirm destructive operations before executing
- Use appropriate SQL best practices and safety measures
- Explain query results in a clear, user-friendly manner
- Suggest optimizations when relevant
- Handle errors gracefully and provide helpful feedback
- Default to read operations unless explicitly asked to modify data

## Mock Mode Notice:
Currently running in testing mode with realistic mock data including sample users, products, orders, etc. This allows safe testing without affecting real data.

When users ask about database operations, use the available tools to:
1. Check current tables with list_tables
2. Examine schemas with get_table_schema  
3. Run queries with run_sql
4. Select specific data with select_rows

Always let users know whether you're working with mock data or real data.
```

**Conversation starters:**
```
- "Show me all the tables in the database"
- "Execute this SQL query: SELECT * FROM users LIMIT 5"
- "What's the schema for the products table?"
- "Insert a new user with email test@example.com"
```

### 4. Actions Configuration

Click "Create new action" and paste this OpenAPI spec:

**Schema (copy from openapi-3.1.yaml file)**
```yaml
openapi: 3.1.1
info:
  title: Supabase MCP Bridge API
  description: REST API for Supabase database operations via MCP server
  version: 1.0.0
servers:
  - url: https://supabase-mcp-fly.fly.dev
    description: Supabase MCP Bridge Server on Fly.io

# ... rest of the OpenAPI spec from openapi-3.1.yaml
```

### 5. Authentication Setup

In the Actions configuration:

**Authentication Type:** `API Key`
**API Key:** `some-long-random-string`  
**Auth Type:** `Bearer`

### 6. Privacy Settings
- Set to "Only me" for initial testing
- Can change to "Anyone with a link" or "Public" later

### 7. Test the CustomGPT

Try these test commands:

1. **"Show me the server status"**
   - Should call `/api/status` and return mock server info

2. **"List all database tables"**
   - Should call `/api/tools/list_tables` and show tables like users, posts, products, etc.

3. **"Show me some users"**
   - Should call `/api/tools/select_rows` for users table

4. **"Execute SQL: SELECT * FROM users WHERE active = true"**
   - Should call `/api/tools/run_sql` with the query

5. **"What's the structure of the users table?"**
   - Should call `/api/tools/get_table_schema` for users

## Expected Mock Data Responses

The server returns realistic test data including:

- **Users table**: John Doe, Jane Smith, Bob Wilson with emails and timestamps
- **Tables**: users, posts, comments, products, orders, categories  
- **Counts**: Various count queries return 42 as a mock value
- **Generic queries**: Return success messages with affected row counts

All responses include `"mode": "mock"` to indicate test data.

## Troubleshooting

### If actions fail:
1. Check that the API key is set correctly: `some-long-random-string`
2. Verify the server URL: `https://supabase-mcp-fly.fly.dev`
3. Make sure authentication type is "Bearer"
4. Test individual endpoints with curl to verify they're working

### If OpenAPI import fails:
1. Make sure you're using the OpenAPI 3.1.1 version
2. Check for any JSON syntax errors in the schema
3. Try importing the schema in smaller chunks if needed

## Next Steps

Once your CustomGPT is working with mock data:

1. Test all major functionality to ensure the integration works
2. Verify the conversation flows are smooth
3. Test error handling with invalid queries
4. When ready for real data, we can switch back to the actual MCP server
5. Add more sophisticated prompts and capabilities as needed

## Current Status Summary

✅ **Mock server deployed and tested**  
✅ **All API endpoints working correctly**  
✅ **OpenAPI 3.1 schema ready for import**  
✅ **Authentication token confirmed**  
🎯 **Ready to create CustomGPT now!**

The mock server will allow you to build and test the complete CustomGPT functionality while we continue to investigate the actual MCP server issues in parallel.