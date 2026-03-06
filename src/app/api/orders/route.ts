import { NextResponse } from "next/server";
import { createOrder } from "@/lib/store";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  items: z.array(
    z.object({
      id: z.string(),
      menuItemId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      addOns: z.array(z.object({ name: z.string(), price: z.number() })),
      specialInstructions: z.string().optional(),
    })
  ),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  orderType: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
  restaurantSlug: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    const order = createOrder(data);

    return NextResponse.json(order, { status: 201 });
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
