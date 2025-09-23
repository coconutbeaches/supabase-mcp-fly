import express from "express";
import morgan from "morgan";
import { spawn } from "node:child_process";
import { nanoid } from "nanoid";
import getRawBody from "raw-body";
import rateLimit from "express-rate-limit";

/**
 * Minimal HTTP/SSE bridge for an stdio-only MCP server.
 * - Outbound: MCP JSON lines from child stdout => SSE to clients.
 * - Inbound:  JSON POST bodies from clients => write line to child stdin.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 0) Config via env
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const READ_ONLY = process.env.READ_ONLY === "false" ? false : true;
const DEBUG_MCP = process.env.DEBUG_MCP === "1";
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}
if (!PROJECT_REF) {
  console.error("Missing PROJECT_REF");
  process.exit(1);
}

// Debug logger
const debugLog = (prefix, data) => {
  if (DEBUG_MCP) console.log(`[${prefix}]`, data);
};

// ─────────────────────────────────────────────────────────────────────────────
// 1) Express app (create FIRST, then add middleware/routes)
// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// Trust exactly 1 hop (Fly edge)
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
if (process.env.BRIDGE_TOKEN) {
  app.use((req, res, next) => {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${process.env.BRIDGE_TOKEN}`) return res.sendStatus(401);
    next();
  });
}

// --- Handshake: GET returns JSON; all other methods -> JSON-RPC error
function sendJsonRpcError(res, code = -32601, message = "Method not found", id = null) {
  res.status(200).json({ jsonrpc: "2.0", id, error: { code, message } });
}

function makeHandshakePayload(req) {
  const base = `${req.protocol}://${req.get("host")}`;
  return {
    protocolVersion: "2024-11-05",
    supportedProtocolVersions: ["2024-11-05"],
    capabilities: { tools: true, events: true },
    serverInfo: {
      name: "supabase-mcp-bridge",
      version: "1.0.0",
      description: "Supabase MCP Server - Database operations and management"
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

// Support both discovery paths
app.get("/", handshakeGet);
app.get("/handshake", handshakeGet);
app.get("/mcp/handshake", handshakeGet);
app.get("/.well-known/mcp", handshakeGet);

// Special handling for POST /mcp/handshake - return same JSON as GET
app.post("/mcp/handshake", handshakeGet);

["/", "/handshake", "/.well-known/mcp"].forEach((p) => {
  app.post(p, (req, res) => sendJsonRpcError(res));
  app.put(p, (req, res) => sendJsonRpcError(res));
  app.patch(p, (req, res) => sendJsonRpcError(res));
  app.delete(p, (req, res) => sendJsonRpcError(res));
});

app.get("/favicon.ico", (_req, res) => res.sendStatus(204));
app.get("/favicon.png", (_req, res) => res.sendStatus(204));
app.get("/favicon.svg", (_req, res) => res.sendStatus(204));

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.get("/mcp", (_req, res) => res.json({ ok: true, where: "mcp" }));

app.post("/mcp/sse", (_req, res) => sendJsonRpcError(res));
app.put("/mcp/sse", (_req, res) => sendJsonRpcError(res));
app.patch("/mcp/sse", (_req, res) => sendJsonRpcError(res));
app.delete("/mcp/sse", (_req, res) => sendJsonRpcError(res));

app.get("/mcp/test/tools", (_req, res) => {
  const frame = {
    jsonrpc: "2.0",
    id: String(Date.now()),
    method: "tools/list",
    params: {}
  };
  child.stdin.write(JSON.stringify(frame) + "\n");
  res.json({ sent: frame, hint: "Check SSE stream for response" });
});

// ─────────────────────────────────────────────────────────────────────────────
// CustomGPT REST API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// Add body parsing middleware for API routes
app.use('/api', express.json({ limit: '10mb' }));
app.use('/api', express.urlencoded({ extended: true }));

// Get list of available tools
app.get("/api/tools", async (req, res) => {
  try {
    const mcpRequest = {
      jsonrpc: "2.0",
      id: `tools-${Date.now()}`,
      method: "tools/list",
      params: {}
    };
    
    // Send to MCP server
    const line = JSON.stringify(mcpRequest);
    child.stdin.write(line + "\n");
    
    // Try to capture response, with fallback to cached tool list
    try {
      const response = await captureResponse(mcpRequest.id, null, 5000);
      
      if (response.timeout) {
        // Return cached tool list if timeout
        res.json({ 
          message: "Tools list (cached - MCP response timeout)", 
          tools: [
            "search_docs", "list_tables", "list_extensions", "list_migrations",
            "apply_migration", "execute_sql", "get_logs", "get_advisors",
            "get_project_url", "get_anon_key", "generate_typescript_types",
            "list_edge_functions", "get_edge_function", "deploy_edge_function",
            "create_branch", "list_branches", "delete_branch", "merge_branch",
            "reset_branch", "rebase_branch"
          ],
          hint: "Response timeout - check SSE stream"
        });
      } else if (response.result && response.result.tools) {
        // Return actual tool list from MCP server
        const toolNames = response.result.tools.map(tool => tool.name);
        res.json({ 
          message: "Tools list from MCP server", 
          tools: toolNames,
          count: toolNames.length
        });
      } else {
        // Return cached if MCP response was invalid
        res.json({ 
          message: "Tools list (cached - invalid MCP response)", 
          tools: [
            "search_docs", "list_tables", "list_extensions", "list_migrations",
            "apply_migration", "execute_sql", "get_logs", "get_advisors",
            "get_project_url", "get_anon_key", "generate_typescript_types",
            "list_edge_functions", "get_edge_function", "deploy_edge_function",
            "create_branch", "list_branches", "delete_branch", "merge_branch",
            "reset_branch", "rebase_branch"
          ]
        });
      }
    } catch (captureError) {
      res.json({ 
        message: "Tools list (cached - capture failed)", 
        tools: [
          "search_docs", "list_tables", "list_extensions", "list_migrations",
          "apply_migration", "execute_sql", "get_logs", "get_advisors",
          "get_project_url", "get_anon_key", "generate_typescript_types",
          "list_edge_functions", "get_edge_function", "deploy_edge_function",
          "create_branch", "list_branches", "delete_branch", "merge_branch",
          "reset_branch", "rebase_branch"
        ]
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute a specific tool
app.post("/api/tools/:toolName", async (req, res) => {
  try {
    const { toolName } = req.params;
    const { arguments: toolArgs } = req.body;
    
    const mcpRequest = {
      jsonrpc: "2.0",
      id: `tool-${toolName}-${Date.now()}`,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: toolArgs || {}
      }
    };
    
    // Send to MCP server
    const line = JSON.stringify(mcpRequest);
    child.stdin.write(line + "\n");
    
    // Try to capture the response directly
    try {
      const response = await captureResponse(mcpRequest.id, null, 8000);
      
      if (response.timeout) {
        res.json({ 
          success: false,
          message: `Tool '${toolName}' execution timeout`,
          toolName,
          arguments: toolArgs,
          hint: "Response timeout - check SSE stream",
          requestId: mcpRequest.id
        });
      } else if (response.result) {
        // Extract the actual result content
        let resultData = response.result;
        
        // Handle different response formats
        if (response.result.content && Array.isArray(response.result.content)) {
          // Extract text from content array
          const textContent = response.result.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n');
          
          // Try to parse SQL results from the text content
          if (textContent.includes('untrusted-data-')) {
            const match = textContent.match(/<untrusted-data-[^>]+>([^<]+)<\/untrusted-data-[^>]+>/);
            if (match) {
              try {
                const sqlResult = JSON.parse(match[1]);
                return res.json({
                  success: true,
                  message: `Tool '${toolName}' executed successfully`,
                  toolName,
                  arguments: toolArgs,
                  data: sqlResult,
                  raw_response: textContent
                });
              } catch (parseError) {
                // Fall through to generic handling
              }
            }
          }
          
          resultData = { content: textContent };
        }
        
        res.json({ 
          success: true,
          message: `Tool '${toolName}' executed successfully`,
          toolName,
          arguments: toolArgs,
          result: resultData
        });
      } else if (response.result && response.result.isError) {
        // Handle MCP errors
        const errorContent = response.result.content
          ?.find(item => item.type === 'text')
          ?.text || 'Unknown error';
          
        let errorMessage = 'Tool execution failed';
        try {
          const errorData = JSON.parse(errorContent);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          errorMessage = errorContent;
        }
        
        res.json({ 
          success: false,
          message: `Tool '${toolName}' failed: ${errorMessage}`,
          toolName,
          arguments: toolArgs,
          error: errorContent
        });
      } else {
        // Generic response
        res.json({ 
          success: true,
          message: `Tool '${toolName}' executed`,
          toolName,
          arguments: toolArgs,
          result: response.result || response
        });
      }
    } catch (captureError) {
      res.json({ 
        success: false,
        message: `Tool '${toolName}' execution failed to capture response`,
        toolName,
        arguments: toolArgs,
        hint: "Check SSE stream for response",
        error: captureError.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server capabilities 
app.get("/api/capabilities", (req, res) => {
  res.json({
    server: "supabase-mcp-bridge",
    version: "1.0.0",
    description: "Supabase MCP Server - Database operations and management",
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

// Server status
app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    mcpServer: "active",
    sseConnections: sseClients.size
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Response capture system for CustomGPT integration
// ─────────────────────────────────────────────────────────────────────────────

// Store pending requests to capture responses
const pendingRequests = new Map();

// Helper to capture MCP response for a request
function captureResponse(requestId, response, timeout = 10000) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      resolve({ timeout: true, hint: "Response timeout - check SSE stream" });
    }, timeout);
    
    pendingRequests.set(requestId, { resolve, timeoutId });
  });
}

// Process captured response when MCP responds
function processCapturedResponse(data) {
  try {
    const response = JSON.parse(data);
    if (response.id && pendingRequests.has(response.id)) {
      const { resolve, timeoutId } = pendingRequests.get(response.id);
      clearTimeout(timeoutId);
      pendingRequests.delete(response.id);
      resolve(response);
    }
  } catch (e) {
    debugLog("CAPTURE", `Failed to parse response: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP process and communication
// ─────────────────────────────────────────────────────────────────────────────
const args = [
  "-y",
  "@supabase/mcp-server-supabase",
  ...(READ_ONLY ? ["--read-only"] : []),
  `--project-ref=${PROJECT_REF}`
];

console.log("Spawning MCP server: npx " + args.join(" "));
const child = spawn("npx", args, {
  env: { ...process.env, SUPABASE_ACCESS_TOKEN },
  stdio: ["pipe", "pipe", "pipe"]
});

child.on("exit", (code, signal) => {
  console.error(`MCP child exited code=${code} signal=${signal}`);
  process.exit(code || 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5) SSE setup
// ─────────────────────────────────────────────────────────────────────────────
const sseClients = new Map();
function broadcast(line) {
  for (const [, res] of sseClients) res.write(`data: ${line}\n\n`);
}

let stdoutBuf = "";
child.stdout.setEncoding("utf8");
child.stdout.on("data", chunk => {
  stdoutBuf += chunk;
  let idx;
  while ((idx = stdoutBuf.indexOf("\n")) >= 0) {
    const line = stdoutBuf.slice(0, idx);
    stdoutBuf = stdoutBuf.slice(idx + 1);
    if (line.trim()) {
      debugLog("MCP OUT", line);
      broadcast(line);
      // Also capture for direct API responses
      processCapturedResponse(line);
    }
  }
});

child.stderr.setEncoding("utf8");
child.stderr.on("data", data => console.error("[MCP STDERR]", data.trim()));

app.get("/mcp/sse", (req, res) => {
  const id = nanoid();
  req.socket.setTimeout(0);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Keep-Alive": "timeout=120"
  });
  res.flushHeaders();

  sseClients.set(id, res);
  console.log(`SSE connected: ${id}; total=${sseClients.size}`);

  res.write(`retry: 3000\n\n`);
  res.write(`event: ready\ndata: {"ok":true}\n\n`);

  const iv = setInterval(() => {
    res.write(`: keep-alive ${Date.now()}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(iv);
    sseClients.delete(id);
    console.log(`SSE closed: ${id}; total=${sseClients.size}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6) JSON-RPC Invoke
// ─────────────────────────────────────────────────────────────────────────────
app.post("/mcp/invoke", async (req, res) => {
  try {
    const raw = await getRawBody(req, { encoding: "utf8", length: req.headers["content-length"] });
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      return res.status(200).json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    }

    if (obj.jsonrpc !== "2.0" || typeof obj.id === "undefined") {
      return res.status(200).json({ jsonrpc: "2.0", id: obj.id || null, error: { code: -32600, message: "Invalid Request" } });
    }

    debugLog("MCP IN", obj);
    child.stdin.write(JSON.stringify(obj) + "\n");
    res.status(202).json({ accepted: true });
  } catch (e) {
    console.error("invoke error", e);
    res.status(200).json({ jsonrpc: "2.0", id: null, error: { code: -32603, message: "Internal error" } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7) Start Server
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`MCP HTTP bridge listening on :${PORT}`);
  console.log(`POST SQL queries to /sql`);
  console.log(`SSE:   GET  http://localhost:${PORT}/mcp/sse`);
  console.log(`Invoke: POST http://localhost:${PORT}/mcp/invoke`);
});
