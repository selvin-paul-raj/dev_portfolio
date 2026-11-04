// lib/mcp/http.ts
// Size-capped body reading for the Next.js agent routes (/api/mcp, /api/a2a):
// refuse on Content-Length before reading, and stop mid-stream when the header
// is missing or understated.

/** Returns the body text, or null when it exceeds `maxBytes`. */
export async function readCappedText(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!req.body) return "";

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
