// lib/fit/matchJob.ts
// Deterministic job-description fit check: finds known requirements in a JD
// and cites portfolio evidence (work bullets, projects, certifications) for
// each one. No LLM — every "match" points at a real line of data, and anything
// without evidence is reported as a gap rather than papered over.
// Shared by the /fit page, the MCP `match_job` tool, and the A2A endpoint, so
// keep it free of "@/" aliases and JSON imports (plain-tsc build).

export interface FitProject {
  show: boolean;
  title: string;
  description: string;
  tags: string[];
  code?: string | null;
  live?: string | null;
  featured?: boolean;
  private?: boolean;
  personal?: boolean;
  [key: string]: unknown;
}

export interface FitExperience {
  title: string;
  company: string;
  description: string;
  icon: string;
  order?: number;
  [key: string]: unknown;
}

export interface FitCertification {
  show: boolean;
  title: string;
  issuer: string;
  skills?: string[] | null;
  verifyUrl?: string | null;
  [key: string]: unknown;
}

export interface FitData {
  projects: FitProject[];
  experiences: FitExperience[];
  certifications: FitCertification[];
}

export type EvidenceKind = "work" | "project" | "certification";

export interface Evidence {
  kind: EvidenceKind;
  source: string;
  text: string;
  url: string | null;
}

export type Strength = "production" | "project" | "certified";

/** "nice" when every mention sits under a Preferred / Nice to have heading or in a sentence marked "a plus". */
export type Priority = "must" | "nice";

/** Where a requirement phrase sits in the JD: character offsets into the original text. */
export interface JdSpan {
  start: number;
  end: number;
  text: string;
  priority: Priority;
}

export interface RequirementMatch {
  requirement: string;
  strength: Strength;
  evidence: Evidence[];
  priority: Priority;
  spans: JdSpan[];
  /** Every evidence hit found, even when `evidence` is capped. */
  evidenceTotal: number;
  /** Score points this requirement earned, and the most it could have earned. */
  points: number;
  maxPoints: number;
}

export interface GapDetail {
  requirement: string;
  priority: Priority;
  spans: JdSpan[];
  maxPoints: number;
}

export interface FitReport {
  score: number;
  verdict: string;
  matched: RequirementMatch[];
  gaps: string[];
  gapDetails: GapDetail[];
  method: string;
}

export interface MatchOptions {
  /** Evidence lines kept per requirement (default 3). The /fit page passes Infinity. */
  maxEvidence?: number;
}

export const STRENGTH_WEIGHT: Record<Strength, number> = { production: 1, project: 0.75, certified: 0.4 };
export const PRIORITY_WEIGHT: Record<Priority, number> = { must: 1, nice: 0.5 };
export const VERDICT_THRESHOLDS = { strong: 80, good: 60, partial: 40 } as const;

