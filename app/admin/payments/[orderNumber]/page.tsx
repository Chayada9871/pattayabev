import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import {
  AdminShell,
  adminPrimaryActionClass,
  adminSecondaryActionClass
} from "@/components/admin/admin-shell";
import { PaymentManagementForm } from "@/components/admin/payment-management-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/lib/auth";
import { getAdminPaymentDetail } from "@/lib/admin-payments";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(new Date(value));
}

function getPaymentMethodLabel(method: string) {
  if (method === "promptpay") return "พร้อมเพย์ QR";
  if (method === "card") return "บัตรเครดิต / เดบิต";
  if (method === "cod") return "เก็บเงินปลายทาง";
  return method || "-";
}

function getPaymentStatusLabel(status: string) {
  if (status === "paid") return "ชำระแล้ว";
  if (status === "pending") return "รอตรวจสอบ";
  if (status === "failed") return "ชำระไม่สำเร็จ";
  if (status === "expired") return "หมดอายุ";
  if (status === "refunded") return "คืนเงินแล้ว";
  return "ยังไม่ชำระ";
}

function getOrderStatusLabel(status: string) {
  if (status === "pending_payment") return "รอชำระเงิน";
  if (status === "paid") return "ชำระแล้ว";
  if (status === "processing") return "กำลังเตรียมสินค้า";
  if (status === "shipped") return "จัดส่งแล้ว";
  if (status === "completed") return "เสร็จสิ้น";
  if (status === "cancelled") return "ยกเลิก";
  if (status === "cart") return "ในตะกร้า";
  return status || "-";
}

function SummaryStat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[22px] border border-[#ece4d6] bg-white px-4 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8b6a2b]">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-[#171212]">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-6 text-[#625b54]">{helper}</p> : null}
    </div>
  );
}

