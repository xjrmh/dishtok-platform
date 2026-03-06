"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/shared/SafeImage";
import { Minus, Plus } from "lucide-react";
import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItemModalProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

export function MenuItemModal({ item, open, onClose }: MenuItemModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<
    { name: string; price: number }[]
  >([]);
  const [instructions, setInstructions] = useState("");

  if (!item) return null;

  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const itemTotal = (item.price + addOnTotal) * quantity;

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      addOns: selectedAddOns,
      specialInstructions: instructions || undefined,
    });
    toast.success(`${item.name} added to cart`);
    onClose();
    setQuantity(1);
    setSelectedAddOns([]);
    setInstructions("");
  };

  const toggleAddOn = (addOn: { name: string; price: number }) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.name === addOn.name)
        ? prev.filter((a) => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        {item.image && (
          <div className="relative h-56">
            <SafeImage
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="500px"
            />
            <div className="absolute top-3 left-3 flex gap-1.5">
              {item.tags?.includes("popular") && (
                <Badge className="border-0 bg-theme-accent text-theme-accent-foreground">
                  Popular
                </Badge>
              )}
              {item.tags?.includes("spicy") && (
                <Badge className="bg-red-500 text-white border-0">Spicy</Badge>
              )}
            </div>
          </div>
        )}

        <div className="p-6">
          <h3 className="mb-2 font-serif text-2xl font-bold text-theme-ink">
            {item.name}
          </h3>
          <p className="text-muted-foreground mb-4">{item.description}</p>
          <p className="mb-6 text-2xl font-bold text-theme-primary">
            {formatCurrency(item.price)}
          </p>

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-theme-ink">
                Add-ons
              </h4>
              <div className="space-y-2">
                {item.addOns.map((addOn) => {
                  const selected = selectedAddOns.some(
                    (a) => a.name === addOn.name
                  );
                  return (
                    <button
                      key={addOn.name}
                      onClick={() => toggleAddOn(addOn)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                        selected
                          ? "border-theme-border-strong bg-theme-primary/5"
                          : "border-theme-border hover:border-theme-border-strong"
                      }`}
                    >
                      <span className="text-sm">{addOn.name}</span>
                      <span className="text-sm font-semibold">
                        +{formatCurrency(addOn.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-theme-ink">
              Special Instructions
            </h4>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any allergies or preferences?"
              className="h-20 w-full resize-none rounded-lg border border-theme-border p-3 text-sm focus:border-theme-border-strong focus:outline-none"
            />
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex-1 rounded-lg bg-theme-primary py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
            >
              Add to Cart &mdash; {formatCurrency(itemTotal)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
