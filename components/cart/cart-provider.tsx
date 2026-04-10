"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "pattayabev-cart";
const CART_GUEST_KEY = "pattayabev-guest-id";

export type CartProductInput = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  currency: string;
  originalPrice?: number | null;
  estimatedWeightKg?: number | null;
};

export type CartItem = CartProductInput & {
  quantity: number;
  subtotal: number;
  originalSubtotal: number;
  discountAmount: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  guestId: string | null;
  isReady: boolean;
  addItem: (product: CartProductInput, quantity?: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function sanitizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
}

function buildCartItem(product: CartProductInput, quantity: number): CartItem {
  const normalizedQuantity = sanitizeQuantity(quantity);
  const originalPrice =
    typeof product.originalPrice === "number" && product.originalPrice > product.price
      ? product.originalPrice
      : product.price;
  const subtotal = normalizedQuantity * product.price;
  const originalSubtotal = normalizedQuantity * originalPrice;

  return {
    ...product,
    originalPrice,
    quantity: normalizedQuantity,
    subtotal,
    originalSubtotal,
    discountAmount: Math.max(0, originalSubtotal - subtotal)
  };
}

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Partial<CartItem>;

      if (
        typeof row.id !== "string" ||
        typeof row.slug !== "string" ||
        typeof row.name !== "string" ||
        typeof row.price !== "number" ||
        typeof row.currency !== "string"
      ) {
        return null;
      }

      return buildCartItem(
        {
          id: row.id,
          slug: row.slug,
          name: row.name,
          imageUrl: typeof row.imageUrl === "string" ? row.imageUrl : null,
          price: row.price,
          currency: row.currency,
          originalPrice: typeof row.originalPrice === "number" ? row.originalPrice : null,
          estimatedWeightKg: typeof row.estimatedWeightKg === "number" ? row.estimatedWeightKg : null
        },
        typeof row.quantity === "number" ? row.quantity : 1
      );
    })
    .filter((item): item is CartItem => Boolean(item));
}

function createGuestId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `guest-${window.crypto.randomUUID()}`;
  }

  return `guest-${Date.now()}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      const savedGuestId = window.localStorage.getItem(CART_GUEST_KEY);

      if (savedCart) {
        setItems(normalizeItems(JSON.parse(savedCart)));
      }

      if (savedGuestId) {
        setGuestId(savedGuestId);
      } else {
        const nextGuestId = createGuestId();
        setGuestId(nextGuestId);
        window.localStorage.setItem(CART_GUEST_KEY, nextGuestId);
      }
    } catch {
      setItems([]);
      const nextGuestId = createGuestId();
      setGuestId(nextGuestId);
      window.localStorage.setItem(CART_GUEST_KEY, nextGuestId);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    if (guestId) {
      window.localStorage.setItem(CART_GUEST_KEY, guestId);
    }
  }, [guestId, isReady, items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: CartProductInput, quantity = 1) => {
      const normalizedQuantity = sanitizeQuantity(quantity);

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (!existingItem) {
          return [...currentItems, buildCartItem(product, normalizedQuantity)];
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? buildCartItem(
                {
                  id: item.id,
                  slug: item.slug,
                  name: item.name,
                  imageUrl: item.imageUrl,
                  price: product.price,
                  currency: product.currency,
                  originalPrice: product.originalPrice ?? item.originalPrice,
                  estimatedWeightKg: product.estimatedWeightKg ?? item.estimatedWeightKg ?? null
                },
                item.quantity + normalizedQuantity
              )
            : item
        );
      });
    };

    const increaseQuantity = (productId: string) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === productId ? buildCartItem(item, item.quantity + 1) : item
        )
      );
    };

    const decreaseQuantity = (productId: string) => {
      setItems((currentItems) =>
        currentItems.flatMap((item) => {
          if (item.id !== productId) {
            return item;
          }

          if (item.quantity <= 1) {
            return [];
          }

          return buildCartItem(item, item.quantity - 1);
        })
      );
    };

    const removeItem = (productId: string) => {
      setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
      setItems([]);
    };

    const subtotal = items.reduce((total, item) => total + item.originalSubtotal, 0);
    const discountAmount = items.reduce((total, item) => total + item.discountAmount, 0);
    const totalPrice = items.reduce((total, item) => total + item.subtotal, 0);

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal,
      discountAmount,
      totalPrice,
      guestId,
      isReady,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart
    };
  }, [guestId, isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
