"use client";

import { useEffect, useState } from "react";

import type { CartProductInput } from "@/components/cart/cart-provider";
import { useCart } from "@/components/cart/cart-provider";

type ProductPurchaseControlsProps = {
  product: CartProductInput;
  disabled?: boolean;
};

export function ProductPurchaseControls({
  product,
  disabled = false
}: ProductPurchaseControlsProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex h-12 items-center rounded-full border border-[#d9cfbf] bg-white px-2 shadow-[0_6px_16px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          aria-label="ลดจำนวนสินค้า"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-[#171212] transition hover:bg-[#f7f1e7]"
        >
          -
        </button>
        <span className="min-w-[40px] text-center text-sm font-bold text-[#171212]">{quantity}</span>
        <button
          type="button"
          aria-label="เพิ่มจำนวนสินค้า"
          onClick={() => setQuantity((current) => Math.min(99, current + 1))}
          className="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-[#171212] transition hover:bg-[#f7f1e7]"
        >
          +
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          addItem(product, quantity);
          setIsAdded(true);
        }}
        className={[
          "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold uppercase tracking-[0.14em] transition",
          disabled
            ? "cursor-not-allowed border border-[#e1d8cd] bg-[#f5f1eb] text-[#9a9187]"
            : isAdded
              ? "bg-[#2437e8] text-white hover:bg-[#1d2ec4]"
              : "bg-[#171212] text-white hover:bg-[#2b2424]"
        ].join(" ")}
      >
        {disabled ? "สินค้าหมด" : isAdded ? "เพิ่มแล้ว" : "ใส่ตะกร้า"}
      </button>
    </div>
  );
}
