"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { OrderSummaryCard } from "@/components/cart/order-summary-card";
import { canRetryPayment, getPaymentStatusLabel } from "@/lib/order-display";

type PaymentStatusMode = "pending" | "success" | "failed";

type PaymentStatusOrder = {
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  paymentReference: string | null;
  currency: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  customerName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    subtotal: number;
  }>;
};

type PaymentStatusPageClientProps = {
  orderNumber: string;
  mode: PaymentStatusMode;
  reason?: string;
};

function sectionCardClassName() {
  return "border border-[#dcd6cb] bg-white";
}

function sectionTitleClassName() {
  return "border-b border-[#e5dfd5] px-5 py-4 text-[24px] font-extrabold text-[#171212]";
}

function sectionBodyClassName() {
  return "px-5 py-5";
}

function getToneClassName(tone: "success" | "warning" | "error") {
  if (tone === "success") {
    return "border-[#c8e6cf] bg-[#f4fbf5] text-[#245c33]";
  }

  if (tone === "error") {
    return "border-[#f0b7b8] bg-[#fff1f1] text-[#9d2022]";
  }

  return "border-[#f2d1b0] bg-[#fff6ec] text-[#7a5c2d]";
}

function getHeadline(mode: PaymentStatusMode, order: PaymentStatusOrder | null, reason?: string) {
  if (order?.paymentStatus === "paid") {
    return {
      title: "ชำระเงินสำเร็จ",
      description: "ระบบยืนยันการชำระเงินแล้ว คุณสามารถกลับไปดูคำสั่งซื้อหรือเปิดใบเสร็จได้ทันที",
      tone: "success" as const
    };
  }

  if (order?.paymentStatus === "failed") {
    return {
      title: "ชำระเงินไม่สำเร็จ",
      description: "ยังไม่สามารถยืนยันการชำระเงินได้ คุณสามารถลองชำระเงินใหม่อีกครั้ง",
      tone: "error" as const
    };
  }

  if (order?.paymentStatus === "expired") {
    return {
      title: "ลิงก์ชำระเงินหมดอายุ",
      description: "รายการชำระเงินเดิมหมดอายุแล้ว กรุณาเริ่มชำระเงินใหม่อีกครั้ง",
      tone: "warning" as const
    };
  }

  if (mode === "failed") {
    return {
      title: reason === "cancelled" ? "คุณยกเลิกการชำระเงิน" : "ชำระเงินไม่สำเร็จ",
      description:
        reason === "cancelled"
          ? "คำสั่งซื้อยังถูกเก็บไว้ตามเดิม คุณสามารถกลับมาชำระเงินเมื่อพร้อมได้"
          : "ระบบยังไม่ได้รับการยืนยันจากผู้ให้บริการชำระเงิน กรุณาลองใหม่อีกครั้ง",
      tone: "error" as const
    };
  }

  return {
    title: "รอยืนยันการชำระเงิน",
    description: "ระบบได้รับข้อมูลการชำระแล้ว และกำลังรอผลยืนยันจากผู้ให้บริการชำระเงิน",
    tone: "warning" as const
  };
}

function shouldPoll(mode: PaymentStatusMode, paymentStatus: string | undefined) {
  if (paymentStatus === "paid" || paymentStatus === "failed" || paymentStatus === "expired") {
    return false;
  }

  return mode === "pending" || mode === "success";
}

