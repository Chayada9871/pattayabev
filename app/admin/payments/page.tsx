import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import {
  AdminShell,
  adminPrimaryActionClass,
  adminSecondaryActionClass
} from "@/components/admin/admin-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/lib/auth";
import {
  getAdminPayments,
  getAdminPaymentSummary,
  type AdminPaymentListItem
} from "@/lib/admin-payments";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(new Date(value));
}

function getStatusPillClass(status: string) {
  if (status === "paid") return "bg-[#edf7ef] text-[#207443] border-[#d6eadc]";
  if (status === "pending" || status === "unpaid") return "bg-[#fff7e8] text-[#9a5d00] border-[#eedeb2]";
  return "bg-[#fbe9e9] text-[#a61b1f] border-[#f3d1d3]";
}

function getPaymentStatusLabel(status: string) {
  if (status === "paid") return "ชำระแล้ว";
  if (status === "pending") return "รอตรวจสอบ";
  if (status === "failed") return "ชำระไม่สำเร็จ";
  if (status === "expired") return "หมดอายุ";
  if (status === "refunded") return "คืนเงินแล้ว";
  return "ยังไม่ชำระ";
}

function getPaymentMethodLabel(method: string) {
  if (method === "promptpay") return "พร้อมเพย์ QR";
  if (method === "card") return "บัตรเครดิต / เดบิต";
  if (method === "cod") return "เก็บเงินปลายทาง";
  return method || "-";
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

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-[#ece4d6] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-[#171212]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#625b54]">{helper}</p>
    </div>
  );
}

function PaymentRow({ payment }: { payment: AdminPaymentListItem }) {
  return (
    <article className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">คำสั่งซื้อ</p>
          <h3 className="mt-2 text-xl font-extrabold text-[#171212]">{payment.orderNumber}</h3>
          <p className="mt-2 text-sm text-[#5f5852]">
            {payment.customerName} โดย {payment.customerEmail}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">ยอดรวม</p>
          <p className="mt-2 text-2xl font-extrabold text-[#171212]">
            {formatPrice(payment.totalAmount, payment.currency)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
            สถานะการชำระเงิน
          </p>
          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusPillClass(payment.paymentStatus)}`}
          >
            {getPaymentStatusLabel(payment.paymentStatus)}
          </span>
        </div>
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
            สถานะคำสั่งซื้อ
          </p>
          <p className="mt-2 text-sm font-semibold text-[#171212]">
            {getOrderStatusLabel(payment.orderStatus)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
            วิธีชำระเงิน
          </p>
          <p className="mt-2 text-sm font-semibold text-[#171212]">
            {getPaymentMethodLabel(payment.paymentMethod)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
            เลขอ้างอิงชำระเงิน
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-[#171212]">
            {payment.paymentReference ?? "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
            อัปเดตล่าสุด
          </p>
          <p className="mt-2 text-sm font-semibold text-[#171212]">
            {formatDateTime(payment.paidAt ?? payment.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/payments/${payment.orderNumber}`}
          className="inline-flex rounded-full bg-[#171212] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
        >
          เปิดรายละเอียด
        </Link>
        <Link
          href={`/order-confirmation/${payment.orderNumber}`}
          className="inline-flex rounded-full border border-[#d8cec0] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#171212]"
        >
          ดูหน้าคำสั่งซื้อ
        </Link>
      </div>
    </article>
  );
}

