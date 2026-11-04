import { describe, expect, it } from "vitest";
import mcpManifest from "@/public/.well-known/mcp.json";
import agentCard from "@/public/.well-known/agent-card.json";
import projects from "@/lib/data/projects.json";
import certifications from "@/lib/data/certifications.json";
import { CERT_CATEGORIES, PROJECT_CATEGORIES, TOOLS } from "@/lib/mcp/catalog";
import { PROMPT_DEFS, RESOURCE_DEFS, RESOURCE_TEMPLATES, SERVER_VERSION, SUPPORTED_PROTOCOL_VERSIONS } from "@/lib/mcp/definitions";

describe("public/.well-known/mcp.json", () => {
  it("lists exactly the registry's tools", () => {
    expect(mcpManifest.tools.map((t) => t.name)).toEqual(TOOLS.map((t) => t.name));
  });

  it("lists exactly the registry's resources, templates, and prompts", () => {
    expect(mcpManifest.resources.map((r) => r.uri)).toEqual(RESOURCE_DEFS.map((r) => r.uri));
    expect(mcpManifest.resource_templates.map((r) => r.uri_template)).toEqual(RESOURCE_TEMPLATES.map((r) => r.uriTemplate));
    expect(mcpManifest.prompts.map((p) => p.name)).toEqual(PROMPT_DEFS.map((p) => p.name));
  });

  it("matches the server version and protocol versions", () => {
    expect(mcpManifest.server_version).toBe(SERVER_VERSION);
    expect(mcpManifest.supported_protocol_versions).toEqual([...SUPPORTED_PROTOCOL_VERSIONS]);
    expect(mcpManifest.protocol_version).toBe(SUPPORTED_PROTOCOL_VERSIONS[0]);
  });
});

describe("agent card", () => {
  it("offers the job_fit, profile, and ask skills", () => {
    expect(agentCard.skills.map((s) => s.id).sort()).toEqual(["ask", "job_fit", "profile"]);
    expect(agentCard.capabilities.streaming).toBe(false);
  });
});

describe("input enums match the data", () => {
  it("covers every project category except the 'all' bucket", () => {
    const used = new Set(projects.flatMap((p) => p.categories).filter((c) => c !== "all"));
    expect([...used].sort()).toEqual([...PROJECT_CATEGORIES].sort());
  });

  it("covers every certification category", () => {
    const used = new Set(certifications.map((c) => c.category));
    expect([...used].sort()).toEqual([...CERT_CATEGORIES].sort());
  });
});
