"use client";

import type { CartProductInput } from "@/components/cart/cart-provider";
import { useCart } from "@/components/cart/cart-provider";

type ProductCardCartControlProps = {
  product: CartProductInput;
  disabled?: boolean;
};

export function ProductCardCartControl({
  product,
  disabled = false
}: ProductCardCartControlProps) {
  const { items, addItem, increaseQuantity, decreaseQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#e1d8cd] bg-[#f5f1eb] px-5 text-sm font-bold text-[#9a9187]"
      >
        สินค้าหมด
      </button>
    );
  }

  if (quantity > 0) {
    return (
      <div className="inline-flex h-11 w-full items-center rounded-full border border-[#d9cfbf] bg-white px-2 shadow-[0_6px_16px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          aria-label="ลดจำนวนสินค้า"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            decreaseQuantity(product.id);
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-[#171212] transition hover:bg-[#f7f1e7]"
        >
          -
        </button>
        <span className="flex-1 text-center text-sm font-bold text-[#171212]">{quantity}</span>
        <button
          type="button"
          aria-label="เพิ่มจำนวนสินค้า"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            increaseQuantity(product.id);
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-[#171212] transition hover:bg-[#f7f1e7]"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem(product, 1);
      }}
      className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424]"
    >
      ใส่ตะกร้า
    </button>
  );
}
