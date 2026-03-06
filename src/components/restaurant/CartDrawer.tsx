"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, tax, total, clearCart } =
    useCart();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-theme-primary" />
            Your Order
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some delicious items from the menu!
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 px-1"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-theme-ink">
                        {item.name}
                      </h4>
                      {item.addOns.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          + {item.addOns.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          &quot;{item.specialInstructions}&quot;
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-theme-primary">
                        {formatCurrency(
                          (item.price +
                            item.addOns.reduce((a, b) => a + b.price, 0)) *
                            item.quantity
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-theme-primary">{formatCurrency(total)}</span>
              </div>

              <Button
                onClick={onCheckout}
                className="w-full rounded-xl bg-theme-primary py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
              >
                Proceed to Checkout
              </Button>
              <button
                onClick={clearCart}
                className="w-full text-sm text-muted-foreground hover:text-red-500 transition-colors py-2"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
