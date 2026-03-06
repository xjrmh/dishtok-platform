import { Order, Reservation } from "@/types";

const orders: Order[] = [];
const reservations: Reservation[] = [];

let orderCounter = 1;
let reservationCounter = 1;

export function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Order {
  const order: Order = {
    ...data,
    id: `ORD-${String(orderCounter++).padStart(4, "0")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function updateOrderStatus(
  id: string,
  status: Order["status"],
  stripeSessionId?: string
): Order | null {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  if (stripeSessionId) order.stripeSessionId = stripeSessionId;
  return order;
}

export function getOrderByStripeSession(sessionId: string): Order | null {
  return orders.find((o) => o.stripeSessionId === sessionId) ?? null;
}

export function createReservation(
  data: Omit<Reservation, "id" | "createdAt" | "status">
): Reservation {
  const reservation: Reservation = {
    ...data,
    id: `RES-${String(reservationCounter++).padStart(4, "0")}`,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  reservations.push(reservation);
  return reservation;
}

export function getReservations(restaurantSlug: string): Reservation[] {
  return reservations.filter((r) => r.restaurantSlug === restaurantSlug);
}
