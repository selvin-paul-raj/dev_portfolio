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

### First-time setup

1. Go to [alpic.ai](https://alpic.ai) → log in
2. New project → connect GitHub → `selvin-paul-raj/dev_portfolio` → branch `main`
3. Runtime: `node24` · Transport: `streamablehttp`
4. Add environment variables:
   - `RESEND_API_KEY`
   - `GITHUB_TOKEN` (PAT with `public_repo` scope)

### Why alpic.json exists

Alpic's Docker runner defaults to `COPY dist/` but Next.js outputs to `.next/`.
`alpic.json` corrects this:

```json
{
  "buildCommand":   "npm run build",
  "buildOutputDir": ".next",
  "startCommand":   "npm run start"
}
```

### Test after deploy

```bash
# Replace with your Alpic slug
curl https://<slug>.alpic.ai/api/mcp
curl -X POST https://<slug>.alpic.ai/api/mcp \
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

## Skybridge App (Alpic UI)

See `SPEC.md` — a separate Skybridge project that provides a rich UI panel for this MCP server.
Scaffold with: [docs.skybridge.tech/quickstart/add-to-existing-app/server](https://docs.skybridge.tech/quickstart/add-to-existing-app/server)
