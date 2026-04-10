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
  getAdminBusinessProfiles,
  getAdminBusinessSummary,
  type AdminBusinessListItem
} from "@/lib/admin-business";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(new Date(value));
}

function getStatusPillClass(status: string) {
  if (status === "approved") return "bg-[#edf7ef] text-[#207443] border-[#d6eadc]";
  if (status === "pending") return "bg-[#fff7e8] text-[#9a5d00] border-[#eedeb2]";
  return "bg-[#fbe9e9] text-[#a61b1f] border-[#f3d1d3]";
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

function BusinessRequestCard({ item }: { item: AdminBusinessListItem }) {
  return (
    <article className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">ผู้สมัคร</p>
          <h3 className="mt-2 text-xl font-extrabold text-[#171212]">{item.customerName}</h3>
          <p className="mt-2 text-sm text-[#5f5852]">{item.customerEmail}</p>
        </div>

        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusPillClass(item.status ?? "pending")}`}
        >
          {item.statusLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">เอกสารที่อัปโหลด</p>
          <p className="mt-2 text-sm font-semibold text-[#171212]">{item.uploadedDocuments}/3 ไฟล์</p>
        </div>
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ส่งคำขอครั้งแรก</p>
          <p className="mt-2 text-sm font-semibold text-[#171212]">{formatDateTime(item.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">อัปเดตล่าสุด</p>
          <p className="mt-2 text-sm font-semibold text-[#171212]">{formatDateTime(item.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/b2b/${item.id}`}
          className="inline-flex rounded-full bg-[#171212] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
        >
          เปิดรายละเอียด
        </Link>
      </div>
    </article>
  );
}

export default async function AdminBusinessPage() {
  noStore();

  const session = await requireRole("admin");

  let summary = {
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    uploadedDocuments: 0
  };
  let requests: AdminBusinessListItem[] = [];
  let schemaMessage = "";

  try {
    [summary, requests] = await Promise.all([getAdminBusinessSummary(), getAdminBusinessProfiles(120)]);
  } catch (error) {
    schemaMessage = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูล B2B ได้";
  }

  return (
    <AdminShell
      currentPath="/admin/b2b"
      eyebrow="PattayaBev Admin"
      title={`จัดการลูกค้า B2B, ${session.user.name}`}
      description="ตรวจคำขอ B2B เปิดดูเอกสารของลูกค้าธุรกิจ และอัปเดตผลการพิจารณาจากระบบหลังบ้านได้จากหน้านี้"
      actions={
        <>
          <Link className={adminSecondaryActionClass} href="/account/b2b">
            ดูหน้าฝั่งลูกค้า
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
        <SummaryCard label="คำขอทั้งหมด" value={String(summary.totalApplications)} helper="จำนวนลูกค้าที่ส่งคำขอ B2B เข้ามาในระบบ" />
        <SummaryCard label="รอตรวจสอบ" value={String(summary.pendingApplications)} helper="คำขอที่รอทีมงานตรวจเอกสารและพิจารณา" />
        <SummaryCard label="อนุมัติแล้ว" value={String(summary.approvedApplications)} helper="ลูกค้าที่พร้อมใช้งานบัญชีธุรกิจแล้ว" />
        <SummaryCard label="ต้องแก้ไข" value={String(summary.rejectedApplications)} helper="คำขอที่ต้องส่งเอกสารใหม่หรือแก้ข้อมูล" />
        <SummaryCard label="ไฟล์เอกสาร" value={String(summary.uploadedDocuments)} helper="จำนวนเอกสารที่อัปโหลดเข้ามาทั้งหมด" />
      </div>

      <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">คำขอ B2B</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#171212] sm:text-3xl">รายการลูกค้าที่ส่งเอกสารธุรกิจ</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#5f5852]">
            เปิดแต่ละรายการเพื่อดูไฟล์เอกสารจริง และเปลี่ยนสถานะคำขอได้จากหน้ารายละเอียด
          </p>
        </div>

        {requests.length ? (
          <div className="mt-6 space-y-4">
            {requests.map((item) => (
              <BusinessRequestCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-[#d8cec0] bg-[#fbf7f0] px-6 py-10 text-center text-sm leading-7 text-[#5f5852]">
            ยังไม่มีลูกค้าส่งคำขอ B2B เข้ามาในระบบ
          </div>
        )}
      </section>
    </AdminShell>
  );
}
