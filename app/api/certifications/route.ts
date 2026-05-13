import { NextResponse } from "next/server";
import data from "@/lib/data/certifications.json";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export function GET() {
  return NextResponse.json(data.filter((c) => c.show), { headers: HEADERS });
}
