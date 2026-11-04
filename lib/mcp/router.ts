// lib/mcp/router.ts
// Shared JSON-RPC 2.0 / MCP protocol router plus the Streamable HTTP rules
// (rate limit, version header, 202 for notifications, 405 for SSE GETs). Both
// entry points (Next.js route and the standalone Alpic server) only adapt
// their request/response objects to createMcpHttpHandler and getReply.
import {
  LATEST_PROTOCOL_VERSION,
  PROFILE,
  SERVER_INSTRUCTIONS,
  SERVER_NAME,
  SERVER_TITLE,
  SERVER_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
} from "./definitions";
import {
  McpError,
  JSONRPC_INTERNAL_ERROR,
  JSONRPC_INVALID_PARAMS,
  JSONRPC_INVALID_REQUEST,
  JSONRPC_METHOD_NOT_FOUND,
  JSONRPC_PARSE_ERROR,
  JSONRPC_SERVER_ERROR,
} from "./errors";
import { checkAgentRateLimit } from "../rateLimit";
import type { ToolCaller } from "./tools";
import type {
  McpContent,
  McpPrompt,
  McpPromptResult,
  McpRequestContext,
  McpResource,
  McpResourceTemplate,
  McpResponse,
  McpTool,
} from "./types";

export interface McpHandlers {
  listTools(): McpTool[];
  callTool: ToolCaller;
  listResources(): McpResource[];
  listResourceTemplates(): McpResourceTemplate[];
  readResource(uri: string): McpContent[];
  listPrompts(): McpPrompt[];
  getPrompt(name: string, args: Record<string, unknown>): McpPromptResult;
}

type RequestId = string | number | null;

/** Request bodies above this are refused with 413 (a 20k-char JD fits with room to spare). */
export const MAX_BODY_BYTES = 128 * 1024;

