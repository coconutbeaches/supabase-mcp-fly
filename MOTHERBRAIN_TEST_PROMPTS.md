# MotherBrainGPT Test Prompts

## Overview
This document contains comprehensive test prompts for validating MotherBrainGPT functionality with your Coconut Beach Supabase database. Prompts are organized by category and complexity level.

**Total Prompts: 87**
- **Simple**: 26 prompts (Basic queries, straightforward analysis)
- **Medium**: 36 prompts (Multi-table queries, moderate complexity)
- **Complex**: 25 prompts (Advanced analysis, AI recommendations)

## Quick Start (Test These First)

### Basic Queries ⚡
```
"How many orders do we have today?"
"List our current menu items"
"Show me recent guest check-ins"
```

### Business Insights 📊
```
"What's our revenue for this week?"
"Which guests need attention?"
"Are there any system alerts I should know about?"
```

---

## 🔍 Database Analysis & Reporting

### Business Intelligence (Medium)
- "Show me today's restaurant orders and revenue. Break down by order status and highlight any patterns."
- "What are the top 5 most popular menu items this month? Include quantity sold and revenue generated."
- "Analyze our guest data - how many guests are currently checked in vs checking out today?"
- "Give me a summary of WhatsApp message activity in the last 24 hours. What are guests asking about most?"
- "Show me incomplete orders that might need attention from the kitchen staff."

### Data Quality (Medium-Complex)
- "Check our database for any data quality issues - missing emails, invalid phone numbers, or incomplete guest profiles."
- "What percentage of our guests have WhatsApp numbers? Show me the breakdown by guest status."
- "Find guests who have made multiple orders but haven't completed checkout. Are they repeat customers?"
- "Analyze our product pricing - which items have the highest profit margins?"
- "Show me any guests with duplicate entries or potential data conflicts."

---

## 🏨 Hotel Operations

### Guest Management (Simple-Medium)
- "List all guests checking in today. Include their room assignments and contact information."
- "Show me guests who have been here longer than their expected checkout date. Do we need to follow up?"
- "Find VIP guests or repeat visitors in our current guest list. How can we provide special service?"
- "Which guests have provided passport information vs those still pending? Create a follow-up list."
- "Show me guest families that might need larger tables or special dining arrangements."

### Arrival & Departure Management (Simple-Medium)
- "Create a comprehensive arrival report for today - who's coming, when, and from which ports."
- "Show me checkout activity for this week. Are there any patterns in departure timing?"
- "List guests who haven't completed their onboarding process. What steps are they missing?"
- "Find guests whose WhatsApp groups were created successfully vs those that failed."
- "Show me guests arriving by boat today - do we have their transport details?"

---

## 🍽️ Restaurant Operations

### Order Management (Simple-Medium)
- "Show me all active restaurant orders right now. What needs immediate kitchen attention?"
- "List orders that have been 'preparing' for more than 30 minutes. Are there any delays?"
- "Find orders with special dietary requests or instructions that need extra care."
- "Show me table assignments and current order status for the dining room."
- "What orders are ready for delivery? Create a delivery queue for staff."

### Menu & Inventory Insights (Medium-Complex)
- "Which menu items are selling well vs poorly? Should we adjust our offerings?"
- "Show me all product options and customizations. Are customers using these features?"
- "Analyze order patterns by time of day. When are we busiest?"
- "Find menu items that customers frequently modify. What does this tell us about preferences?"
- "Show me average order values and identify opportunities to increase revenue."

---

## 🤖 WhatsApp & Communication

### Message Analysis (Simple-Medium)
- "Show me recent WhatsApp conversations that might need human intervention."
- "What are the most common questions guests ask our chatbot? Are we handling them well?"
- "Find guests who have sent multiple messages without getting responses. Do we have service gaps?"
- "Analyze the FAQ database - which answers are most helpful vs need updates?"
- "Show me WhatsApp error logs. Are there technical issues affecting guest communication?"

### Bot Performance (Simple-Medium)
- "How many WhatsApp messages were handled automatically vs escalated to humans?"
- "Show me training examples from guest interactions. What can we learn?"
- "Find patterns in failed message deliveries. Are there connectivity issues?"
- "Analyze reaction data - are guests satisfied with bot responses?"
- "What templates are being used most? Should we create new ones?"

---

## 🛠️ Technical & Development

