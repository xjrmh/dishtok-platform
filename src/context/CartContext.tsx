"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { CartItem } from "@/types";
import { TAX_RATE } from "@/lib/utils";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QUANTITY"; id: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_CART":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const saved = localStorage.getItem("dishtok-cart");
    if (saved) {
      try {
        dispatch({ type: "LOAD_CART", items: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dishtok-cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const addOnKey = item.addOns.map((a) => a.name).join(",");
    const id = `${item.menuItemId}-${addOnKey}`;
    dispatch({ type: "ADD_ITEM", item: { ...item, id } });
  };

  const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", id, quantity });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const subtotal = state.items.reduce(
    (sum, item) =>
      sum +
      (item.price + item.addOns.reduce((a, b) => a + b.price, 0)) *
        item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
