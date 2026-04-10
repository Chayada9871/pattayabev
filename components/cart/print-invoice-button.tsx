"use client";

type PrintInvoiceButtonProps = {
  className?: string;
};

export function PrintInvoiceButton({ className }: PrintInvoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "inline-flex h-11 items-center justify-center bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424]"
      }
    >
      พิมพ์ใบเสร็จ
    </button>
  );
}
