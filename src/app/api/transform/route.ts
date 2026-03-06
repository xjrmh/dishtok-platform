import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateTransformForUrl,
  validatePublicUrl,
} from "@/lib/ai-transform";

export const runtime = "nodejs";

const transformRequestSchema = z.object({
  url: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url: rawUrl } = transformRequestSchema.parse(body);
    const url = await validatePublicUrl(rawUrl);
    const transform = await generateTransformForUrl(url);

    return NextResponse.json(transform);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process transformation request.",
      },
      { status: 400 }
    );
  }
}
