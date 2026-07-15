# Deployment Guide

## Overview

This portfolio deploys to two platforms:

| Platform | What | URL |
|----------|------|-----|
| **Vercel** | Full portfolio website + MCP endpoint | `https://selvinpaulraj.vercel.app` |
| **Alpic.ai** | Standalone MCP server (AI assistant discovery) | Alpic-assigned URL |

---

## Vercel (Portfolio Website)

Vercel auto-deploys on every push to `main`.

**Required environment variables** (Vercel dashboard → Settings → Environment Variables):

```
RESEND_API_KEY=your_resend_api_key
GITHUB_TOKEN=your_github_pat_with_public_repo_scope
```

MCP endpoint: `https://selvinpaulraj.vercel.app/api/mcp`

---

## Alpic.ai (MCP Server)

Alpic does **not** run the Next.js app. It runs `mcp-server.ts` — a standalone
Node `http` server with no framework dependency — compiled straight to
`dist/mcp-server.js` by plain `tsc` (see `tsconfig.server.json`). It shares its
tool/resource definitions and dispatch logic with the Vercel route via
`lib/mcp/*` (see [Architecture](#architecture-notes) below), so the two
deployments cannot drift apart the way they used to.

### First-time setup

1. Go to [alpic.ai](https://alpic.ai) → log in
2. New project → connect GitHub → `selvin-paul-raj/dev_portfolio` → branch `main`
3. Runtime: `node24` · Transport: `streamablehttp`
4. Add environment variables:
   - `RESEND_API_KEY`
   - `GITHUB_TOKEN` (PAT with `public_repo` scope)

### Why alpic.json exists

`alpic.json` at the project root tells Alpic to build and run the standalone
server instead of the Next.js app:

```json
{
  "buildCommand":   "npm run build:mcp",
  "buildOutputDir": "dist",
  "startCommand":   "node dist/mcp-server.js"
}
```

`npm run build:mcp` runs `tsc -p tsconfig.server.json` (compiles `mcp-server.ts`
and everything it imports from `lib/mcp/*` into `dist/`) and then copies
`lib/data/*.json` into `dist/data/` so the compiled server can `readFileSync`
its content at runtime without a bundler.

> An earlier version of this file pointed Alpic at the Next.js build
> (`buildOutputDir: ".next"`, `startCommand: "npm run start"`). That approach
> was replaced once `mcp-server.ts` existed — Alpic's Docker runner doesn't
> support Next.js's `.next/` output layout well, and a plain Node server is
> simpler to run standalone anyway.

### Test after deploy

The standalone server doesn't route by path — it responds identically on any
path, so `/`, `/api/mcp`, etc. all hit the same handler:

```bash
# Replace with your Alpic-assigned host
curl https://<slug>.alpic.ai/
curl -X POST https://<slug>.alpic.ai/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## Environment Variables

| Variable | Used by | Scope |
|----------|---------|-------|
| `RESEND_API_KEY` | `contact_selvin` tool | Send contact emails |
| `GITHUB_TOKEN` | `list_github_repos`, `get_github_repo` | Read public repos (no write scope needed) |

Local `.env.local` (gitignored via `.env*.local`):
```
RESEND_API_KEY=re_xxxx
GITHUB_TOKEN=ghp_xxxx
```

---

## Local Development

```bash
npm install
npm run dev   # http://localhost:3000
```

Quick smoke test:
```bash
curl http://localhost:3000/api/mcp
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}'
```

---

## Architecture Notes

The MCP server exists as two entry points that must behave identically:

| Entry point | Runtime | Data loading |
|---|---|---|
| `app/api/mcp/route.ts` | Next.js route handler (Vercel) | JSON imported via `@/lib/data/*` (bundled) |
| `mcp-server.ts` | Standalone Node `http` server (Alpic) | JSON read via `readFileSync` from `dist/data/` |

Both delegate to the same shared, framework-agnostic modules in `lib/mcp/`:

- `definitions.ts` — tool schemas, resource schemas, static profile bio
- `dispatch.ts` — pure functions (`searchProjects`, `filterCertifications`, etc.) that take already-loaded data as arguments
- `contact.ts` — `contact_selvin` validation + Resend send
- `github.ts` — GitHub REST API calls
- `router.ts` — the JSON-RPC 2.0 / MCP protocol switch, built via `createMcpHandler({ listTools, callTool, listResources, readResource })`

Only the data-loading layer differs between the two entry points (JSON import vs. `readFileSync`) — everything else is single-sourced, so the two deployments cannot drift the way they did before (an earlier version of `mcp-server.ts` had its own copy of every tool/resource, and it had already gone out of sync with the Vercel side).

### Known limitations

- **No rate limiting on `contact_selvin`.** Both entry points are stateless (Vercel serverless functions, and Alpic's Node process can be scaled/restarted), so an in-memory counter wouldn't reliably throttle abuse. If spam becomes a problem, add a shared store (e.g. Upstash Redis) keyed by sender IP or email.
- **CORS is wide open** (`Access-Control-Allow-Origin: *`) by design — the data served is public portfolio content, and MCP clients need to call this from arbitrary origins.

---

## Skybridge App (Alpic UI)

See `SPEC.md` — a separate Skybridge project that provides a rich UI panel for this MCP server.
Scaffold with: [docs.skybridge.tech/quickstart/add-to-existing-app/server](https://docs.skybridge.tech/quickstart/add-to-existing-app/server)
