import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

let inMemoryVersion = 1;
let lastDbCheck = 0;

export async function GET(req: NextRequest) {
  const now = Date.now();
  // Micro-throttle database check (1 second cache window)
  if (now - lastDbCheck > 1000) {
    try {
      const rows = await query<{ current_version: string | number }>(
        "SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;"
      );
      if (rows.length > 0) {
        inMemoryVersion = Number(rows[0].current_version);
      }
      lastDbCheck = now;
    } catch {
      // Degrade gracefully on DB hiccup, keep serving last known inMemoryVersion
    }
  }

  const etag = `"menu-v${inMemoryVersion}"`;
  const clientEtag = req.headers.get("if-none-match");

  const headers = {
    ETag: etag,
    "Cache-Control": "public, s-maxage=1, stale-while-revalidate=2",
  };

  if (clientEtag && (clientEtag === etag || clientEtag === `W/${etag}`)) {
    return new NextResponse(null, {
      status: 304,
      headers,
    });
  }

  return NextResponse.json(
    { version: inMemoryVersion },
    {
      status: 200,
      headers,
    }
  );
}
