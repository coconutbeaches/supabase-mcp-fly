import express from "express";
import morgan from "morgan";
import { nanoid } from "nanoid";

/**
 * Mock MCP server for testing CustomGPT integration
 * Returns fake but realistic Supabase data without needing actual MCP server
 */

const PORT = process.env.PORT || 3000;
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN;

const app = express();
app.set("trust proxy", 1);

// CORS + preflight
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With, Cache-Control");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", "false");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (req.method === "HEAD") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-MCP-Protocol-Version", "2024-11-05");
    res.setHeader("X-MCP-Server-Name", "supabase-mcp-bridge");
    return res.sendStatus(200);
  }
  next();
});

// Optional bearer auth
if (BRIDGE_TOKEN) {
  app.use((req, res, next) => {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${BRIDGE_TOKEN}`) return res.sendStatus(401);
    next();
  });
}

// JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("tiny"));

// Mock handshake
function makeHandshakePayload(req) {
  const base = `${req.protocol}://${req.get("host")}`;
  return {
    protocolVersion: "2024-11-05",
    supportedProtocolVersions: ["2024-11-05"],
    capabilities: {
      tools: true,
      events: true
    },
    serverInfo: {
      name: "supabase-mcp-bridge",
      version: "1.0.0-mock",
      description: "Mock Supabase MCP Server - Test data for CustomGPT"
    },
    endpoints: {
      sse: "/mcp/sse",
      invoke: "/mcp/invoke",
      health: "/health"
    },
    absolute: {
      sse: `${base}/mcp/sse`,
      invoke: `${base}/mcp/invoke`,
      health: `${base}/health`
    },
    ok: true,
    ready: true
  };
}

function handshakeGet(req, res) {
  res.set({
    "Content-Type": "application/json; charset=utf-8",
    "X-MCP-Protocol-Version": "2024-11-05",
    "X-MCP-Server-Name": "supabase-mcp-bridge"
  });
  res.json(makeHandshakePayload(req));
}

// Handshake endpoints
app.get("/", handshakeGet);
app.get("/handshake", handshakeGet);
app.get("/mcp/handshake", handshakeGet);
app.get("/.well-known/mcp", handshakeGet);
app.post("/mcp/handshake", handshakeGet);

// Health endpoint
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// Mock data generators
const mockTables = ["users", "posts", "comments", "products", "orders", "categories"];
const mockUsers = [
  { id: 1, email: "john@example.com", name: "John Doe", active: true, created_at: "2024-01-15T10:30:00Z" },
  { id: 2, email: "jane@example.com", name: "Jane Smith", active: true, created_at: "2024-02-20T14:15:00Z" },
  { id: 3, email: "bob@example.com", name: "Bob Wilson", active: false, created_at: "2024-03-10T09:45:00Z" }
];

// CustomGPT API endpoints with mock responses
app.get("/api/capabilities", (req, res) => {
  res.json({
    server: "supabase-mcp-bridge",
    version: "1.0.0-mock",
    description: "Mock Supabase MCP Server - Test data for CustomGPT",
    protocol: "MCP 2024-11-05",
    capabilities: {
      tools: true,
      events: true
    },
    endpoints: {
      tools: "/api/tools",
      execute: "/api/tools/{toolName}",
      status: "/api/status"
    }
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    mcpServer: "mock-active",
    mode: "testing",
    sseConnections: 0
  });
});

app.get("/api/tools", async (req, res) => {
  res.json({
    message: "Tools list (mock data)",
    tools: [
      "run_sql", "select_rows", "insert_rows", "update_rows", "delete_rows",
      "list_tables", "get_table_schema", "create_table"
    ],
    mode: "mock"
  });
});

// Mock SQL execution
app.post("/api/tools/run_sql", async (req, res) => {
  const { arguments: { query } } = req.body;
  
  // Simple mock responses based on query patterns
  let mockResult = [];
  const queryLower = query?.toLowerCase() || "";
  
  if (queryLower.includes("select") && queryLower.includes("users")) {
    mockResult = mockUsers;
  } else if (queryLower.includes("select") && queryLower.includes("tables")) {
    mockResult = mockTables.map(name => ({ table_name: name }));
  } else if (queryLower.includes("select 1")) {
    mockResult = [{ test: 1 }];
  } else if (queryLower.includes("count")) {
    mockResult = [{ count: 42 }];
  } else {
    mockResult = [{ result: "success", affected_rows: 1 }];
  }
  
  res.json({
    success: true,
    query,
    data: mockResult,
    mode: "mock",
    message: "Mock SQL execution completed"
  });
});

// Mock table operations
app.post("/api/tools/list_tables", async (req, res) => {
  res.json({
    success: true,
    tables: mockTables.map(name => ({
      name,
      schema: "public",
      type: "table"
    })),
    mode: "mock"
  });
});

app.post("/api/tools/select_rows", async (req, res) => {
  const { arguments: { table, columns, where, limit } } = req.body;
  
  let data = [];
  if (table === "users") {
    data = mockUsers.slice(0, limit || 10);
  } else {
    data = [{ id: 1, name: `Sample ${table}`, created_at: new Date().toISOString() }];
  }
  
  res.json({
    success: true,
    table,
    data,
    count: data.length,
    mode: "mock"
  });
});

app.post("/api/tools/insert_rows", async (req, res) => {
  const { arguments: { table, rows } } = req.body;
  
  res.json({
    success: true,
    table,
    inserted: rows?.length || 1,
    mode: "mock",
    message: `Mock insert into ${table} completed`
  });
});

app.post("/api/tools/get_table_schema", async (req, res) => {
  const { arguments: { table } } = req.body;
  
  const mockSchema = {
    users: [
      { column: "id", type: "integer", nullable: false, primary_key: true },
      { column: "email", type: "text", nullable: false },
      { column: "name", type: "text", nullable: true },
      { column: "active", type: "boolean", nullable: false, default: true },
      { column: "created_at", type: "timestamp", nullable: false }
    ]
  };
  
  res.json({
    success: true,
    table,
    columns: mockSchema[table] || [
      { column: "id", type: "integer", nullable: false, primary_key: true },
      { column: "name", type: "text", nullable: true }
    ],
    mode: "mock"
  });
});

// Catch-all for other tools
app.post("/api/tools/:toolName", async (req, res) => {
  const { toolName } = req.params;
  const { arguments: toolArgs } = req.body;
  
  res.json({
    success: true,
    tool: toolName,
    arguments: toolArgs,
    result: "Mock operation completed",
    mode: "mock"
  });
});

// Favicon handlers
app.get("/favicon.ico", (_req, res) => res.sendStatus(204));
app.get("/favicon.png", (_req, res) => res.sendStatus(204));
app.get("/favicon.svg", (_req, res) => res.sendStatus(204));

console.log(`🧪 Mock MCP HTTP bridge listening on :${PORT}`);
console.log("📋 Mock endpoints ready for CustomGPT testing:");
console.log("   - GET  /api/capabilities");
console.log("   - GET  /api/status");  
console.log("   - GET  /api/tools");
console.log("   - POST /api/tools/run_sql");
console.log("   - POST /api/tools/select_rows");
console.log("   - And more...");

app.listen(PORT);