import { NextResponse } from "next/server";
import { createReservation } from "@/lib/store";
import { z } from "zod";

const reservationSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  partySize: z.number().min(1).max(20),
  date: z.string(),
  time: z.string(),
  specialRequests: z.string().optional(),
  restaurantSlug: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = reservationSchema.parse(body);

    const reservation = createReservation(data);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
