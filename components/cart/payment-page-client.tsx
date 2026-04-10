"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OrderLinkPanel } from "@/components/cart/order-link-panel";
import { OrderSummaryCard } from "@/components/cart/order-summary-card";
import { ResponsiblePurchaseBanner } from "@/components/cart/responsible-purchase-banner";

type PaymentOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  subtotal: number;
};

type PaymentPageOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  deliveryMethod: string;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  paymentReference: string | null;
  providerName: string | null;
  items: PaymentOrderItem[];
};

type PaymentPageClientProps = {
  order: PaymentPageOrder | null;
};

function getPaymentMethodLabel(method: string) {
  if (method === "promptpay") return "พร้อมเพย์ QR";
  if (method === "card") return "บัตรเครดิต / เดบิต";
  if (method === "cod") return "เก็บเงินปลายทาง";
  return method;
}

function getDeliveryMethodLabel(method: string) {
  if (method === "express") return "จัดส่งด่วน";
  return "จัดส่งมาตรฐาน";
}

function getPaymentStatusLabel(status: string) {
  if (status === "paid") return "ชำระเงินสำเร็จ";
  if (status === "failed") return "ชำระเงินไม่สำเร็จ";
  if (status === "pending") return "รอตรวจสอบการชำระเงิน";
  return "ยังไม่ชำระเงิน";
}

function getOrderStatusLabel(status: string) {
  if (status === "processing") return "กำลังดำเนินการ";
  if (status === "completed") return "จัดส่งสำเร็จ";
  if (status === "cancelled") return "ยกเลิกแล้ว";
  return "รอชำระเงิน";
}

function getStatusText(order: PaymentPageOrder) {
  if (order.paymentStatus === "paid") {
    return "ระบบยืนยันการชำระเงินแล้ว คำสั่งซื้อของคุณกำลังเข้าสู่ขั้นตอนจัดเตรียมสินค้า";
  }

  if (order.paymentStatus === "failed") {
    return "การชำระเงินครั้งก่อนไม่สำเร็จ คุณสามารถเริ่มรายการชำระเงินใหม่ได้อีกครั้ง";
  }

  if (order.paymentMethod === "cod" && order.orderStatus === "processing") {
    return "คำสั่งซื้อได้รับการยืนยันแล้ว และจะชำระเงินเมื่อรับสินค้า";
  }

  return "ตรวจสอบข้อมูลคำสั่งซื้อและเลือกดำเนินการชำระเงินเพื่อยืนยันรายการ";
}

function sectionCardClassName() {
  return "border border-[#dcd6cb] bg-white";
}

function sectionTitleClassName() {
  return "border-b border-[#e5dfd5] px-5 py-4 text-[24px] font-extrabold text-[#171212]";
}

function sectionBodyClassName() {
  return "px-5 py-5";
}

function eyebrowClassName() {
  return "text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]";
}

function infoLabelClassName() {
  return "text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]";
}

