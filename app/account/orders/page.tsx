import type { Metadata } from "next";
import Link from "next/link";

import { AccountMetricCard, AccountSectionCard, AccountShell } from "@/components/account/account-shell";
import { formatPrice } from "@/lib/currency";
import { requireSession } from "@/lib/auth";
import { getBusinessAccountSummary, getBusinessStatusLabel } from "@/lib/business";
import { canRetryPayment, formatOrderDate, getOrderStatusLabel } from "@/lib/order-display";
import { getOrdersByUserId } from "@/lib/orders";

export const metadata: Metadata = {
  title: "คำสั่งซื้อของฉัน | PattayaBev",
  description: "ดูรายการออเดอร์ล่าสุด ติดตามสถานะ และชำระเงินสำหรับรายการที่ยังค้างอยู่"
};

function getAction(order: {
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
}) {
  if (canRetryPayment(order.paymentMethod, order.paymentStatus)) {
    return {
      label: "ชำระเงินจริง",
      href: `/payment/process?order=${encodeURIComponent(order.orderNumber)}`
    };
  }

  return null;
}

export default async function AccountOrdersPage() {
  const session = await requireSession();
  const fullName = session.user.name?.trim() || "สมาชิก PattayaBev";
  const email = session.user.email || "-";

  const [business, orders] = await Promise.all([
    getBusinessAccountSummary(String(session.user.id)),
    getOrdersByUserId(String(session.user.id), 20)
  ]);

  const b2bStatusLabel = getBusinessStatusLabel(business.status);
  const unpaidOrders = orders.filter((order) => ["unpaid", "failed", "expired"].includes(order.paymentStatus)).length;
  const pendingOrders = orders.filter((order) => order.paymentStatus === "pending").length;
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;

  return (
    <AccountShell currentSection="orders" fullName={fullName} email={email} b2bStatusLabel={b2bStatusLabel}>
      <AccountSectionCard
        id="orders"
        title="คำสั่งซื้อของฉัน"
        subtitle="ดูรายการออเดอร์ทั้งหมด เปิดรายละเอียดแต่ละออเดอร์ และติดตามสถานะการชำระเงินได้จากหน้านี้"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <AccountMetricCard label="ออเดอร์ทั้งหมด" value={String(orders.length)} />
          <AccountMetricCard label="รอชำระเงิน" value={String(unpaidOrders)} />
          <AccountMetricCard label="รอยืนยันการชำระเงิน" value={String(pendingOrders)} />
          <AccountMetricCard label="ชำระแล้ว" value={String(paidOrders)} />
        </div>

        {orders.length ? (
          <div className="mt-6 space-y-3">
            {orders.map((order) => {
              const action = getAction(order);

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 border border-[#dcd6cb] bg-[#fffcf8] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">หมายเลขคำสั่งซื้อ</p>
                    <p className="mt-1 text-base font-extrabold text-[#171212]">{order.orderNumber}</p>
                    <p className="mt-2 text-sm text-[#5f5852]">
                      {getOrderStatusLabel(order.orderStatus, order.paymentStatus)} เมื่อ {formatOrderDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[120px] text-right">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8f8579]">ยอดสุทธิ</p>
                      <p className="mt-1 text-lg font-extrabold text-[#171212]">{formatPrice(order.totalAmount, order.currency)}</p>
                    </div>

                    {action ? (
                      <Link
                        href={action.href}
                        className="inline-flex h-11 items-center justify-center border border-[#171212] bg-white px-5 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
                      >
                        {action.label}
                      </Link>
                    ) : null}

                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="inline-flex h-11 items-center justify-center bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424]"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 border border-dashed border-[#d8cec0] bg-[#fffcf8] px-4 py-5 text-sm text-[#5f5852]">
            ยังไม่มีคำสั่งซื้อในบัญชีนี้ เมื่อสั่งซื้อแล้ว รายการออเดอร์จะแสดงที่หน้านี้
          </div>
        )}
      </AccountSectionCard>
    </AccountShell>
  );
}
