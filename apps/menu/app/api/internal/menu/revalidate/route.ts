import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySignedRequest } from "../../../../../lib/auth/signature";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-pade-signature");

    let parsedBody: any = {};
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventId = parsedBody.event_id;
    const verification = verifySignedRequest({
      rawBody,
      signatureHeader,
      eventId,
    });

    if (!verification.valid) {
      console.warn("[Internal Revalidate Refused]:", verification.reason);
      return NextResponse.json({ error: verification.reason }, { status: 401 });
    }

    // Invalidate public page cache
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      public_version: parsedBody.public_version,
      received_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Internal Revalidate Error]:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