### Database Health (Simple-Complex)
- "Run a health check on our database. Are there any performance issues or warnings?"
- "Show me recent database migrations. Are all changes applied successfully?"
- "Check our backup systems and data integrity. Is everything properly maintained?"
- "Analyze database usage patterns. Do we need to optimize any queries?"
- "Find any database constraints or foreign key issues that need attention."

### System Monitoring (Simple)
- "Show me recent Edge Function deployments. Are they all running properly?"
- "Check our Supabase project status and any advisor recommendations."
- "Generate TypeScript types for our latest schema changes."
- "List all database extensions and their current status."
- "Show me project logs for any recent errors or unusual activity."

---

## 🎯 Complex Multi-Table Analysis

### Cross-System Reports (Complex)
- "Create a complete guest journey report - from booking to checkout including all orders and interactions."
- "Show me revenue correlation between room bookings and restaurant orders. Do room guests spend more on food?"
- "Analyze guest communication preferences vs their spending patterns."
- "Find operational bottlenecks - where do guests experience delays in service?"
- "Create a comprehensive daily operations dashboard with all key metrics."

### Predictive Insights (Complex)
- "Based on current bookings and historical data, predict tomorrow's restaurant capacity needs."
- "Identify guests likely to need special assistance based on their profiles and past interactions."
- "Show me seasonal patterns in orders, bookings, and guest preferences."
- "Find guests who might be interested in extending their stay based on their current behavior."
- "Analyze which marketing channels bring the highest-value guests."

---

## 🧪 Edge Cases & Error Handling

### Stress Tests (Medium-Complex)
- "Execute a complex multi-join query across all major tables and explain the results."
- "Try to find data inconsistencies between related tables (orders vs guests vs profiles)."
- "Run several queries simultaneously and handle any timeout or connection issues gracefully."
- "Test with malformed SQL and show proper error handling."
- "Query very large datasets and demonstrate pagination or result limiting."

### Boundary Conditions (Simple-Medium)
- "Show me data from exactly one year ago vs today. Has our business grown?"
- "Find the oldest and newest records in each major table."
- "Test queries with special characters, emojis, and international text."
- "Handle queries about data that doesn't exist gracefully."
- "Show how you deal with null values and missing data in reports."

---

## 🚀 Advanced Use Cases

### AI-Driven Recommendations (Complex)
- "Based on guest behavior and preferences, recommend menu items for tonight's special."
- "Suggest operational improvements based on current data patterns."
- "Identify guests who might benefit from personalized service offerings."
- "Recommend optimal table assignments based on guest profiles and party sizes."
- "Suggest timing for proactive guest communications based on their journey stage."

### Automation Triggers (Complex)
- "Find conditions that should trigger automatic guest communications."
- "Identify when staff should be alerted about operational issues."
- "Suggest rules for automatic upselling or cross-selling opportunities."
- "Determine when to escalate guest issues from bot to human staff."
- "Create triggers for maintenance alerts based on system usage patterns."

---

## 📝 Usage Instructions

### Testing Strategy
1. **Start with Quick Start** prompts to verify basic connectivity
2. **Progress through Simple** prompts to test core functionality
3. **Move to Medium** prompts for multi-table operations
4. **Challenge with Complex** prompts for advanced AI features

### Expected Behaviors
- ✅ **Immediate responses** with structured data
- ✅ **Error handling** for invalid queries
- ✅ **Real-time data** from your Supabase database
- ✅ **Business insights** with actionable recommendations

### Authentication
All prompts require the bridge server auth token:
```
Authorization: Bearer some-long-random-string
```

### API Endpoints
- **Base URL**: `https://supabase-mcp-fly.fly.dev`
- **Tools List**: `GET /api/tools`
- **Execute Tool**: `POST /api/tools/{toolName}`

---

## 🔧 Technical Details

### Available Tools (20)
- `execute_sql` - Run SQL queries
- `list_tables` - Schema introspection
- `search_docs` - Supabase documentation
- `list_extensions`, `list_migrations`, `apply_migration`
- `get_logs`, `get_advisors`, `get_project_url`, `get_anon_key`
- `generate_typescript_types`
- `list_edge_functions`, `get_edge_function`, `deploy_edge_function`
- `create_branch`, `list_branches`, `delete_branch`, `merge_branch`, `reset_branch`, `rebase_branch`

### Database Schema (35+ Tables)
Key tables include: `orders`, `products`, `categories`, `guests`, `profiles`, `whatsapp_logs`, `chatbot_faqs`, `incoming_guests`, and more.

---

**Happy Testing! 🌴🥥**

*Last updated: 2025-09-23*