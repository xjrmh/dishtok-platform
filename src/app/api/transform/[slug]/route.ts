import { NextResponse } from "next/server";
import { readTransformSnapshot } from "@/lib/transform-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug || slug === "son-cubano") {
    return NextResponse.json({ error: "Snapshot not found." }, { status: 404 });
  }

  const snapshot = await readTransformSnapshot(slug);
  if (!snapshot) {
    return NextResponse.json({ error: "Snapshot not found." }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
