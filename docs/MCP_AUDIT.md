# MCP Server Production Audit

**Date:** 2026-07-15
**Scope:** `mcp-server.ts` (Alpic), `app/api/mcp/route.ts` + `lib/mcp/*` (Vercel)
**Method:** Manual code audit (ecc:production-audit + ecc:mcp-server-patterns skills) + live end-to-end smoke tests of both deployed entry points.

Production audit: 82/100, launchable with caveats — the highest-risk issue (two independently-maintained MCP implementations that had already drifted apart) is fixed by consolidating into a shared core; remaining caveats are the lack of CI and no rate limiting on the contact tool.

## What was found

This portfolio ships its MCP server twice: `app/api/mcp/route.ts` (Next.js, on Vercel) and `mcp-server.ts` (standalone Node `http` server, on Alpic.ai, added later so Alpic could run something that isn't a full Next.js build). Both hand-implemented the same JSON-RPC 2.0 / MCP 2024-11-05 protocol, tool schemas, resource list, profile data, and `contact_selvin` logic — and by the time of this audit, they had already diverged:

- `mcp-server.ts`'s `RESOURCES` array was missing the `description` field present on the Vercel side.
- `mcp-server.ts`'s `PROFILE.expertise` list and `currentRole`/summary text differed slightly from `lib/mcp/resources.ts`'s version.
- `DEPLOY.md` and `README.md` both documented an `alpic.json` shape (`buildOutputDir: ".next"`, `startCommand: "npm run start"`) that no longer matched the real `alpic.json` in the repo (`buildOutputDir: "dist"`, `startCommand: "node dist/mcp-server.js"`) — a leftover from before `mcp-server.ts` existed.
- `contact_selvin`'s email validation was `email.includes("@")` (accepts `"a@"`), had no length cap on `name`, and didn't strip control characters — a crafted `name` containing `\r\n` could smuggle extra content into the outgoing email.

## Fixes applied

1. **Consolidated both MCP entry points onto one shared core** — new `lib/mcp/{definitions,dispatch,contact,router}.ts`, each free of Next.js path aliases and JSON imports so they compile under both the Next.js bundler and the plain-`tsc` standalone build (`tsconfig.server.json`). Only JSON data *loading* still differs per-runtime (bundled import vs. `readFileSync`); every schema, filter, and protocol-routing rule now has exactly one implementation. Verified by rebuilding both targets and diffing `tools/list` / `resources/list` output — no drift remains.
2. **Hardened `contact_selvin`** (`lib/mcp/contact.ts`): proper email regex, 200-char cap on `name`, control-character stripping (defends against header-injection-style abuse via `name`/`email`), and moved `new Resend(...)` construction inside the try/catch — previously a missing `RESEND_API_KEY` threw an uncaught SDK error that leaked through the JSON-RPC router as a raw `-32603` message instead of the intended clean `{"error": "..."}` response. Confirmed live: a `\r\n`-laced name is now sanitized before use, and a missing-API-key failure now returns the clean error.
3. **Fixed the `alpic.json` documentation drift** in `DEPLOY.md` and `README.md` — both now describe the real, current build/start commands and the standalone-server architecture, with a new "Architecture Notes" section in `DEPLOY.md` explaining the shared-core design.
4. **Fixed a real compile-time bug the consolidation surfaced**: `lib/mcp/github.ts` used Next.js's `fetch` extension (`next: { revalidate }`), which isn't part of the standard `RequestInit` type under plain `tsc`. Added a local `FetchInitWithNext` type so both targets compile without changing runtime behavior (Next.js still gets ISR caching; Node's native fetch harmlessly ignores the extra key).

## Evidence checked

- Full read of both MCP implementations (`mcp-server.ts`, `app/api/mcp/route.ts`, `lib/mcp/*`) and their divergence, line by line.
- `npx tsc -p tsconfig.server.json --noEmit` — clean after fixes (initially failed on the `github.ts` fetch-type issue).
- `npm run build:mcp` — succeeds, produces `dist/mcp-server.js` + `dist/data/*.json`.
- `npm run build` (Next.js) — succeeds, `/api/mcp` route compiles and is listed as a dynamic route.
- Live smoke tests against both compiled servers: `GET /`, `tools/list`, `resources/list`, `resources/read` (`selvin://profile`), and `contact_selvin` with (a) an invalid email, (b) a CRLF-injection attempt in `name`, confirming sanitization and the corrected error path.
- `npm run lint` — one pre-existing error (`Certifications.tsx`, `react-hooks/set-state-in-effect`) and one pre-existing warning (`Recognition.tsx`, `jsx-a11y/role-supports-aria-props`), both unrelated to the MCP code and already present before this audit (both files were already modified in the working tree from earlier, unrelated work this session).

## Remaining caveats (not fixed — flagged for a decision)

- **No CI.** No `.github/workflows/` — nothing runs `npm run build`, `npm run build:mcp`, or `npm run lint` automatically on push. Both deployments (Vercel, Alpic) do build on push, so a broken build is caught at deploy time, but not before merge.
- **No rate limiting on `contact_selvin`.** Both entry points are stateless (Vercel serverless functions; Alpic's Node process can restart/scale), so an in-memory limiter wouldn't reliably throttle abuse. Anyone who can reach the MCP endpoint can trigger emails to `selvinpaulgomathi@gmail.com`. Low severity today (no public traffic driver to the MCP endpoint beyond AI assistants), but worth a shared-store rate limit (e.g. Upstash Redis by sender IP/email) if abuse appears.
- **CORS is wide open** (`Access-Control-Allow-Origin: *`) — intentional, since the data is public and MCP clients call from arbitrary origins, but worth noting as a deliberate, not accidental, choice.
- **Hand-rolled JSON-RPC instead of `@modelcontextprotocol/sdk`'s `McpServer` helper.** The SDK is a dependency but unused — both entry points implement the protocol switch by hand. This works and is now fully deduplicated, but adopting the SDK's `registerTool()`/`registerResource()` would remove even the shared `router.ts` and get input-schema validation for free. Bigger change, not done here to avoid touching two live deployments' request handling without a way to test against real MCP clients in this session.
- **Pre-existing, unrelated lint issue**: `components/Certifications.tsx:688` (`react-hooks/set-state-in-effect`) — from earlier work this session, out of scope for this MCP audit.

## Next action

Decide whether to add CI (a single GitHub Actions job running `npm run build`, `npm run build:mcp`, and `npm run lint` on PRs) — that's the highest-value remaining fix and is independent of the MCP work done here.
