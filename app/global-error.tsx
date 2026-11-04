"use client";

// Renders without the root layout, so it brings its own stylesheet; dark is the site default.
import "./globals.css";

export default function GlobalError({
  retry,
  reset,
}: {
  error: unknown;
  retry?: () => void;
  reset?: () => void;
}) {
  const tryAgain = retry ?? reset;
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-fg antialiased">
        <title>Something went wrong | Selvin PaulRaj K</title>
        <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
          <span className="font-mono text-5xl font-bold text-muted">!</span>
          <div>
            <h1 className="mb-1 text-lg font-semibold text-fg">Something went wrong</h1>
            <p className="text-sm text-muted">The page failed to load. Try again, or come back in a moment.</p>
          </div>
          <button
            type="button"
            onClick={() => tryAgain?.()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black active:scale-[0.97]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
