"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ThemePresetId } from "@/types";

interface CheckoutButtonProps {
  restaurantSlug: string;
  themeId: ThemePresetId;
  onBack: () => void;
}

export function CheckoutForm({
  restaurantSlug,
  themeId,
  onBack,
}: CheckoutButtonProps) {
  const { items, subtotal, tax, total } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          items,
          subtotal,
          tax,
          total,
          orderType: "pickup",
          restaurantSlug,
          themeId,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-lg mx-auto"
      >
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1 text-sm text-theme-ink-soft hover:text-theme-ink"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to menu
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-theme-primary" />
            <h2 className="font-serif text-2xl font-bold text-theme-ink">
              Checkout
            </h2>
          </div>

          {/* Order summary */}
          <div className="mb-6 rounded-xl bg-theme-panel p-4">
            <h3 className="mb-3 text-sm font-semibold text-theme-ink">
              Order Summary
            </h3>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm py-1"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">
                  {formatCurrency(
                    (item.price +
                      item.addOns.reduce((a, b) => a + b.price, 0)) *
                      item.quantity
                  )}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-theme-primary">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <Input
              placeholder="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="tel"
              placeholder="Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full rounded-xl bg-theme-primary py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Pay {formatCurrency(total)} with Stripe</>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You&apos;ll be redirected to Stripe&apos;s secure checkout page
            </p>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
