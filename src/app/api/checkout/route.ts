import { NextResponse } from "next/server";
import { createOrder } from "@/lib/store";
import { z } from "zod";

const checkoutSchema = z.object({
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
  themeId: z
    .enum(["terracotta-sunset", "olive-linen", "coastal-citrus"])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Create a pending order
    const order = createOrder(data);

    // Check if Stripe is configured
    if (
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY.startsWith("sk_")
    ) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const lineItems = data.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.addOns.length
              ? `Add-ons: ${item.addOns.map((a) => a.name).join(", ")}`
              : undefined,
          },
          unit_amount: Math.round(
            (item.price + item.addOns.reduce((s, a) => s + a.price, 0)) * 100
          ),
        },
        quantity: item.quantity,
      }));

      // Add tax as a line item
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
            description: undefined,
          },
          unit_amount: Math.round(data.tax * 100),
        },
        quantity: 1,
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const themeQuery = data.themeId ? `&theme=${data.themeId}` : "";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}/demo/${data.restaurantSlug}?success=true&session_id={CHECKOUT_SESSION_ID}${themeQuery}`,
        cancel_url: `${baseUrl}/demo/${data.restaurantSlug}?canceled=true${themeQuery}`,
        customer_email: data.customerEmail,
        metadata: { orderId: order.id },
      });

      return NextResponse.json({ url: session.url, orderId: order.id });
    }

    // Fallback: if Stripe is not configured, simulate success
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const themeQuery = data.themeId ? `&theme=${data.themeId}` : "";
    return NextResponse.json({
      url: `${baseUrl}/demo/${data.restaurantSlug}?success=true${themeQuery}`,
      orderId: order.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