export function isSupportedVersion(version: string): boolean {
  return (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidId(value: unknown): value is RequestId {
  return value === null || typeof value === "string" || typeof value === "number";
}

function errorResponse(id: RequestId, code: number, message: string): McpResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

const ok = (id: RequestId, result: unknown): McpResponse => ({ jsonrpc: "2.0", id, result });

/** Builds the JSON-RPC response for a parse failure (the transport owns body parsing). */
export function parseErrorResponse(): McpResponse {
  return errorResponse(null, JSONRPC_PARSE_ERROR, "Parse error: invalid JSON");
}

function initializeResult(params: Record<string, unknown> | undefined) {
  const requested = params?.protocolVersion;
  return {
    protocolVersion: typeof requested === "string" && isSupportedVersion(requested) ? requested : LATEST_PROTOCOL_VERSION,
    capabilities: {
      tools: { listChanged: false },
      resources: { listChanged: false, subscribe: false },
      prompts: { listChanged: false },
    },
    serverInfo: { name: SERVER_NAME, title: SERVER_TITLE, version: SERVER_VERSION, websiteUrl: PROFILE.portfolio },
    instructions: SERVER_INSTRUCTIONS,
  };
}

function stringParam(params: Record<string, unknown> | undefined, key: string, method: string): string {
  const value = params?.[key];
  if (typeof value !== "string") throw new McpError(JSONRPC_INVALID_PARAMS, `${method} requires params.${key} (string)`);
  return value;
}

function objectParam(params: Record<string, unknown> | undefined, key: string, method: string): Record<string, unknown> {
  const value = params?.[key] ?? {};
  if (!isPlainObject(value)) throw new McpError(JSONRPC_INVALID_PARAMS, `${method} params.${key} must be an object`);
  return value;
}

async function route(
  handlers: McpHandlers,
  method: string,
  params: Record<string, unknown> | undefined,
  ctx: McpRequestContext
): Promise<unknown> {
  switch (method) {
    case "initialize":
      return initializeResult(params);
    case "ping":
      return {};
    case "tools/list":
      return { tools: handlers.listTools() };
    case "tools/call":
      return handlers.callTool(stringParam(params, "name", method), objectParam(params, "arguments", method), ctx);
    case "resources/list":
      return { resources: handlers.listResources() };
    case "resources/templates/list":
      return { resourceTemplates: handlers.listResourceTemplates() };
    case "resources/read":
      return { contents: handlers.readResource(stringParam(params, "uri", method)) };
    case "prompts/list":
      return { prompts: handlers.listPrompts() };
    case "prompts/get":
      return handlers.getPrompt(stringParam(params, "name", method), objectParam(params, "arguments", method));
    default:
      throw new McpError(JSONRPC_METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
}

/**
 * Returns a handler that resolves to the JSON-RPC response, or `null` when
 * the message was a notification (no `id`): transports then reply HTTP 202
 * with an empty body, per the MCP Streamable HTTP spec.
 */
export function createMcpHandler(handlers: McpHandlers) {
  return async function handleMcpRequest(body: unknown, ctx: McpRequestContext): Promise<McpResponse | null> {
    if (!isPlainObject(body)) {
      return errorResponse(null, JSONRPC_INVALID_REQUEST, "Invalid Request: expected a single JSON-RPC object");
    }

    const isNotification = !("id" in body);
    const id: RequestId = isValidId(body.id) ? body.id : null;
    const method = body.method;
    if (body.jsonrpc !== "2.0" || typeof method !== "string" || (!isNotification && !isValidId(body.id))) {
      return errorResponse(id, JSONRPC_INVALID_REQUEST, "Invalid Request");
    }
    if (body.params !== undefined && !isPlainObject(body.params)) {
      return isNotification ? null : errorResponse(id, JSONRPC_INVALID_PARAMS, "params must be an object");
    }
    // Notifications (e.g. notifications/initialized) never get a response body.
    if (isNotification) return null;

    try {
      return ok(id, await route(handlers, method, isPlainObject(body.params) ? body.params : undefined, ctx));
    } catch (err) {
      if (err instanceof McpError) return errorResponse(id, err.code, err.message);
      console.error(`[mcp] ${method} failed:`, err);
      return errorResponse(id, JSONRPC_INTERNAL_ERROR, "Internal error");
    }
  };
}

/** A transport-neutral HTTP reply: `body` null means an empty body. */
export interface HttpReply {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

export interface HttpRequestMeta {
  ip: string;
  /** The MCP-Protocol-Version request header, if sent. */
  protocolVersion: string | null;
}

export function tooLargeReply(): HttpReply {
  return { status: 413, body: errorResponse(null, JSONRPC_INVALID_REQUEST, `Request body too large (max ${MAX_BODY_BYTES} bytes)`) };
}

/** POST handling: rate limit, JSON parse, protocol-version header check, then the JSON-RPC router. */
export function createMcpHttpHandler(handlers: McpHandlers) {
  const handle = createMcpHandler(handlers);
  return async function handleHttpPost(raw: string, meta: HttpRequestMeta): Promise<HttpReply> {
    const limited = checkAgentRateLimit(meta.ip, "mcp");
    if (limited) {
      return {
        status: 429,
        body: errorResponse(null, JSONRPC_SERVER_ERROR, limited.error),
        headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
      };
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return { status: 400, body: parseErrorResponse() };
    }

    // initialize negotiates in-band; every later request must carry a version we speak.
    const isInitialize = isPlainObject(body) && body.method === "initialize";
    if (meta.protocolVersion && !isInitialize && !isSupportedVersion(meta.protocolVersion)) {
      const id = isPlainObject(body) && isValidId(body.id) ? body.id : null;
      return {
        status: 400,
        body: errorResponse(
          id,
          JSONRPC_INVALID_REQUEST,
          `Unsupported MCP-Protocol-Version "${meta.protocolVersion}". Supported: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}`
        ),
      };
    }

    const response = await handle(body, { ip: meta.ip });
    return response === null ? { status: 202, body: null } : { status: 200, body: response };
  };
}

/** Discovery manifest served on plain GETs; generated from the live definitions. */
export function serverManifest(handlers: McpHandlers, endpoint: string) {
  return {
    name: SERVER_NAME,
    title: SERVER_TITLE,
    version: SERVER_VERSION,
    protocolVersion: LATEST_PROTOCOL_VERSION,
    supportedProtocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
    transport: "streamable-http (JSON responses; no server-initiated SSE)",
    endpoint,
    tools: handlers.listTools().map((t) => t.name),
    resources: handlers.listResources().map((r) => r.uri),
    resourceTemplates: handlers.listResourceTemplates().map((r) => r.uriTemplate),
    prompts: handlers.listPrompts().map((p) => p.name),
  };
}

/** GET: 405 for an SSE stream request (this server never pushes), else the manifest. */
export function getReply(handlers: McpHandlers, accept: string | null, endpoint: string): HttpReply {
  if (accept?.includes("text/event-stream")) {
    return { status: 405, body: null, headers: { Allow: "GET, POST, OPTIONS" } };
  }
  return { status: 200, body: serverManifest(handlers, endpoint) };
}
