"use client";

import Link from "next/link";
import { useState } from "react";

type OrderLinkPanelProps = {
  orderNumber: string;
};

export function OrderLinkPanel({ orderNumber }: OrderLinkPanelProps) {
  const [copied, setCopied] = useState(false);
  const orderPath = `/order-confirmation/${orderNumber}`;

  const handleCopy = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = `${origin}${orderPath}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="border border-[#dcd6cb] bg-[#faf8f4] px-5 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ORDER LINK</p>
      <h3 className="mt-2 text-lg font-extrabold text-[#171212]">ลิงก์คำสั่งซื้อนี้</h3>
      <p className="mt-2 text-sm leading-7 text-[#5f5852]">
        ใช้ลิงก์นี้เพื่อกลับมาเปิดหน้าคำสั่งซื้อเดิม หรือนำไปส่งต่อให้ลูกค้าเพื่อตรวจสอบสถานะได้
      </p>
      <p className="mt-2 break-all text-sm text-[#171212]">{orderPath}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={orderPath}
          className="inline-flex h-11 items-center justify-center bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424]"
        >
          เปิดคำสั่งซื้อนี้
        </Link>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-5 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
        >
          {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
        </button>
      </div>
    </div>
  );
}