// Canonical requirement → phrases that signal it in a JD. Those phrases plus
// the optional third list (evidence-only synonyms) are searched in the
// evidence text. Terms Selvin has no evidence for are kept on purpose: they
// surface as gaps.
const REQUIREMENTS: Array<[string, string[], string[]?]> = [
  ["AI agents", ["ai agents?", "agentic", "autonomous agents?", "agent orchestration", "multi-agent", "agent workflows?"]],
  ["Multi-agent systems", ["multi-agent", "multi agent", "agent orchestration", "manager agents?"]],
  ["LangGraph", ["langgraph"]],
  ["LangChain", ["langchain"]],
  ["CrewAI", ["crewai", "crew ai"]],
  ["Google ADK", ["google adk", "agent development kit"]],
  ["Model Context Protocol (MCP)", ["mcp", "model context protocol"]],
  ["A2A / agent protocols", ["a2a", "agent-to-agent", "agent2agent", "agent communication protocol"]],
  ["Tool / function calling", ["tool calling", "function calling", "tool use", "tool integration"]],
  ["LLM applications", ["llms?", "large language models?", "generative ai", "genai", "gen ai"]],
  ["Prompt engineering", ["prompt engineering", "prompting", "prompt design"]],
  ["Claude / Anthropic", ["claude", "anthropic"]],
  ["OpenAI / GPT", ["openai", "gpt-?4o?", "gpt"]],
  ["Gemini", ["gemini"]],
  ["RAG", ["rag", "retrieval[- ]augmented", "retrieval augmented generation", "agentic rag"], ["hybrid retrieval", "semantic search"]],
  ["Vector search / embeddings", ["vector (?:search|databases?|stores?|db)", "embeddings?", "semantic search", "faiss", "pinecone", "chroma", "weaviate", "qdrant", "pgvector", "milvus"]],
  ["Hybrid search (BM25)", ["hybrid (?:search|retrieval)", "bm25", "keyword search", "lexical search"]],
  ["Re-ranking", ["re-?rank(?:ing|ers?)?"]],
  ["Chunking strategies", ["chunking"]],
  ["Entity resolution", ["entity resolution", "entity matching", "record linkage", "deduplication"]],
  ["Knowledge graphs", ["knowledge graphs?", "graph rag", "neo4j"]],
  ["LLM evaluation", ["evals?", "evaluation", "llm-as-a-judge", "deepeval", "ragas", "benchmark(?:s|ing)?"]],
  ["AI safety / guardrails", ["guardrails?", "ai safety", "prompt injection", "red[- ]teaming", "hallucinations?", "responsible ai"]],
  ["Human-in-the-loop", ["human[- ]in[- ]the[- ]loop", "hitl"]],
  ["Structured outputs", ["structured outputs?", "pydantic", "json schema"]],
  ["Text-to-SQL", ["text[- ]to[- ]sql", "nl2sql", "natural[- ]language (?:to )?(?:sql|queries)", "sql generation"]],
  ["Python", ["python"]],
  ["FastAPI", ["fastapi"]],
  ["REST APIs", ["rest(?:ful)? apis?", "apis?", "microservices?"]],
  ["SQL / PostgreSQL", ["sql", "postgres(?:ql)?", "trino"]],
  ["Async Python", ["async(?:io)?", "asynchronous"]],
  ["Testing (pytest)", ["pytest", "unit tests?", "test suites?", "automated tests?"]],
  ["Web scraping / automation", ["web scraping", "scrap(?:ing|ers?)", "playwright", "selenium", "beautifulsoup", "browser automation"]],
  ["Data pipelines / ETL", ["data pipelines?", "etl", "batch processing", "aws glue"]],
  ["Pandas / NumPy", ["pandas", "numpy"]],
  ["Machine learning", ["machine learning", "scikit-learn", "sklearn", "ml models?"]],
  ["Deep learning (PyTorch / TensorFlow)", ["pytorch", "tensorflow", "deep learning", "neural networks?"]],
  ["Computer vision", ["computer vision", "opencv", "image recognition", "facial recognition"]],
  ["NLP", ["nlp", "natural language processing", "text classification", "named entity"]],
  ["Hugging Face", ["hugging ?face", "transformers library", "sentence[- ]transformers"]],
  ["Fine-tuning LLMs", ["fine[- ]tun(?:e|ing)", "lora", "qlora", "peft", "rlhf", "sft"]],
  ["LLM serving / inference", ["vllm", "tgi", "llm serving", "inference optimi[sz]ation", "triton", "nvidia nim", "ollama"]],
  ["AWS", ["aws", "amazon web services", "s3", "lambda", "bedrock", "sagemaker"]],
  ["GCP", ["gcp", "google cloud", "vertex ai"]],
  ["Azure", ["azure"]],
  ["Docker", ["docker", "containers?", "containeri[sz]ation"]],
  ["Kubernetes", ["kubernetes", "k8s", "helm"]],
  ["CI/CD", ["ci/cd", "ci cd", "github actions", "continuous integration"]],
  ["MLOps / LLMOps", ["mlops", "llmops", "mlflow", "model monitoring", "observability", "langsmith", "langfuse"]],
  ["Streaming / messaging (Kafka)", ["kafka", "rabbitmq", "pub/sub", "event[- ]driven"]],
  ["Big data (Spark)", ["spark", "pyspark", "databricks", "hadoop"]],
  ["Airflow / orchestration", ["airflow", "dagster", "prefect"]],
  ["Data warehouses", ["snowflake", "bigquery", "redshift"]],
  ["OAuth / auth", ["oauth", "authentication", "sso"]],
  ["TypeScript / JavaScript", ["typescript", "javascript", "node\\.?js"]],
  ["React / Next.js", ["react", "next\\.?js"]],
  ["Full-stack development", ["full[- ]stack", "mern", "frontend", "back[- ]?end"]],
  ["Java", ["java(?!script)"]],
  ["Go", ["golang", "\\bgo\\b(?= (?:language|developer|services))"]],
  ["Rust", ["rust"]],
  ["C++", ["c\\+\\+"]],
  ["Excel / reporting automation", ["excel", "openpyxl", "reporting automation", "powerpoint"]],
];

