"use client";

import { useEffect, useState } from "react";

import type { CartProductInput } from "@/components/cart/cart-provider";
import { useCart } from "@/components/cart/cart-provider";

type AddToCartButtonProps = {
  product: CartProductInput;
  disabled?: boolean;
  label?: string;
  size?: "default" | "large";
};

export function AddToCartButton({
  product,
  disabled = false,
  label = "ใส่ตะกร้า",
  size = "default"
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsAdded(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [isAdded]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) {
          return;
        }

        addItem(product, 1);
        setIsAdded(true);
      }}
      className={[
        "inline-flex w-full items-center justify-center rounded-full font-bold transition",
        size === "large" ? "h-12 px-6 text-sm uppercase tracking-[0.14em]" : "h-11 px-5 text-sm",
        disabled
          ? "cursor-not-allowed border border-[#e1d8cd] bg-[#f5f1eb] text-[#9a9187]"
          : isAdded
            ? "bg-[#2437e8] text-white hover:bg-[#1d2ec4]"
            : "bg-[#171212] text-white hover:bg-[#2b2424]"
      ].join(" ")}
    >
      {disabled ? "สินค้าหมด" : isAdded ? "เพิ่มแล้ว" : label}
    </button>
  );
}