export function PaymentStatusPageClient({
  orderNumber,
  mode,
  reason
}: PaymentStatusPageClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<PaymentStatusOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
          cache: "no-store"
        });

        const payload = (await response.json()) as {
          error?: string;
          order?: PaymentStatusOrder;
        };

        if (!response.ok || !payload.order) {
          throw new Error(payload.error || "ไม่สามารถตรวจสอบสถานะคำสั่งซื้อได้");
        }

        if (!isMounted) {
          return;
        }

        setOrder(payload.order);
        setErrorMessage("");

        if (mode === "pending") {
          if (payload.order.paymentStatus === "paid") {
            router.replace(`/payment/success?order=${encodeURIComponent(orderNumber)}`);
            return;
          }

          if (payload.order.paymentStatus === "failed" || payload.order.paymentStatus === "expired") {
            router.replace(
              `/payment/failed?order=${encodeURIComponent(orderNumber)}&status=${encodeURIComponent(payload.order.paymentStatus)}`
            );
            return;
          }
        }

        if (shouldPoll(mode, payload.order.paymentStatus)) {
          timer = setTimeout(loadOrder, 4000);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถตรวจสอบสถานะคำสั่งซื้อได้");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrder();

    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [mode, orderNumber, router]);

  const headline = getHeadline(mode, order, reason);
  const isPaid = order?.paymentStatus === "paid";
  const canRetry = order ? canRetryPayment(order.paymentMethod, order.paymentStatus) : false;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/account/orders");
  };

  useEffect(() => {
    if (mode !== "success" || !isPaid) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(`/order-confirmation/${encodeURIComponent(orderNumber)}`);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [isPaid, mode, orderNumber, router]);

  return (
    <div>
      <div className="mb-4 text-[11px] uppercase tracking-[0.12em] text-[#8b6a2b]">
        หน้าแรก / ชำระเงินจริง / สถานะคำสั่งซื้อ
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className={sectionCardClassName()}>
            <div className={sectionTitleClassName()}>{headline.title}</div>
            <div className={sectionBodyClassName()}>
              <div className={`border px-5 py-4 text-sm leading-7 ${getToneClassName(headline.tone)}`}>
                <p>{headline.description}</p>
                {mode === "success" && isPaid ? (
                  <p className="mt-2 font-semibold">ระบบจะพากลับไปหน้าคำสั่งซื้ออัตโนมัติในอีกไม่กี่วินาที</p>
                ) : null}
                {shouldPoll(mode, order?.paymentStatus) ? (
                  <p className="mt-2 font-semibold">หน้านี้จะอัปเดตอัตโนมัติเมื่อระบบได้รับผลยืนยันจาก webhook</p>
                ) : null}
              </div>

              {errorMessage ? (
                <div className="mt-4 border border-[#efb8b8] bg-[#fff3f3] px-4 py-3 text-sm text-[#a32024]">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="border border-[#dcd6cb] bg-white p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">หมายเลขคำสั่งซื้อ</p>
                  <p className="mt-2 text-lg font-extrabold text-[#171212]">{orderNumber}</p>
                </div>
                <div className="border border-[#dcd6cb] bg-white p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">สถานะล่าสุด</p>
                  <p className="mt-2 text-lg font-extrabold text-[#171212]">
                    {order ? getPaymentStatusLabel(order.paymentStatus) : isLoading ? "กำลังตรวจสอบ" : "-"}
                  </p>
                </div>
              </div>

              {order?.paymentReference ? (
                <div className="mt-4 border border-[#dcd6cb] bg-[#faf8f4] px-4 py-4 text-sm leading-7 text-[#5f5852]">
                  อ้างอิงการชำระเงิน: <span className="font-semibold text-[#171212]">{order.paymentReference}</span>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-6 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
                >
                  back
                </button>

                {canRetry ? (
                  <Link
                    href={`/payment/process?order=${encodeURIComponent(orderNumber)}`}
                    className="inline-flex h-11 items-center justify-center bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
                  >
                    ไปชำระเงินอีกครั้ง
                  </Link>
                ) : null}

                <Link
                  href={`/order-confirmation/${encodeURIComponent(orderNumber)}`}
                  className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-6 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
                >
                  ดูคำสั่งซื้อนี้
                </Link>

                {isPaid ? (
                  <Link
                    href={`/order-confirmation/${encodeURIComponent(orderNumber)}/invoice`}
                    className="inline-flex h-11 items-center justify-center border border-[#171212] bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
                  >
                    เปิดใบเสร็จ
                  </Link>
                ) : null}

                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-6 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
                >
                  กลับไปเลือกสินค้า
                </Link>
              </div>

            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-6 xl:h-fit">
          {order ? (
            <OrderSummaryCard
              items={order.items.map((item) => ({
                id: item.productId,
                name: item.productName,
                quantity: item.quantity,
                subtotal: item.subtotal
              }))}
              currency={order.currency}
              subtotal={order.subtotal}
              shippingFee={order.shippingFee}
              discountAmount={order.discountAmount}
              totalAmount={order.totalAmount}
              footer={
                <div className="border border-[#dcd6cb] bg-white px-4 py-4 text-sm leading-7 text-[#5f5852]">
                  <p>
                    ผู้สั่งซื้อ: <span className="font-semibold text-[#171212]">{order.customerName}</span>
                  </p>
                  {shouldPoll(mode, order.paymentStatus) ? (
                    <p className="mt-2">หากระบบยังไม่อัปเดตทันที กรุณารอสักครู่เพื่อให้ webhook ส่งผลยืนยันกลับเข้าระบบ</p>
                  ) : null}
                </div>
              }
            />
          ) : (
            <div className="border border-[#dcd6cb] bg-white px-5 py-6 text-sm text-[#5f5852]">
              กำลังโหลดข้อมูลคำสั่งซื้อ...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
