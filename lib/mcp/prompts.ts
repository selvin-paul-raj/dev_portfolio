// lib/mcp/prompts.ts
// prompts/get for the PROMPT_DEFS in definitions.ts. Missing or oversized
// arguments are protocol errors (-32602), per the MCP prompts spec.
import { MAX_JD_CHARS } from "./catalog";
import { PROMPT_DEFS, PROFILE } from "./definitions";
import { McpError, JSONRPC_INVALID_PARAMS } from "./errors";
import type { McpPromptResult } from "./types";

const MAX_ROLE_CHARS = 200;

function requiredArg(args: Record<string, unknown>, name: string, max: number): string {
  const value = args[name];
  if (typeof value !== "string" || !value.trim()) throw new McpError(JSONRPC_INVALID_PARAMS, `Missing required argument: ${name}`);
  if (value.length > max) throw new McpError(JSONRPC_INVALID_PARAMS, `Argument ${name} is too long (max ${max} characters)`);
  return value.trim();
}

const userMessage = (description: string, text: string): McpPromptResult => ({
  description,
  messages: [{ role: "user", content: { type: "text", text } }],
});

export function getPrompt(name: string, args: Record<string, unknown>): McpPromptResult {
  const def = PROMPT_DEFS.find((p) => p.name === name);
  if (!def) throw new McpError(JSONRPC_INVALID_PARAMS, `Unknown prompt: ${name}. Available: ${PROMPT_DEFS.map((p) => p.name).join(", ")}`);

  if (name === "evaluate_fit") {
    const jd = requiredArg(args, "job_description", MAX_JD_CHARS);
    return userMessage(
      def.description,
      `Evaluate how well ${PROFILE.name} fits the job description below.\n` +
        "1. Call the match_job tool with the full job description.\n" +
        "2. Report the score and verdict, then the must-have requirements with their strongest evidence (quote the evidence text and its source).\n" +
        "3. List the gaps plainly. Do not credit skills the tool did not find, and do not soften gaps.\n" +
        `4. Link the full report: ${PROFILE.fitCheckUrl}\n\n` +
        `Job description:\n"""\n${jd}\n"""`
    );
  }

  const role = requiredArg(args, "role", MAX_ROLE_CHARS);
  return userMessage(
    def.description,
    `Write a 4-6 sentence summary of ${PROFILE.name} for a "${role}" position.\n` +
      "- Use get_profile_summary for exact experience totals and quote them as returned.\n" +
      "- Use ask_selvin or search_projects to find the work most relevant to the role, and get_case_study for measured results.\n" +
      "- Only state what the tools return; cite project names and numbers exactly. If the portfolio shows no evidence for a core skill of the role, say so.\n" +
      `- End with his resume link: ${PROFILE.resumeUrl}`
  );
}