export default async function AdminPaymentsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  noStore();

  const session = await requireRole("admin");
  const query = getFirstValue(searchParams?.q);
  const paymentStatus = getFirstValue(searchParams?.paymentStatus);
  const paymentMethod = getFirstValue(searchParams?.paymentMethod);

  let summary = {
    totalOrders: 0,
    awaitingPayment: 0,
    paidOrders: 0,
    problemOrders: 0,
    totalPaidAmount: 0
  };
  let payments: AdminPaymentListItem[] = [];
  let schemaMessage = "";

  try {
    [summary, payments] = await Promise.all([
      getAdminPaymentSummary(),
      getAdminPayments(
        {
          query,
          paymentStatus,
          paymentMethod
        },
        120
      )
    ]);
  } catch (error) {
    schemaMessage = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลการชำระเงินได้";
  }

  return (
    <AdminShell
      currentPath="/admin/payments"
      eyebrow="PattayaBev Admin"
      title={`จัดการการชำระเงิน, ${session.user.name}`}
      description="ตรวจสอบรายการชำระเงิน ยืนยันสถานะจากหลังบ้าน และติดตามคำสั่งซื้อที่มีปัญหาได้จากหน้านี้"
      actions={
        <>
          <Link className={adminSecondaryActionClass} href="/account/orders">
            ดูหน้าคำสั่งซื้อของลูกค้า
          </Link>
          <Link className={adminSecondaryActionClass} href="/admin">
            กลับหน้าสินค้า
          </Link>
          <LogoutButton className={adminPrimaryActionClass} redirectTo="/login" />
        </>
      }
    >
      {schemaMessage ? (
        <div className="rounded-[24px] border border-[#f0d8be] bg-[#fff7ec] px-5 py-4 text-sm leading-7 text-[#7a5a21]">
          {schemaMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="คำสั่งซื้อทั้งหมด" value={String(summary.totalOrders)} helper="จำนวนคำสั่งซื้อที่อยู่ในระบบชำระเงิน" />
        <SummaryCard label="รอชำระ / รอตรวจสอบ" value={String(summary.awaitingPayment)} helper="รายการที่ยังไม่ได้ยืนยันชำระสำเร็จ" />
        <SummaryCard label="ชำระแล้ว" value={String(summary.paidOrders)} helper="รายการที่ยืนยันชำระเรียบร้อยแล้ว" />
        <SummaryCard label="ต้องตรวจสอบ" value={String(summary.problemOrders)} helper="รายการที่ล้มเหลว หมดอายุ หรือคืนเงินแล้ว" />
        <SummaryCard label="ยอดรับชำระ" value={formatPrice(summary.totalPaidAmount)} helper="ยอดรวมของรายการที่สถานะชำระแล้ว" />
      </div>

      <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">ตัวกรอง</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#171212] sm:text-3xl">ค้นหารายการชำระเงิน</h2>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="ค้นหาจากเลขคำสั่งซื้อ ชื่อลูกค้า อีเมล หรือเลขอ้างอิง"
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          />
          <select
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          >
            <option value="">ทุกสถานะการชำระเงิน</option>
            <option value="unpaid">ยังไม่ชำระ</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="failed">ชำระไม่สำเร็จ</option>
            <option value="expired">หมดอายุ</option>
            <option value="refunded">คืนเงินแล้ว</option>
          </select>
          <select
            name="paymentMethod"
            defaultValue={paymentMethod}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          >
            <option value="">ทุกวิธีชำระเงิน</option>
            <option value="promptpay">พร้อมเพย์ QR</option>
            <option value="card">บัตรเครดิต / เดบิต</option>
            <option value="cod">เก็บเงินปลายทาง</option>
          </select>
          <button
            type="submit"
            className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#171212] px-6 text-sm font-bold text-white"
          >
            ใช้ตัวกรอง
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">รายการชำระเงิน</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#171212] sm:text-3xl">คำสั่งซื้อและข้อมูลการชำระเงิน</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#5f5852]">
            เปิดแต่ละรายการเพื่อตรวจเลขอ้างอิง ข้อมูลจาก gateway และอัปเดตสถานะให้ตรงกับผลจริง
          </p>
        </div>

        {payments.length ? (
          <div className="mt-6 space-y-4">
            {payments.map((payment) => (
              <PaymentRow key={payment.orderId} payment={payment} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-[#d8cec0] bg-[#fbf7f0] px-6 py-10 text-center text-sm leading-7 text-[#5f5852]">
            ไม่พบรายการที่ตรงกับตัวกรองที่เลือก
          </div>
        )}
      </section>
    </AdminShell>
  );
}
