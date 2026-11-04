// Shared SEO helpers: per-route Open Graph / Twitter metadata, JSON-LD ids and
// a <JsonLd> script tag. Next merges metadata shallowly, so a route that sets
// openGraph or twitter must repeat siteName, locale, card and creator; pageMetadata does that.
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const SITE_NAME = "Selvin PaulRaj K";
export const TWITTER_CREATOR = "@selvinpaulrajk";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Last content update of lib/data (projects, experience, case studies). Bump when the data changes. */
export const DATA_UPDATED = "2026-10-30";

export const absoluteUrl = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

interface PageMetaInput {
  /** Document title; the root template appends " | Selvin PaulRaj K". */
  title: string;
  description: string;
  path: string;
  /** Title for social cards; defaults to `${title} | Selvin PaulRaj K`. */
  socialTitle?: string;
  type?: "website" | "article";
  keywords?: string[];
}

export function pageMetadata({ title, description, path, socialTitle, type = "website", keywords }: PageMetaInput): Metadata {
  const shareTitle = socialTitle ?? `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      title: shareTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      creator: TWITTER_CREATOR,
    },
  };
}

/** BreadcrumbList from [name, path] pairs, root first. */
export function breadcrumbList(items: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

/** Static, server-built structured data from our own data files; never user input. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