export default async function AdminPaymentDetailPage({
  params
}: {
  params: { orderNumber: string };
}) {
  noStore();

  await requireRole("admin");

  const detail = await getAdminPaymentDetail(params.orderNumber);

  if (!detail) {
    notFound();
  }

  const order = detail.order;
  const latestPayment = detail.payments[0];

  return (
    <AdminShell
      currentPath="/admin/payments"
      eyebrow="PattayaBev Admin"
      title={`ดูแลการชำระเงิน ${order.orderNumber}`}
      description="ตรวจสอบข้อมูลการชำระเงินจากระบบหลังบ้าน อัปเดตสถานะคำสั่งซื้อ และเปิดดูข้อมูลจาก gateway ได้จากหน้านี้"
      actions={
        <>
          <Link className={adminSecondaryActionClass} href="/admin/payments">
            กลับหน้ารายการชำระเงิน
          </Link>
          <Link className={adminSecondaryActionClass} href={`/order-confirmation/${order.orderNumber}`}>
            ดูหน้าคำสั่งซื้อ
          </Link>
          {order.paymentStatus === "paid" ? (
            <Link className={adminSecondaryActionClass} href={`/order-confirmation/${order.orderNumber}/invoice`}>
              ดูใบเสร็จ
            </Link>
          ) : null}
          <LogoutButton className={adminPrimaryActionClass} redirectTo="/login" />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="วิธีชำระเงิน"
          value={getPaymentMethodLabel(order.paymentMethod)}
          helper="วิธีที่ลูกค้าเลือกตอนสั่งซื้อ"
        />
        <SummaryStat
          label="สถานะการชำระเงิน"
          value={getPaymentStatusLabel(order.paymentStatus)}
          helper="สถานะนี้จะแสดงในหน้าลูกค้าด้วย"
        />
        <SummaryStat
          label="สถานะคำสั่งซื้อ"
          value={getOrderStatusLabel(order.orderStatus)}
          helper="ใช้ติดตามว่าออเดอร์อยู่ขั้นตอนไหน"
        />
        <SummaryStat
          label="ยอดรวมคำสั่งซื้อ"
          value={formatPrice(order.totalAmount, order.currency)}
          helper={`สร้างเมื่อ ${formatDateTime(order.createdAt)}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <section className="space-y-6">
          <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="border-b border-[#ece4d6] pb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">อัปเดตสถานะ</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#171212]">แก้ไขผลการชำระเงิน</h2>
              <p className="mt-3 text-sm leading-7 text-[#5f5852]">
                ใช้ส่วนนี้เมื่อคุณตรวจสอบผลการรับเงินจริงแล้ว และต้องการให้สถานะในระบบตรงกับข้อมูลจริง
              </p>
            </div>

            <div className="mt-6">
              <PaymentManagementForm
                orderId={order.id}
                orderNumber={order.orderNumber}
                providerName={latestPayment?.providerName ?? order.gatewayProvider}
                paymentReference={latestPayment?.paymentReference ?? order.paymentReference ?? order.orderNumber}
                transactionRef={latestPayment?.transactionRef ?? order.gatewayReference}
                paymentStatus={order.paymentStatus}
                orderStatus={order.orderStatus}
                paymentMethodType={latestPayment?.paymentMethodType ?? order.paymentMethod}
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">
                  ประวัติการชำระเงิน
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#171212]">ข้อมูลจากระบบชำระเงิน</h2>
              </div>
            </div>

            {detail.payments.length ? (
              <div className="mt-6 space-y-4">
                {detail.payments.map((payment) => (
                  <article key={payment.id} className="rounded-[22px] border border-[#ece4d6] bg-[#fffcf8] p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
                          ผู้ให้บริการ
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#171212]">{payment.providerName}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
                          เลขอ้างอิงการชำระเงิน
                        </p>
                        <p className="mt-2 break-all text-sm font-semibold leading-6 text-[#171212]">
                          {payment.paymentReference}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
                          เลขอ้างอิงธุรกรรม
                        </p>
                        <p className="mt-2 break-all text-sm font-semibold leading-6 text-[#171212]">
                          {payment.transactionRef ?? "-"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
                          สถานะ
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#171212]">
                          {getPaymentStatusLabel(payment.paymentStatus)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                      <details className="rounded-[18px] border border-[#ece4d6] bg-white px-4 py-3">
                        <summary className="cursor-pointer text-sm font-bold text-[#171212]">
                          ข้อมูลตอบกลับจากระบบชำระเงิน
                        </summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#5f5852]">
                          {payment.rawResponse}
                        </pre>
                      </details>
                      <details className="rounded-[18px] border border-[#ece4d6] bg-white px-4 py-3">
                        <summary className="cursor-pointer text-sm font-bold text-[#171212]">
                          ข้อมูลแจ้งเตือนอัตโนมัติ
                        </summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#5f5852]">
                          {payment.rawWebhookJson}
                        </pre>
                      </details>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#d8cec0] bg-[#fbf7f0] px-6 py-10 text-center text-sm leading-7 text-[#5f5852]">
                ยังไม่มีประวัติการชำระเงินที่ถูกบันทึกไว้สำหรับคำสั่งซื้อนี้
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="border-b border-[#ece4d6] pb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">สรุปคำสั่งซื้อ</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#171212]">ข้อมูลลูกค้าและยอดรวม</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[20px] border border-[#ece4d6] px-4 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ลูกค้า</p>
                <p className="mt-2 text-sm font-semibold text-[#171212]">{order.customerName}</p>
                <p className="mt-1 text-sm text-[#5f5852]">{order.customerEmail}</p>
                <p className="mt-1 text-sm text-[#5f5852]">{order.customerPhone}</p>
              </div>

              <div className="rounded-[20px] border border-[#ece4d6] px-4 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
                  ที่อยู่จัดส่ง
                </p>
                <p className="mt-2 text-sm leading-7 text-[#171212]">
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
                </p>
              </div>

              <div className="rounded-[20px] border border-[#ece4d6] px-4 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ยอดสรุป</p>
                <div className="mt-3 space-y-3 text-sm text-[#171212]">
                  <div className="flex items-center justify-between">
                    <span>ราคาสินค้า</span>
                    <span className="font-semibold">{formatPrice(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span className="font-semibold">{formatPrice(order.shippingFee, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ส่วนลด</span>
                    <span className="font-semibold text-[#d02022]">
                      {order.discountAmount > 0
                        ? `- ${formatPrice(order.discountAmount, order.currency)}`
                        : formatPrice(0, order.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#ece4d6] pt-3">
                    <span className="text-base font-extrabold">รวมทั้งหมด</span>
                    <span className="text-2xl font-extrabold">
                      {formatPrice(order.totalAmount, order.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#ece4d6] px-4 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">รายการสินค้า</p>
                <div className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-4 border-b border-[#f0ebe1] pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#171212]">{item.productName}</p>
                        <p className="mt-1 text-xs text-[#5f5852]">จำนวน: {item.quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-[#171212]">
                        {formatPrice(item.subtotal, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
