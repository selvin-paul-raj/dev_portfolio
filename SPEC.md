# SPEC.md — Selvin PaulRaj K Portfolio Skybridge App

## Overview

A Skybridge-powered conversational panel deployed to Alpic.ai. Lets AI assistants (Claude, ChatGPT) interactively explore Selvin PaulRaj K's portfolio through a rich shared UI view. The human and AI collaborate through the view — the human browses while the AI answers using live portfolio MCP tools.

## App Name

`selvin-portfolio`

## Backend

Uses the live portfolio MCP server at `https://selvinpaulraj.vercel.app/api/mcp`.
No separate backend needed — all data comes from this endpoint.

## Users

- **Human**: Recruiters, potential collaborators exploring via Claude or ChatGPT
- **AI Assistant**: Answers questions about projects, skills, experience using MCP resources and tools

## Views

### 1. Profile (default)
- Name, role, location
- Short bio with animated headline
- Quick stats: N projects · N certifications
- Links: GitHub, LinkedIn, Portfolio
- CTA button: "Send Message" → opens Contact view

### 2. Projects
- Category filter tabs: All / AI / Web / Tools
- Project cards: title, tags (colored pills), description, GitHub + live links
- Search input → calls `search_projects` tool in real time
- Sort: newest / by category

### 3. GitHub Live
- Repo list from `list_github_repos` tool
- Stats per card: stars, forks, language, last updated
- Click repo → detail panel via `get_github_repo`

### 4. Certifications
- Grouped by category: AI Engineering / Web Development / Technology
- Each cert: issuer, title, date, "Verify" link
- Filter dropdown → calls `filter_certifications`

### 5. Contact
- Name, email, message form
- Submit → calls `contact_selvin` tool
- Success state: confirmation banner

## Design

- Dark-first, glass-morphism card surfaces
- Accent: violet-600 to indigo-600 gradient (matches McpBadge on main portfolio)
- Font: Geist Sans
- Category pills: violet = AI, blue = web, orange = tools
- Fade-in transitions on view switch
- Mobile-first (320px+)

## MCP Endpoint

```
https://selvinpaulraj.vercel.app/api/mcp
```

Protocol: MCP 2024-11-05 · Transport: HTTP JSON-RPC

## Deploy Target

Alpic.ai via Skybridge CLI

## Implementation Steps

1. In a NEW directory (outside this portfolio repo), run Skybridge `copy-template` to scaffold
2. Implement the 5 views per this spec
3. Configure MCP endpoint: `https://selvinpaulraj.vercel.app/api/mcp`
4. Run locally with `skybridge dev` and connect Claude to test each view
5. Deploy: `skybridge deploy` (requires Alpic API key)
6. Optionally publish to Claude/ChatGPT directories via Skybridge
