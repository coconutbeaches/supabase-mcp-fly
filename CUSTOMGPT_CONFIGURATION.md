# MotherBrainGPT CustomGPT Configuration Guide

## API Configuration
- **Base URL**: `https://supabase-mcp-fly.fly.dev`
- **Authentication**: Bearer Token
- **Auth Token**: `some-long-random-string`

## Available Tools & Correct Usage

### ✅ Working Tools (20 total)

#### 1. Database Query Tool
**Tool**: `execute_sql`
**Endpoint**: `POST /api/tools/execute_sql`
**Parameters**:
```json
{
  "arguments": {
    "query": "SQL query string"
  }
}
```

#### 2. Database Schema Tool  
**Tool**: `list_tables`
**Endpoint**: `POST /api/tools/list_tables`
**Parameters**:
```json
{
  "arguments": {}
}
```
⚠️ **Note**: Does NOT accept `schema` parameter

#### 3. Documentation Search
**Tool**: `search_docs`
**Endpoint**: `POST /api/tools/search_docs`
**Parameters**:
```json
{
  "arguments": {
    "graphql_query": "GraphQL query for Supabase docs"
  }
}
```

#### 4. Other Available Tools
- `list_extensions` - List database extensions
- `list_migrations` - Show migration history
- `apply_migration` - Apply new migration
- `get_logs` - Fetch project logs
- `get_advisors` - Security/performance advisories
- `get_project_url` - Get project API URL
- `get_anon_key` - Get anonymous API key
- `generate_typescript_types` - Generate TS types
- `list_edge_functions` - List Edge Functions
- `get_edge_function` - Get specific Edge Function
- `deploy_edge_function` - Deploy Edge Function
- `create_branch` - Create dev branch
- `list_branches` - List all branches
- `delete_branch` - Delete branch
- `merge_branch` - Merge branch to main
- `reset_branch` - Reset branch
- `rebase_branch` - Rebase branch

### ❌ Tools That Don't Exist
**Do NOT use these tools** (they will return "tool not found"):
- ❌ `get_table_schema` 
- ❌ `select_rows`
- ❌ `insert_row`
- ❌ `update_row` 
- ❌ `delete_row`

## Database Schema Overview

### Key Tables
1. **products** (65 rows) - Menu items with name, description, price
2. **categories** (6 rows) - Menu categories 
3. **orders** (4,434 rows) - Customer orders with status
4. **guests** (203 rows) - Current guests
5. **profiles** (59 rows) - User profiles
6. **whatsapp_logs** (1,494 rows) - WhatsApp message logs
7. **chatbot_faqs** (174 rows) - FAQ responses
8. **incoming_guests** (55 rows) - Arriving guests with passport data

### Common Query Patterns

#### Menu Items Query
```sql
SELECT p.name, p.description, p.price, c.name as category 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
ORDER BY c.sort_order, p.sort_order, p.name;
```

#### Today's Orders
```sql
SELECT id, customer_name, total_amount, order_status, created_at 
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE 
ORDER BY created_at DESC;
```

#### Current Guests
```sql
SELECT stay_id, first_name, table_number, created_at 
FROM guests 
ORDER BY created_at DESC;
```

#### Categories
```sql
SELECT name, description, sort_order 
FROM categories 
ORDER BY sort_order;
```

## Response Handling

### Successful Response Format
```json
{
  "success": true,
  "message": "Tool 'execute_sql' executed successfully",
  "toolName": "execute_sql", 
  "arguments": {...},
  "result": {
    "content": "SQL results in JSON format within untrusted-data tags"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Tool execution failed",
  "toolName": "tool_name",
  "error": "Error description"
}
```

## Sample Menu Items Data
Based on the actual database query, here's what the menu contains:

**Drinks Category:**
- Water (฿20)
- Soft Drinks (฿40) 
- Beer (฿70)
- Coffee (฿85)
- Tea (฿85)
- Coconut (฿100)
- Fruit Juice (฿100)
- Thai Tea (฿100)
- Coco Mocha (฿115) - Coffee w/ coconut milk, sweet milk, chocolate and whipped cream
- Fruit Shake (฿150)
- Wine Glass (฿150)
- Fresh Vegetable Juice (฿200)
- Piña Colada (฿250)
- Wine Bottle (฿700)
- Cinzano Prosecco DOC Bottle (฿1,200)

**Breakfast Category:**
- Yogurt (฿60)

## Best Practices for CustomGPT

1. **Always use `execute_sql`** for data retrieval
2. **Include proper error handling** for failed queries
3. **Parse JSON results** from the untrusted-data tags
4. **Use meaningful SQL queries** with JOINs for related data
5. **Limit results** with LIMIT clause for large datasets
6. **Sort results** appropriately (by sort_order, name, created_at, etc.)

## Authentication Headers Required
```
Authorization: Bearer some-long-random-string
Content-Type: application/json
```

## Common Issues & Solutions

**Issue**: "tool not found"
**Solution**: Use `execute_sql` instead of non-existent table operations

**Issue**: "ZodError: unrecognized_keys"
**Solution**: Don't pass `schema` parameter to `list_tables`

**Issue**: "MissingKwargsError: arguments"  
**Solution**: Always include `"arguments": {}` object, even if empty

**Issue**: Authentication errors
**Solution**: Ensure correct Bearer token in Authorization header