import { RESPONSIBLE_PURCHASE_NOTICE } from "@/lib/checkout-config";

export function ResponsiblePurchaseBanner() {
  return (
    <div className="rounded-[24px] border border-[#f2d1b0] bg-[#fff6ec] px-5 py-4 text-sm leading-7 text-[#6f4a1f]">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c37318]">Responsible Purchase</p>
      <p className="mt-2">{RESPONSIBLE_PURCHASE_NOTICE}</p>
    </div>
  );
}
