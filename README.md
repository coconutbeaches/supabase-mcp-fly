# MotherBrainGPT Supabase MCP Bridge

A production-ready HTTP bridge server that connects CustomGPT (MotherBrainGPT) to Supabase via the Model Context Protocol (MCP), enabling real-time database operations for Coconut Beach Hotel & Restaurant in Koh Phangan, Thailand.

## 🏗️ Architecture

```
CustomGPT (MotherBrainGPT) → HTTP REST API → MCP Bridge Server → Supabase MCP Server → PostgreSQL Database
```

- **Frontend**: CustomGPT with hospitality-focused instructions
- **Bridge**: Node.js Express server with JSON-RPC translation
- **Backend**: Supabase MCP Server for database operations
- **Deployment**: Fly.io with Docker containerization

## ✅ Features

### 🔄 Real-time Database Access
- Execute SQL queries via REST API
- List database tables and schema
- Search Supabase documentation
- Get database advisors and logs
- Manage Edge Functions and branches

### 🎯 Business Intelligence
- Hotel guest management and tracking
- Restaurant menu and order management  
- WhatsApp communication analysis
- Revenue and operational analytics
- Guest experience optimization

### 🛡️ Production Ready
- Bearer token authentication
- Request/response capture system
- Error handling and timeouts
- CORS support for web integration
- Comprehensive logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Fly.io account (for deployment)

### Local Development
```bash
# Clone and install
git clone https://github.com/yourusername/supabase-mcp-fly.git
cd supabase-mcp-fly
npm install

# Set environment variables
export SUPABASE_ACCESS_TOKEN="your-token"
export PROJECT_REF="your-project-ref"
export BRIDGE_TOKEN="your-auth-token"
export SUPABASE_SECRET_KEYS='{"edge_admin":"sb_secret_..."}'

# Start server
npm start
```

### Deploy to Fly.io
```bash
# Set secrets
fly secrets set SUPABASE_ACCESS_TOKEN="your-token"
fly secrets set PROJECT_REF="your-project-ref"  
fly secrets set BRIDGE_TOKEN="your-auth-token"
fly secrets set SUPABASE_SECRET_KEYS='{"edge_admin":"sb_secret_..."}'

# Deploy
fly deploy
```

`SUPABASE_SECRET_KEYS.edge_admin` is the admin key used by the bridge's custom
write endpoint. Do not use the legacy `SUPABASE_SERVICE_ROLE_KEY` variable for
new deploys.

## 📡 API Endpoints

### Core Tools
- `GET /api/tools` - List available MCP tools
- `POST /api/tools/execute_sql` - Execute SQL queries
- `POST /api/tools/list_tables` - Get database schema
- `POST /api/tools/search_docs` - Search Supabase docs

### Authentication
All endpoints require Bearer token:
```bash
curl -H "Authorization: Bearer your-auth-token" \
  https://your-app.fly.dev/api/tools
```

## 🤖 CustomGPT Integration

### Configuration
1. **Base URL**: `https://your-app.fly.dev`
2. **Auth**: Bearer Token
3. **OpenAPI**: Use `openapi-customgpt.yaml`
4. **Instructions**: Copy from `MOTHERBRAIN_INSTRUCTIONS_SHORT.txt`

### Sample Queries
```sql
-- Menu items with categories
SELECT p.name, p.description, p.price, c.name as category 
FROM products p LEFT JOIN categories c ON p.category_id = c.id 
ORDER BY c.sort_order, p.name;

-- Today's orders
SELECT customer_name, total_amount, order_status 
FROM orders WHERE DATE(created_at) = CURRENT_DATE;

-- Current guests
SELECT stay_id, first_name, table_number 
FROM guests ORDER BY created_at DESC;
```

## 📊 Database Schema

### Key Tables
- **products** (65 items) - Restaurant menu with pricing
- **orders** (4,434 records) - Customer order tracking
- **guests** (203 active) - Hotel guest management
- **whatsapp_logs** (1,494 messages) - Communication logs
- **incoming_guests** (55 pending) - Arrival management

## 📋 Documentation

- `CUSTOMGPT_CONFIGURATION.md` - Complete setup guide
- `MOTHERBRAIN_TEST_PROMPTS.md` - 87 test scenarios
- `openapi-customgpt.yaml` - CustomGPT-optimized API spec
- `motherbrain-test-prompts.csv` - Structured test cases

## 🛠️ Development

### Project Structure
```
├── server.js                          # Main bridge server
├── openapi-customgpt.yaml             # API specification
├── MOTHERBRAIN_INSTRUCTIONS.md        # CustomGPT instructions
├── CUSTOMGPT_CONFIGURATION.md         # Setup documentation
├── motherbrain-test-prompts.csv       # Test scenarios
└── fly.toml                           # Deployment config
```

### Key Components
- **Response Capture**: Matches JSON-RPC requests/responses by ID
- **Request Routing**: Translates HTTP REST to MCP protocol
- **Error Handling**: Comprehensive error messages and fallbacks
- **Authentication**: Bearer token validation middleware

## 🧪 Testing

Run test prompts from the CSV file:
```bash
# Basic functionality
"List our current menu items"
"Show me today's orders"
"How many guests are currently checked in?"

# Business intelligence  
"What are our top 5 most popular menu items?"
"Show me revenue breakdown by category"
"Which guests need follow-up?"
```

## 🔧 Troubleshooting

### Common Issues
- **"tool not found"** → Use `execute_sql` for all database queries
- **"ZodError"** → Don't pass `schema` parameter to `list_tables`  
- **"MissingKwargsError"** → Include `"arguments": {}` in request body
- **Authentication errors** → Check Bearer token format

### Debug Mode
Set `DEBUG_MCP=1` environment variable for verbose logging.

## 🌟 Success Metrics

- ✅ **Zero tool errors** - Perfect API integration
- ✅ **Real-time data** - Live database connectivity
- ✅ **Business context** - Hospitality-focused responses
- ✅ **Professional output** - Thai Baht formatting, categorization
- ✅ **Operational insights** - Actionable business intelligence

## 📈 Live Performance

MotherBrainGPT successfully serves Coconut Beach operations:
- **42 database tables** accessible via natural language
- **Menu management** with real-time pricing (฿20-1,200 range)
- **Order tracking** with status monitoring
- **Guest services** with arrival/departure management
- **Communication analytics** via WhatsApp integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🏖️ About Coconut Beach

Boutique hotel and restaurant in Koh Phangan, Thailand, leveraging AI and real-time data to deliver exceptional hospitality experiences.

---

**Built with ❤️ for the hospitality industry** 🌴🥥
