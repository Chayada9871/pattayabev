import type { ReactNode } from "react";

import { formatPrice } from "@/lib/currency";

type SummaryLine = {
  id: string;
  name: string;
  quantity: number;
  subtotal: number;
};

type OrderSummaryCardProps = {
  title?: string;
  caption?: string;
  items: SummaryLine[];
  currency?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  footer?: ReactNode;
};

export function OrderSummaryCard({
  title = "สรุปรายการสั่งซื้อ",
  caption = "Order Summary",
  items,
  currency = "THB",
  subtotal,
  shippingFee,
  discountAmount,
  totalAmount,
  footer
}: OrderSummaryCardProps) {
  return (
    <aside className="border border-[#dcd6cb] bg-[#f8f8f8] shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#e1ddd5] px-5 py-4">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">{caption}</p>
        <h2 className="mt-2 text-[24px] font-extrabold text-[#171212]">{title}</h2>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="border border-[#dcd6cb] bg-white">
          <div className="divide-y divide-[#e1ddd5]">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-4 text-sm">
                <div className="min-w-0">
                  <p className="line-clamp-2 font-semibold uppercase tracking-[0.03em] text-[#171212]">{item.name}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#5f5852]">QTY: {item.quantity}</p>
                </div>
                <p className="shrink-0 font-extrabold text-[#171212]">{formatPrice(item.subtotal, currency)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-[#e1ddd5] px-4 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">ยอดรวมสินค้า</span>
              <span className="font-semibold text-[#171212]">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">ค่าจัดส่ง</span>
              <span className="font-semibold text-[#171212]">{formatPrice(shippingFee, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">ส่วนลด</span>
              <span className="font-semibold text-[#d02022]">
                {discountAmount > 0 ? `- ${formatPrice(discountAmount, currency)}` : formatPrice(0, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e1ddd5] pt-4">
              <span className="text-base font-extrabold text-[#171212]">รวมทั้งหมด</span>
              <span className="text-[32px] font-extrabold text-[#171212]">{formatPrice(totalAmount, currency)}</span>
            </div>
          </div>
        </div>

        {footer ? <div className="space-y-3">{footer}</div> : null}
      </div>
    </aside>
  );
}
