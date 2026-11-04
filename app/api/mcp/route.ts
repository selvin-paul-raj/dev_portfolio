// app/api/mcp/route.ts
// MCP over Streamable HTTP (stateless, JSON responses). The protocol and HTTP
// rules live in lib/mcp/router.ts; this file only adapts Request/Response.
import { handleMcpPost, mcpHandlers } from "@/lib/mcp/server";
import { getReply, MAX_BODY_BYTES, tooLargeReply } from "@/lib/mcp/router";
import type { HttpReply } from "@/lib/mcp/router";
import { readCappedText } from "@/lib/mcp/http";
import { getClientIp } from "@/lib/rateLimit";
import { PROFILE } from "@/lib/mcp/definitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, unauthenticated, read-mostly server: any origin may call it, but only
// the methods/headers the Streamable HTTP transport actually uses are allowed.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

function toResponse(reply: HttpReply): Response {
  const headers = { ...CORS, ...reply.headers };
  if (reply.body === null) return new Response(null, { status: reply.status, headers });
  return Response.json(reply.body, { status: reply.status, headers });
}

/** Discovery manifest; 405 when a client asks for a server-initiated SSE stream. */
export function GET(req: Request) {
  return toResponse(getReply(mcpHandlers, req.headers.get("accept"), PROFILE.mcpEndpoint));
}

/** MCP JSON-RPC handler */
export async function POST(req: Request) {
  const raw = await readCappedText(req, MAX_BODY_BYTES);
  if (raw === null) return toResponse(tooLargeReply());
  return toResponse(
    await handleMcpPost(raw, {
      ip: getClientIp((h) => req.headers.get(h)),
      protocolVersion: req.headers.get("mcp-protocol-version"),
    })
  );
}

/** CORS preflight */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