/** How many requirements the taxonomy knows, for explaining an empty result. */
export const REQUIREMENT_COUNT = REQUIREMENTS.length;

const toRegex = (patterns: string[]) =>
  new RegExp(`(?:^|[^a-z0-9+])(?:${patterns.join("|")})(?![a-z0-9+])`, "i");

// Same match as toRegex, with the phrase captured so its offset can be recovered.
const toSpanRegex = (patterns: string[]) =>
  new RegExp(`(?:^|[^a-z0-9+])(${patterns.join("|")})(?![a-z0-9+])`, "gi");

const COMPILED = REQUIREMENTS.map(([name, patterns, evidenceOnly = []]) => ({
  name,
  re: toRegex(patterns),
  spanRe: toSpanRegex(patterns),
  evidenceRe: toRegex([...patterns, ...evidenceOnly]),
}));

const MAX_EVIDENCE = 3;

// Section headings that switch the priority of every line below them.
const NICE_HEADING =
  /^(?:preferred|nice[- ]to[- ]haves?|good[- ]to[- ]haves?|bonus(?: points)?|pluses|plus|desired|desirable)\b[^:]{0,40}:?$/i;
const MUST_HEADING =
  /^(?:requirements?|required|must[- ]haves?|minimum qualifications|basic qualifications|qualifications|what you(?:'ll)? need|responsibilities|what you(?:'ll)? do)\b[^:]{0,40}:?$/i;
// Inline markers that make one sentence a nice-to-have.
const NICE_INLINE = /\b(?:preferred|nice[- ]to[- ]have|good[- ]to[- ]have|a plus|bonus|desirable)\b/i;

interface Region {
  start: number;
  end: number;
  priority: Priority;
}

