import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderSummaryCard } from "@/components/cart/order-summary-card";
import { ResponsiblePurchaseBanner } from "@/components/cart/responsible-purchase-banner";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getServerSession } from "@/lib/auth";
import {
  canRetryPayment,
  getOrderStatusHeadline,
  getPaymentStatusLabel
} from "@/lib/order-display";
import { getCheckoutSchemaMessage, getOrderByOrderNumber } from "@/lib/orders";

function getToneClassName(tone: "success" | "warning" | "error") {
  if (tone === "success") {
    return "border-[#c8e6cf] bg-[#f4fbf5]";
  }

  if (tone === "error") {
    return "border-[#f0b7b8] bg-[#fff1f1]";
  }

  return "border-[#f2d1b0] bg-[#fff6ec]";
}

export default async function OrderConfirmationPage({
  params
}: {
  params: { orderNumber: string };
}) {
  const session = await getServerSession();
  let order = null;
  let schemaMessage = "";

  try {
    order = await getOrderByOrderNumber(params.orderNumber);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === getCheckoutSchemaMessage()) {
      schemaMessage = message;
    } else {
      throw error;
    }
  }

  if (session && order?.userId === String(session.user.id)) {
    redirect(`/account/orders/${encodeURIComponent(order.orderNumber)}`);
  }

  const status = order
    ? getOrderStatusHeadline({
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      })
    : {
        title: "ไม่พบคำสั่งซื้อ",
        description: "กรุณาตรวจสอบหมายเลขคำสั่งซื้ออีกครั้ง หรือกลับไปเลือกสินค้าจากหน้าเว็บไซต์",
        tone: "error" as const
      };

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-8">
        {schemaMessage ? (
          <div className="mb-6 border border-[#f2d1b0] bg-[#fff6ec] px-5 py-4 text-sm text-[#7a5c2d]">
            {schemaMessage}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <ResponsiblePurchaseBanner />

            <section className="border border-[#dcd6cb] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <div className="border-b border-[#e5dfd5] px-5 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ORDER STATUS</p>
                <h1 className="mt-2 text-[32px] font-extrabold text-[#171212]">{status.title}</h1>
                <p className="mt-3 text-sm leading-7 text-[#5f5852]">{status.description}</p>
              </div>

              <div className="px-5 py-5">
                {order ? (
                  <>
                    <div className={`border px-5 py-5 ${getToneClassName(status.tone)}`}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">หมายเลขคำสั่งซื้อ</p>
                          <p className="mt-2 text-lg font-extrabold text-[#171212]">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">สถานะการชำระเงิน</p>
                          <p className="mt-2 text-lg font-extrabold text-[#171212]">{getPaymentStatusLabel(order.paymentStatus)}</p>
                        </div>
                      </div>

                      {order.paymentReference ? (
                        <p className="mt-4 text-sm text-[#5f5852]">
                          อ้างอิงการชำระเงิน: <span className="break-all font-semibold text-[#171212]">{order.paymentReference}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {canRetryPayment(order.paymentMethod, order.paymentStatus) ? (
                        <Link
                          href={`/payment/process?order=${encodeURIComponent(order.orderNumber)}`}
                          className="inline-flex h-11 items-center justify-center bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
                        >
                          ไปชำระเงินจริง
                        </Link>
                      ) : null}

                      {order.paymentStatus === "paid" ? (
                        <Link
                          href={`/order-confirmation/${encodeURIComponent(order.orderNumber)}/invoice`}
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
                  </>
                ) : (
                  <div className="mt-2">
                    <Link
                      href="/products"
                      className="inline-flex h-11 items-center justify-center bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
                    >
                      กลับไปเลือกสินค้า
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit">
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
                      ชื่อผู้รับ: <span className="font-semibold text-[#171212]">{order.shippingAddress.fullName}</span>
                    </p>
                    <p className="mt-2">
                      ที่อยู่จัดส่ง:{" "}
                      <span className="font-semibold text-[#171212]">
                        {[
                          order.shippingAddress.addressLine1,
                          order.shippingAddress.addressLine2,
                          order.shippingAddress.subdistrict,
                          order.shippingAddress.district,
                          order.shippingAddress.province,
                          order.shippingAddress.postalCode
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </p>
                  </div>
                }
              />
            ) : null}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