export function PaymentPageClient({ order }: PaymentPageClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  if (!order) {
    return (
      <section className="border border-[#dcd6cb] bg-white text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <p className={eyebrowClassName()}>Payment</p>
          <h1 className="mt-3 text-4xl font-extrabold text-[#171212]">ไม่พบคำสั่งซื้อ</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5f5852]">
            กรุณากลับไปที่ตะกร้าสินค้าหรือหน้า Checkout เพื่อเริ่มคำสั่งซื้อใหม่
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center bg-[#171212] px-8 text-sm font-bold text-white transition hover:bg-[#2b2424]"
            >
              กลับไปที่ตะกร้า
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isAlreadyConfirmed =
    order.paymentStatus === "paid" || (order.paymentMethod === "cod" && order.orderStatus === "processing");

  const handleCreatePayment = async () => {
    setErrorMessage("");
    setServerMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderNumber: order.orderNumber })
      });

      const payload = (await response.json()) as {
        error?: string;
        session?: { redirectPath?: string; redirectUrl?: string | null; message?: string };
      };

      if (!response.ok || !payload.session) {
        throw new Error(payload.error || "ไม่สามารถเริ่มการชำระเงินได้");
      }

      setServerMessage(payload.session.message ?? "");
      if (payload.session.redirectUrl) {
        window.location.assign(payload.session.redirectUrl);
        return;
      }

      router.push(payload.session.redirectPath || `/payment/process?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถเริ่มการชำระเงินได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 text-[11px] uppercase tracking-[0.12em] text-[#8b6a2b]">หน้าแรก / ชำระเงิน</div>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <ResponsiblePurchaseBanner />

          <div className={sectionCardClassName()}>
            <div className={sectionTitleClassName()}>ชำระเงินสำหรับคำสั่งซื้อ</div>
            <div className={sectionBodyClassName()}>
              <div className="flex flex-col gap-4 border-b border-[#e5dfd5] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className={eyebrowClassName()}>Payment</p>
                  <h1 className="mt-2 text-[32px] font-extrabold leading-tight text-[#171212]">ตรวจสอบและยืนยันการชำระเงิน</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5852]">
                    หมายเลขคำสั่งซื้อ {order.orderNumber} พร้อมรายละเอียดสำหรับชำระเงินและติดตามสถานะคำสั่งซื้อของคุณ
                  </p>
                </div>

                <div className="border border-[#d7d1c7] bg-[#faf8f4] px-4 py-3 text-sm">
                  <p className={eyebrowClassName()}>Status</p>
                  <p className="mt-2 text-base font-extrabold text-[#171212]">{getPaymentStatusLabel(order.paymentStatus)}</p>
                  <p className="mt-1 text-sm text-[#5f5852]">{getOrderStatusLabel(order.orderStatus)}</p>
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-5 border border-[#efb8b8] bg-[#fff3f3] px-5 py-4 text-sm text-[#a32024]">{errorMessage}</div>
              ) : null}

              {serverMessage ? (
                <div className="mt-5 border border-[#f2d1b0] bg-[#fff6ec] px-5 py-4 text-sm text-[#7a5c2d]">{serverMessage}</div>
              ) : null}

              <div className="mt-5 border border-[#d7d1c7] bg-[#faf8f4] px-5 py-4 text-sm leading-7 text-[#5f5852]">
                {getStatusText(order)}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="border border-[#dcd6cb] bg-white p-5">
                  <p className={infoLabelClassName()}>Customer</p>
                  <h2 className="mt-2 text-[24px] font-extrabold text-[#171212]">ข้อมูลผู้สั่งซื้อ</h2>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <p className="text-[#8b6a2b]">ชื่อผู้สั่งซื้อ</p>
                      <p className="mt-1 font-semibold text-[#171212]">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-[#8b6a2b]">อีเมล</p>
                      <p className="mt-1 font-semibold text-[#171212]">{order.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-[#8b6a2b]">เบอร์โทรศัพท์</p>
                      <p className="mt-1 font-semibold text-[#171212]">{order.customerPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#dcd6cb] bg-white p-5">
                  <p className={infoLabelClassName()}>Payment Details</p>
                  <h2 className="mt-2 text-[24px] font-extrabold text-[#171212]">รายละเอียดการชำระเงิน</h2>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <p className="text-[#8b6a2b]">วิธีชำระเงิน</p>
                      <p className="mt-1 font-semibold text-[#171212]">{getPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-[#8b6a2b]">วิธีจัดส่ง</p>
                      <p className="mt-1 font-semibold text-[#171212]">{getDeliveryMethodLabel(order.deliveryMethod)}</p>
                    </div>
                    <div>
                      <p className="text-[#8b6a2b]">สถานะการชำระเงิน</p>
                      <p className="mt-1 font-semibold text-[#171212]">{getPaymentStatusLabel(order.paymentStatus)}</p>
                    </div>
                    {order.paymentReference ? (
                      <div>
                        <p className="text-[#8b6a2b]">อ้างอิงการชำระเงิน</p>
                        <p className="mt-1 break-all font-semibold text-[#171212]">{order.paymentReference}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 border border-[#dcd6cb] bg-white p-5">
                <p className={infoLabelClassName()}>Next Step</p>
                <h2 className="mt-2 text-[24px] font-extrabold text-[#171212]">
                  {order.paymentMethod === "cod" ? "ยืนยันคำสั่งซื้อเพื่อรอการจัดส่ง" : "ดำเนินการชำระเงินเพื่อยืนยันคำสั่งซื้อ"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5f5852]">
                  ระบบรองรับโครงสร้างสำหรับ PromptPay และบัตรเครดิต/เดบิต พร้อมการยืนยันสถานะจาก backend เพื่อให้ขั้นตอนชำระเงินมีความถูกต้องและตรวจสอบได้
                </p>
              </div>

              <div className="mt-4">
                <OrderLinkPanel orderNumber={order.orderNumber} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
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
              <>
                <button
                  type="button"
                  onClick={handleCreatePayment}
                  disabled={isSubmitting || isAlreadyConfirmed}
                  className={`inline-flex h-12 w-full items-center justify-center text-sm font-bold text-white transition ${
                    isSubmitting || isAlreadyConfirmed ? "cursor-not-allowed bg-[#b9b0a6]" : "bg-[#171212] hover:bg-[#2b2424]"
                  }`}
                >
                  {isAlreadyConfirmed
                    ? "คำสั่งซื้อได้รับการยืนยันแล้ว"
                    : isSubmitting
                      ? "กำลังสร้างคำขอชำระเงิน..."
                      : order.paymentMethod === "cod"
                        ? "ยืนยันคำสั่งซื้อ"
                        : "ดำเนินการชำระเงิน"}
                </button>
                <Link
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="inline-flex h-11 w-full items-center justify-center border border-[#d7d1c7] bg-white text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
                >
                  ดูสถานะคำสั่งซื้อ
                </Link>
              </>
            }
          />
        </div>
      </section>
    </div>
  );
}
