import type { Instrumentation } from "next";

// One compact line per server error. Request headers and bodies are left out
// on purpose: they can carry cookies, IPs, and user-submitted text.
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const digest = typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined;
  console.error("[onRequestError]", {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    routePath: context.routePath,
    digest,
    message: err instanceof Error ? err.message : String(err),
  });
};
