const http = require("http");
const URL = require("url").URL;
const crypto = require("crypto");
const app = require("./backend/app");
const debug = require("debug")("node-angular");

// import http from "http";
// import { URL } from "url";
// import crypto from "crypto";

// PORT NORMALIZATION
// Normalize a port into a number, string, or false.
const normalizedPort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

var PORT = normalizedPort(process.env.PORT || 3000);

//need to set port on the express app for it to work with the http server
app.set('port', PORT);
const HOST = process.env.HOST || "127.0.0.1";

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute  
const RATE_LIMIT_MAX = 120; // max 120 requests per window per IP

const buckets = new Map(); // to track request counts per IP


function rateLimit(ip) {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || entry.resetAt <= now) {
    buckets.set(ip, { resetAt: now + RATE_LIMIT_WINDOW_MS, count: 1 });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  entry.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  return { ok: entry.count <= RATE_LIMIT_MAX, remaining, resetAt: entry.resetAt };
}

function send(res, statusCode, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  const baseHeaders = {
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    ...headers,
  };
  res.writeHead(statusCode, baseHeaders);
  res.end(payload);
}

function safeLogLine(req, statusCode) {
  // Avoid logging secrets; keep it minimal.
  const ip = req.socket.remoteAddress ?? "unknown";
  const method = req.method ?? "UNKNOWN";
  const url = req.url ?? "/";
  console.log(`${new Date().toISOString()} ${ip} ${method} ${url} ${statusCode}`);
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
  debug("Listening on " + bind);
};

const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};


// MANUAL HTTP SERVER
const server = http.createServer((req, res) => {
  try {
    // Parse URL safely
    const u = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // FIX 1: API routes are delegated to Express FIRST, before any method restrictions.
    // Previously the method allow-list ran before this block, which silently dropped
    // POST and OPTIONS (CORS preflight) requests before Express ever saw them.
    // Express handles its own method routing and CORS headers for /api/* routes.
    if (u.pathname.startsWith("/api")) {
      app(req, res);
      return;
    }

    // Method allow-list for non-API routes only.
    // FIX 2: This block now only runs for non-API paths (e.g. /, /health, /nonce).
    // Previously it ran for ALL routes including /api/*, blocking POST and OPTIONS entirely.
    const method = req.method || "GET";
    if (!["GET", "HEAD"].includes(method)) {
      // FIX 3: Now calls send() instead of raw res.writeHead/res.end so that
      // security headers (X-Frame-Options, CSP, etc.) are included in the response.
      send(res, 405, { error: "Method Not Allowed" }, { "Allow": "GET, HEAD" });
      safeLogLine(req, 405);
      return;
    }

    // Rate limit by IP
    const ip = req.socket.remoteAddress || "unknown";
    const rl = rateLimit(ip);
    res.setHeader("RateLimit-Limit", String(RATE_LIMIT_MAX));
    res.setHeader("RateLimit-Remaining", String(rl.remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(rl.resetAt / 1000)));
    if (!rl.ok) {
      // FIX 3 (continued): Uses send() so security headers are applied here too.
      send(res, 429, { error: "Too Many Requests" });
      safeLogLine(req, 429);
      return;
    }

    // Routes
    if (u.pathname === "/health") {
      // FIX 3 (continued): Uses send() instead of raw res.writeHead/res.end.
      send(res, 200, { ok: true });
      safeLogLine(req, 200);
      return;
    }

    if (u.pathname === "/") {
      // FIX 3 (continued): Uses send() instead of raw res.writeHead/res.end.
      send(res, 200, "Hello from a minimal Node.js HTTP server.\n");
      safeLogLine(req, 200);
      return;
    }

    if (u.pathname === "/nonce") {
      const nonce = crypto.randomBytes(16).toString("hex");
      // FIX 3 (continued): Uses send() instead of raw res.writeHead/res.end.
      send(res, 200, { nonce });
      safeLogLine(req, 200);
      return;
    }

    // FIX 3 (continued): 404 and 500 fallbacks use send() for consistent security headers.
    send(res, 404, { error: "Not Found" });
    safeLogLine(req, 404);
  } catch (err) {
    send(res, 500, { error: "Internal Server Error" });
    console.error(err);
    safeLogLine(req, 500);
  }
});

// ERROR LISTENER with EACCES & EADDRINUSE CASES
server.on("clientError", (_err, socket) => socket.end("HTTP/1.1 400 Bad Request\r\n\r\n"));

// LISTENING LISTENER
server.listen(PORT, HOST, () => {
  console.log(`Listening on http://${HOST}:${PORT}`);
});

server.on("error", onError);
server.on("listening", onListening);