/** Splits the JD into sentence regions, each tagged must or nice. */
function priorityRegions(text: string): Region[] {
  const regions: Region[] = [];
  let section: Priority = "must";
  let lineStart = 0;
  for (const line of text.split("\n")) {
    const heading = line.replace(/^[\s#*•-]+/, "").replace(/[*\s]+$/, "");
    if (NICE_HEADING.test(heading)) section = "nice";
    else if (MUST_HEADING.test(heading)) section = "must";
    const sentence = /(?:[^.;!?]|[.;!?](?=\S))+[.;!?]?|[.;!?]+/g;
    for (const m of line.matchAll(sentence)) {
      const priority: Priority = section === "nice" || NICE_INLINE.test(m[0]) ? "nice" : "must";
      const start = lineStart + (m.index ?? 0);
      regions.push({ start, end: start + m[0].length, priority });
    }
    lineStart += line.length + 1;
  }
  return regions;
}

function findSpans(re: RegExp, text: string, regions: Region[]): JdSpan[] {
  return Array.from(text.matchAll(re), (m) => {
    const start = (m.index ?? 0) + m[0].length - m[1].length;
    const region = regions.find((r) => start >= r.start && start < r.end);
    return { start, end: start + m[1].length, text: m[1], priority: region?.priority ?? "must" };
  });
}
const MAX_JD_CHARS = 20_000;

function bullets(description: string): string[] {
  return description
    .split(/\n+/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter((l) => l.length > 0);
}

function buildCorpus(data: FitData): Evidence[] {
  const corpus: Evidence[] = [];

  const roles = data.experiences
    .filter((e) => e.icon === "work")
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  for (const e of roles) {
    for (const line of bullets(e.description)) {
      corpus.push({ kind: "work", source: `${e.title} · ${e.company}`, text: line, url: null });
    }
  }

  const projects = data.projects
    .filter((p) => p.show)
    .sort((a, b) => Number(b.featured === true) - Number(a.featured === true));
  for (const p of projects) {
    corpus.push({
      kind: "project",
      source: p.private ? `${p.title} (${p.personal ? "personal" : "work"}, private)` : p.title,
      text: `${p.description} [${p.tags.join(", ")}]`,
      url: p.live || p.code || null,
    });
  }

  for (const c of data.certifications) {
    if (!c.show) continue;
    corpus.push({
      kind: "certification",
      source: `${c.title} · ${c.issuer}`,
      text: [c.title, ...(c.skills ?? [])].join(", "),
      url: c.verifyUrl ?? null,
    });
  }

  return corpus;
}

function verdictFor(score: number): string {
  if (score >= VERDICT_THRESHOLDS.strong) return "Strong fit. Most requirements are backed by production work.";
  if (score >= VERDICT_THRESHOLDS.good) return "Good fit. Core requirements are covered; a few are project-level or gaps.";
  if (score >= VERDICT_THRESHOLDS.partial) return "Partial fit. Some core requirements are covered.";
  return "Limited fit. Few requirements in this JD overlap with Selvin's evidence.";
}

function strengthOf(hits: Evidence[]): Strength {
  if (hits.some((h) => h.kind === "work")) return "production";
  if (hits.some((h) => h.kind === "project")) return "project";
  return "certified";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// Score = sum(priority weight x strength weight) / sum(priority weight). With no
// nice-to-haves every priority weight is 1, which is the plain average.
export function matchJob(jd: string, data: FitData, options: MatchOptions = {}): FitReport {
  const text = jd.slice(0, MAX_JD_CHARS);
  const maxEvidence = options.maxEvidence ?? MAX_EVIDENCE;
  const corpus = buildCorpus(data);
  const regions = priorityRegions(text);
  const matched: Omit<RequirementMatch, "points" | "maxPoints">[] = [];
  const gapDetails: Omit<GapDetail, "maxPoints">[] = [];

  for (const req of COMPILED) {
    if (!req.re.test(text)) continue;
    const spans = findSpans(req.spanRe, text, regions);
    const priority: Priority = spans.some((sp) => sp.priority === "must") ? "must" : "nice";
    const hits = corpus.filter((ev) => req.evidenceRe.test(ev.text) || req.evidenceRe.test(ev.source));
    if (hits.length === 0) {
      gapDetails.push({ requirement: req.name, priority, spans });
      continue;
    }
    // Corpus order already ranks work > featured projects > projects > certs.
    matched.push({
      requirement: req.name,
      strength: strengthOf(hits),
      evidence: hits.slice(0, maxEvidence),
      evidenceTotal: hits.length,
      priority,
      spans,
    });
  }

  const totalWeight = [...matched, ...gapDetails].reduce((s, r) => s + PRIORITY_WEIGHT[r.priority], 0);
  const share = (p: Priority) => (totalWeight === 0 ? 0 : (PRIORITY_WEIGHT[p] / totalWeight) * 100);
  const earned = matched.reduce((s, m) => s + PRIORITY_WEIGHT[m.priority] * STRENGTH_WEIGHT[m.strength], 0);
  const score = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100);
  const scored: RequirementMatch[] = matched.map((m) => ({
    ...m,
    maxPoints: round2(share(m.priority)),
    points: round2(share(m.priority) * STRENGTH_WEIGHT[m.strength]),
  }));

  return {
    score,
    verdict: totalWeight === 0 ? "No recognised technical requirements found in this text." : verdictFor(score),
    matched: scored.sort((a, b) => STRENGTH_WEIGHT[b.strength] - STRENGTH_WEIGHT[a.strength]),
    gaps: gapDetails.map((g) => g.requirement),
    gapDetails: gapDetails.map((g) => ({ ...g, maxPoints: round2(share(g.priority)) })),
    method:
      "Deterministic phrase matching over portfolio data, no LLM. Every match cites the work bullet, project, or certification it came from; requirements with no evidence are listed as gaps. Nice-to-have requirements count half.",
  };
}
