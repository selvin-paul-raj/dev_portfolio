// lib/mcp/tools.ts
import type { McpTool } from "./types";
import { listRepos, getRepo } from "./github";
import { Resend } from "resend";
import projectsData from "@/lib/data/projects.json";
import certificationsData from "@/lib/data/certifications.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projects = projectsData as any[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const certifications = certificationsData as any[];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function listTools(): McpTool[] {
  return [
    {
      name: "search_projects",
      description:
        "Search and filter Selvin's projects by keyword, technology, or category. Returns matching visible projects.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keyword to match in title, description, or tags" },
          category: { type: "string", description: "Category filter: 'web', 'ai', 'tool', 'android'" },
          tech: { type: "string", description: "Technology tag to match (e.g. 'LangGraph', 'Python', 'Next.js')" },
        },
      },
    },
    {
      name: "get_project_by_title",
      description: "Get a specific project by its title. Accepts partial matches.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Project title (partial match supported)" },
        },
        required: ["title"],
      },
    },
    {
      name: "list_github_repos",
      description:
        "List Selvin's public GitHub repositories with live stats: stars, forks, language, topics, last updated.",
      inputSchema: {
        type: "object",
        properties: {
          per_page: { type: "number", description: "Results per page, max 100 (default: 20)" },
          page: { type: "number", description: "Page number (default: 1)" },
          sort: { type: "string", description: "Sort by 'updated', 'created', or 'pushed' (default: 'updated')" },
        },
      },
    },
    {
      name: "get_github_repo",
      description: "Get full details for a specific GitHub repository by name.",
      inputSchema: {
        type: "object",
        properties: {
          repo: { type: "string", description: "Repository name, e.g. 'Linkedin-MCP-Server'" },
        },
        required: ["repo"],
      },
    },
    {
      name: "filter_certifications",
      description: "Filter Selvin's certifications by category and/or issuer.",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "'AI Engineering', 'Web Development', 'Technology', 'Cloud Computing', 'Data Science'",
          },
          issuer: {
            type: "string",
            description: "Issuer name (e.g. 'Anthropic', 'Hugging Face', 'LinkedIn', 'IBM')",
          },
        },
      },
    },
    {
      name: "get_profile_summary",
      description:
        "Get a comprehensive summary of Selvin's professional profile, expertise, and portfolio stats.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "contact_selvin",
      description:
        "Send a contact message to Selvin via email. Use when the user wants to hire, collaborate, or ask a question.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Sender's full name" },
          email: { type: "string", description: "Sender's email address" },
          message: { type: "string", description: "The message to send to Selvin (max 5000 chars)" },
        },
        required: ["name", "email", "message"],
      },
    },
  ];
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const text = await dispatch(name, args);
  return { content: [{ type: "text", text }] };
}

async function dispatch(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_projects": {
      const query = (args.query as string | undefined)?.toLowerCase() ?? "";
      const category = args.category as string | undefined;
      const tech = (args.tech as string | undefined)?.toLowerCase();

      let results = projects.filter((p) => p.show);
      if (query) {
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            (p.tags as string[]).some((t) => t.toLowerCase().includes(query))
        );
      }
      if (category && category !== "all") {
        results = results.filter((p) => (p.categories as string[]).includes(category));
      }
      if (tech) {
        results = results.filter((p) =>
          (p.tags as string[]).some((t) => t.toLowerCase().includes(tech))
        );
      }
      return JSON.stringify({ count: results.length, projects: results }, null, 2);
    }

    case "get_project_by_title": {
      const query = (args.title as string).toLowerCase();
      const project = projects.find((p) => p.show && p.title.toLowerCase().includes(query));
      if (!project) return JSON.stringify({ error: `No project found matching "${args.title}"` });
      return JSON.stringify(project, null, 2);
    }

    case "list_github_repos": {
      const repos = await listRepos({
        per_page: (args.per_page as number) ?? 20,
        page: (args.page as number) ?? 1,
        sort: (args.sort as "updated" | "created" | "pushed" | "full_name") ?? "updated",
      });
      return JSON.stringify({ count: repos.length, repos }, null, 2);
    }

    case "get_github_repo": {
      const repo = await getRepo(args.repo as string);
      return JSON.stringify(repo, null, 2);
    }

    case "filter_certifications": {
      let certs = certifications.filter((c) => c.show);
      if (args.category) {
        const cat = (args.category as string).toLowerCase();
        certs = certs.filter((c) => c.category.toLowerCase().includes(cat));
      }
      if (args.issuer) {
        const iss = (args.issuer as string).toLowerCase();
        certs = certs.filter((c) => c.issuer.toLowerCase().includes(iss));
      }
      return JSON.stringify({ count: certs.length, certifications: certs }, null, 2);
    }

    case "get_profile_summary": {
      const visibleProjects = projects.filter((p) => p.show);
      const visibleCerts = certifications.filter((c) => c.show);
      return JSON.stringify(
        {
          name: "Selvin PaulRaj K",
          role: "AI Engineer",
          location: "Chennai, Tamil Nadu, India",
          email: "selvinpaulgomathi@gmail.com",
          portfolio: "https://selvinpaulraj.vercel.app",
          github: "https://github.com/selvin-paul-raj",
          linkedin: "https://linkedin.com/in/selvinpaulraj",
          summary:
            "AI Engineer specializing in intelligent AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows.",
          currentCompany: "Zinnov / Draup",
          education: "M.E CSE (AI), Kings Engineering College",
          totalVisibleProjects: visibleProjects.length,
          totalCertifications: visibleCerts.length,
          topTechnologies: [
            "LangGraph",
            "MCP",
            "RAG",
            "Next.js",
            "Python",
            "FastAPI",
            "LangChain",
            "Claude",
            "GPT-4",
          ],
          mcpEndpoint: "https://selvinpaulraj.vercel.app/api/mcp",
        },
        null,
        2
      );
    }

    case "contact_selvin": {
      const { name, email, message } = args as { name: string; email: string; message: string };

      if (!name?.trim()) return JSON.stringify({ error: "name is required" });
      if (!email?.includes("@")) return JSON.stringify({ error: "valid email is required" });
      if (!message?.trim()) return JSON.stringify({ error: "message is required" });
      if (message.length > 5000) return JSON.stringify({ error: "message too long (max 5000 chars)" });

      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "SPR Portfolio MCP <onboarding@resend.dev>",
          to: "selvinpaulgomathi@gmail.com",
          subject: `[MCP Contact] ${name}`,
          replyTo: email,
          html: `<h2>New message via Portfolio MCP</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
        });
      } catch {
        return JSON.stringify({ error: "Failed to send message. Please try again later." });
      }

      return JSON.stringify({
        success: true,
        message: `Message sent to Selvin from ${name}. He'll reply to ${email} soon.`,
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
