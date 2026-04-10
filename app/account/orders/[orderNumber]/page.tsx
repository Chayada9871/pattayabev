import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountSectionCard, AccountShell } from "@/components/account/account-shell";
import { OrderSummaryCard } from "@/components/cart/order-summary-card";
import { requireSession } from "@/lib/auth";
import { getBusinessAccountSummary, getBusinessStatusLabel } from "@/lib/business";
import {
  canRetryPayment,
  formatOrderDate,
  getPaymentMethodLabel,
  getPaymentStatusLabel
} from "@/lib/order-display";
import { getOrderByOrderNumberForUser } from "@/lib/orders";

export const metadata: Metadata = {
  title: "รายละเอียดคำสั่งซื้อ | PattayaBev",
  description: "ดูสถานะการชำระเงิน รายการสินค้า และข้อมูลจัดส่งของคำสั่งซื้อ"
};

function InfoCard({
  label,
  value,
  breakAll = false
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="border border-[#dcd6cb] bg-white px-4 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">{label}</p>
      <p className={`mt-2 text-base font-extrabold text-[#171212] ${breakAll ? "break-all text-sm leading-6" : ""}`}>{value}</p>
    </div>
  );
}

export default async function AccountOrderDetailPage({
  params
}: {
  params: { orderNumber: string };
}) {
  const session = await requireSession();
  const fullName = session.user.name?.trim() || "สมาชิก PattayaBev";
  const email = session.user.email || "-";

  const [business, order] = await Promise.all([
    getBusinessAccountSummary(String(session.user.id)),
    getOrderByOrderNumberForUser(String(session.user.id), params.orderNumber)
  ]);

  if (!order) {
    notFound();
  }

  const b2bStatusLabel = getBusinessStatusLabel(business.status);
  const shippingAddressText = [
    order.shippingAddress.addressLine1,
    order.shippingAddress.addressLine2,
    order.shippingAddress.subdistrict,
    order.shippingAddress.district,
    order.shippingAddress.province,
    order.shippingAddress.postalCode
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AccountShell currentSection="orders" fullName={fullName} email={email} b2bStatusLabel={b2bStatusLabel}>
      <AccountSectionCard
        id="order-detail"
        title={`คำสั่งซื้อ ${order.orderNumber}`}
        subtitle="ดูสถานะการชำระเงิน รายการสินค้า และข้อมูลจัดส่งในหน้าเดียว"
      >
        <div className={`grid gap-4 ${order.paymentReference ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          <InfoCard label="วิธีชำระเงิน" value={getPaymentMethodLabel(order.paymentMethod)} />
          <InfoCard label="สถานะการชำระเงิน" value={getPaymentStatusLabel(order.paymentStatus)} />
          <InfoCard label="วันที่สั่งซื้อ" value={formatOrderDate(order.createdAt)} />
          {order.paymentReference ? (
            <InfoCard label="อ้างอิงการชำระเงิน" value={order.paymentReference} breakAll />
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {canRetryPayment(order.paymentMethod, order.paymentStatus) ? (
            <Link
              href={`/payment/process?order=${encodeURIComponent(order.orderNumber)}`}
              className="inline-flex h-11 items-center justify-center bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
            >
              ชำระเงินจริง
            </Link>
          ) : null}

          {order.paymentStatus === "paid" ? (
            <Link
              href={`/order-confirmation/${order.orderNumber}/invoice`}
              className="inline-flex h-11 items-center justify-center border border-[#171212] bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
            >
              เปิดใบเสร็จ
            </Link>
          ) : null}

          <Link
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-6 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
          >
            กลับไปหน้าคำสั่งซื้อ
          </Link>
        </div>
      </AccountSectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <AccountSectionCard
            id="shipping"
            title="ข้อมูลจัดส่ง"
            subtitle="ใช้ตรวจสอบชื่อผู้รับ เบอร์โทร และที่อยู่ปลายทาง"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="ชื่อผู้รับ" value={order.shippingAddress.fullName} />
              <InfoCard label="เบอร์โทรศัพท์" value={order.shippingAddress.phone} />

              <div className="border border-[#dcd6cb] bg-white px-4 py-4 md:col-span-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ที่อยู่จัดส่ง</p>
                <p className="mt-2 text-sm leading-7 text-[#171212]">{shippingAddressText || "-"}</p>
              </div>

              <div className="border border-[#dcd6cb] bg-white px-4 py-4 md:col-span-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">หมายเหตุคำสั่งซื้อ</p>
                <p className="mt-2 text-sm leading-7 text-[#171212]">{order.notes || "-"}</p>
              </div>
            </div>
          </AccountSectionCard>
        </div>

        <div className="xl:sticky xl:top-24 xl:h-fit">
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
          />
        </div>
      </div>
    </AccountShell>
  );
}
