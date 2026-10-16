import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "../../../../../../lib/auth/server-actor";
import { requirePermission, PERMISSIONS } from "../../../../../../lib/auth/rbac";
import { getPresignedUploadUrl } from "../../../../../../lib/media/r2";

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminFromRequest(req);
    requirePermission(actor, PERMISSIONS.MEDIA_MANAGE);

    const body = await req.json();
    const { declaredType, declaredSize } = body;

    if (!declaredType || typeof declaredSize !== "number") {
      return NextResponse.json(
        { error: "declaredType and declaredSize are required" },
        { status: 400 }
      );
    }

    const { uploadUrl, pendingKey } = await getPresignedUploadUrl({
      declaredType,
      declaredSize,
    });

    return NextResponse.json({ uploadUrl, pendingKey });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
