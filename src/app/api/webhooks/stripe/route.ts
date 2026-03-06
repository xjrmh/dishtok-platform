import { NextResponse } from "next/server";
import { getOrderByStripeSession, updateOrderStatus } from "@/lib/store";

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        updateOrderStatus(orderId, "paid", session.id);
      } else {
        const order = getOrderByStripeSession(session.id);
        if (order) updateOrderStatus(order.id, "paid");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
