// app/api/mcp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleMcpRequest, parseErrorResponse } from "@/lib/mcp/server";
import { getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, unauthenticated, read-mostly server: any origin may call it, but only
// the methods/headers the Streamable HTTP transport actually uses are allowed.
const CORS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

/** Discovery endpoint — returns server manifest */
export function GET() {
  return NextResponse.json(
    {
      name: "Selvin PaulRaj K — Portfolio MCP Server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      transport: "http (JSON-RPC 2.0)",
      description:
        "MCP server exposing Selvin's portfolio: projects, skills, experience, certifications, and live GitHub repos.",
      endpoint: "https://selvinpaulraj.vercel.app/api/mcp",
      resources: [
        "selvin://profile",
        "selvin://projects",
        "selvin://skills",
        "selvin://experience",
        "selvin://certifications",
        "selvin://recognition",
      ],
      tools: [
        "search_projects",
        "get_project_by_title",
        "list_github_repos",
        "get_github_repo",
        "filter_certifications",
        "get_profile_summary",
        "contact_selvin",
      ],
    },
    { headers: CORS }
  );
}

/** MCP JSON-RPC handler */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(parseErrorResponse(), { status: 400, headers: CORS });
  }

  const response = await handleMcpRequest(body, { ip: getClientIp((h) => req.headers.get(h)) });
  // Notifications get 202 Accepted with no body (MCP Streamable HTTP).
  if (response === null) return new Response(null, { status: 202, headers: CORS });
  return NextResponse.json(response, { headers: CORS });
}

/** CORS preflight */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
