# MotherBrainGPT CustomGPT Setup Guide

## 🎯 Objective
Create a CustomGPT named "MotherBrainGPT" that connects to your Supabase MCP server for database operations and management.

## 📋 Prerequisites
- ✅ Supabase MCP server running at: `https://supabase-mcp-fly.fly.dev`
- ✅ Bridge token: `some-long-random-string`  
- ✅ REST API endpoints available under `/api/*`
- ✅ OpenAPI schema created

## 🔧 Step 1: Create the CustomGPT

1. **Go to ChatGPT → "Explore GPTs" → "Create a GPT"**

2. **Configure Basic Settings:**
   - **Name**: `MotherBrainGPT`
   - **Description**: `Advanced Supabase database management assistant with full MCP integration. Handles SQL operations, table management, user administration, storage, and edge functions.`

3. **Instructions/Behavior:**
```
You are MotherBrainGPT, a sophisticated Supabase database management assistant with direct access to a production Supabase instance via MCP (Model Context Protocol).

## Core Capabilities:
- Execute SQL queries and database operations
- Manage tables, schemas, and data relationships  
- Handle user authentication and authorization
- Manage file storage and buckets
- Deploy and manage edge functions
- Monitor database performance and health

## Behavioral Guidelines:
1. Always verify operations before executing destructive commands (DELETE, DROP, etc.)
2. Use proper SQL best practices and security considerations
3. Provide clear explanations of database operations
4. Suggest optimizations and improvements when relevant
5. Handle errors gracefully and provide actionable solutions

## Available Tools:
Use the integrated Supabase API to:
- Query and manipulate data (SELECT, INSERT, UPDATE, DELETE)
- Create and manage database schemas
- Handle user management and policies
- Manage file storage operations
- Deploy serverless functions

Start each interaction by understanding the user's database requirements and suggest the most appropriate approach.
```

## 🔧 Step 2: Configure Actions (OpenAPI Integration)

1. **In the CustomGPT builder, go to "Actions" section**

2. **Import Schema:**
   - Click "Import from URL" or "Schema"
   - Copy the entire OpenAPI schema from `openapi-schema.yaml`
   - Paste it into the schema field

3. **Authentication Setup:**
   - **Authentication Type**: `Bearer Token`
   - **Token**: `some-long-random-string`

4. **Privacy Policy**: 
   - **URL**: `https://supabase-mcp-fly.fly.dev` (optional)

## 🔧 Step 3: Test the Integration

### Basic Connection Test:
```
"Check the server status and available capabilities"
```

### Database Operations Test:
```
"List all tables in the database"
```

### SQL Query Test:
```
"Show me the first 5 rows from any available table"
```

## 📊 Available API Endpoints

### Information Endpoints:
- **GET** `/api/capabilities` - Server info and capabilities
- **GET** `/api/status` - Current server status  
- **GET** `/api/tools` - List of available tools

### Database Operations:
- **POST** `/api/tools/run_sql` - Execute custom SQL
- **POST** `/api/tools/select_rows` - Query table data
- **POST** `/api/tools/insert_rows` - Insert new records
- **POST** `/api/tools/update_rows` - Update existing records  
- **POST** `/api/tools/delete_rows` - Delete records
- **POST** `/api/tools/list_tables` - List all tables
- **POST** `/api/tools/get_table_schema` - Get table structure
- **POST** `/api/tools/create_table` - Create new table

## 🔐 Security Configuration

**All requests require Bearer authentication:**
```
Authorization: Bearer some-long-random-string
```

The CustomGPT will automatically handle authentication using the configured bearer token.

## 🎮 Example Usage Scenarios

### 1. Database Exploration:
```
User: "What tables do I have and what's their structure?"
MotherBrainGPT: Uses /api/tools/list_tables and /api/tools/get_table_schema
```

### 2. Data Analysis:
```
User: "Show me user growth trends from the users table"  
MotherBrainGPT: Uses /api/tools/run_sql with appropriate query
```

### 3. Data Management:
```
User: "Create a new products table with name, price, and description fields"
MotherBrainGPT: Uses /api/tools/create_table with proper schema
```

### 4. Complex Operations:
```
User: "Find all inactive users and update their status"
MotherBrainGPT: Combines /api/tools/select_rows and /api/tools/update_rows
```

## 🚀 Advanced Features

### Real-time Monitoring:
- Server status checks via `/api/status`
- Connection health monitoring
- Performance metrics access

### Smart Query Building:  
- Automatic query optimization suggestions
- Schema-aware query construction
- Error handling and recovery

### Batch Operations:
- Multiple table operations
- Transaction-like behavior
- Bulk data processing

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Errors:**
   - Verify bearer token is correctly configured
   - Check server logs for authorization issues

2. **Tool Execution Failures:**
   - Check `/api/status` for server health
   - Verify MCP server is running properly

3. **Schema Validation:**
   - Ensure OpenAPI schema is properly imported
   - Check for any schema format errors

### Debug Commands:
```
"Check server status"           # Tests basic connectivity
"List available tools"          # Verifies API endpoints  
"Get server capabilities"       # Shows full server info
```

## 📈 Next Steps

After successful setup:

1. **Test core database operations**
2. **Verify authentication is working**  
3. **Create example workflows for common tasks**
4. **Set up monitoring and alerting**
5. **Document custom procedures and policies**

## 🔗 Resources

- **Production Server**: `https://supabase-mcp-fly.fly.dev`
- **API Documentation**: Available via `/api/capabilities` endpoint
- **OpenAPI Schema**: `openapi-schema.yaml` in project root
- **Server Health**: Monitor via `/api/status`

---

Your MotherBrainGPT is now ready to manage your Supabase database with advanced AI capabilities! 🚀