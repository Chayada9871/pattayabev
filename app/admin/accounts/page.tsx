import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { AccountRoleForm } from "@/components/admin/account-role-form";
import {
  AdminShell,
  adminPrimaryActionClass,
  adminSecondaryActionClass
} from "@/components/admin/admin-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  getAdminAccountSummary,
  getAdminAccounts,
  type AdminAccountListItem
} from "@/lib/admin-accounts";
import { requireRole } from "@/lib/auth";

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

function getRoleLabel(role: string) {
  if (role === "admin") return "แอดมิน";
  if (role === "manager") return "ผู้จัดการ";
  return "ลูกค้าทั่วไป";
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

function getBadgeClass(tone: "green" | "orange" | "red" | "ink") {
  if (tone === "green") return "bg-[#edf7ef] text-[#207443] border-[#d6eadc]";
  if (tone === "orange") return "bg-[#fff7e8] text-[#9a5d00] border-[#eedeb2]";
  if (tone === "red") return "bg-[#fbe9e9] text-[#a61b1f] border-[#f3d1d3]";
  return "bg-[#f3efe8] text-[#171212] border-[#e2d8c8]";
}

function AccountCard({ account }: { account: AdminAccountListItem }) {
  const businessTone =
    account.businessStatus === "approved"
      ? "green"
      : account.businessStatus === "pending"
        ? "orange"
        : account.businessStatus === "rejected"
          ? "red"
          : "ink";

  return (
    <article className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">บัญชีผู้ใช้</p>
          <h3 className="mt-2 text-xl font-extrabold text-[#171212]">{account.name}</h3>
          <p className="mt-2 break-all text-sm text-[#5f5852]">{account.email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getBadgeClass("ink")}`}>
            {getRoleLabel(account.role)}
          </span>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
              account.emailVerified ? getBadgeClass("green") : getBadgeClass("orange")
            }`}
          >
            {account.emailVerified ? "ยืนยันอีเมลแล้ว" : "ยังไม่ยืนยันอีเมล"}
          </span>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getBadgeClass(businessTone)}`}>
            B2B: {account.businessStatusLabel}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">คำสั่งซื้อ</p>
            <p className="mt-2 text-sm font-semibold text-[#171212]">{account.orderCount} รายการ</p>
          </div>
          <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">สมัครเมื่อ</p>
            <p className="mt-2 text-sm font-semibold text-[#171212]">{formatDateTime(account.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-[#ece4d6] px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">อัปเดตล่าสุด</p>
            <p className="mt-2 text-sm font-semibold text-[#171212]">{formatDateTime(account.updatedAt)}</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#ece4d6] bg-[#fffcf8] p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">สิทธิ์การใช้งาน</p>
          <div className="mt-3">
            <AccountRoleForm userId={account.id} role={account.role} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function AdminAccountsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  noStore();

  const session = await requireRole("admin");
  const query = getFirstValue(searchParams?.q);
  const role = getFirstValue(searchParams?.role);
  const [summary, accounts] = await Promise.all([
    getAdminAccountSummary(),
    getAdminAccounts({ query, role }, 150)
  ]);

  return (
    <AdminShell
      currentPath="/admin/accounts"
      eyebrow="PattayaBev Admin"
      title={`จัดการบัญชีผู้ใช้, ${session.user.name}`}
      description="ดูบัญชีที่สมัครทั้งหมด ตรวจสถานะอีเมล บัญชีธุรกิจ และปรับสิทธิ์การใช้งานจากหน้าเดียว"
      actions={
        <>
          <Link className={adminSecondaryActionClass} href="/account">
            ดูหน้าบัญชีลูกค้า
          </Link>
          <Link className={adminSecondaryActionClass} href="/admin">
            กลับหน้าแอดมิน
          </Link>
          <LogoutButton className={adminPrimaryActionClass} redirectTo="/login" />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="บัญชีทั้งหมด" value={String(summary.totalAccounts)} helper="จำนวนผู้ใช้ที่มีอยู่ในระบบ" />
        <SummaryCard label="แอดมิน" value={String(summary.adminAccounts)} helper="ผู้ใช้ที่มีสิทธิ์ดูแลระบบเต็มรูปแบบ" />
        <SummaryCard label="ผู้จัดการ" value={String(summary.managerAccounts)} helper="ผู้ใช้ที่มีสิทธิ์ระดับผู้จัดการ" />
        <SummaryCard label="ลูกค้าทั่วไป" value={String(summary.customerAccounts)} helper="บัญชีลูกค้าที่ใช้งานหน้าร้านและบัญชีส่วนตัว" />
        <SummaryCard label="ยืนยันอีเมลแล้ว" value={String(summary.verifiedAccounts)} helper="บัญชีที่ผ่านการยืนยันอีเมลเรียบร้อย" />
      </div>

      <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">ค้นหาบัญชี</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#171212] sm:text-3xl">ค้นหาผู้ใช้ที่ต้องการจัดการ</h2>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="ค้นหาจากชื่อ อีเมล หรือรหัสผู้ใช้"
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          />
          <select
            name="role"
            defaultValue={role}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          >
            <option value="">ทุกสิทธิ์</option>
            <option value="user">ลูกค้าทั่วไป</option>
            <option value="manager">ผู้จัดการ</option>
            <option value="admin">แอดมิน</option>
          </select>
          <button
            type="submit"
            className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#171212] px-6 text-sm font-bold text-white"
          >
            ค้นหา
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">รายชื่อผู้ใช้</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#171212] sm:text-3xl">บัญชีที่มีอยู่ในระบบ</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#5f5852]">
            คุณสามารถดูสถานะอีเมล สิทธิ์การใช้งาน คำสั่งซื้อ และสถานะ B2B ของแต่ละบัญชีได้จากด้านล่าง
          </p>
        </div>

        {accounts.length ? (
          <div className="mt-6 space-y-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-[#d8cec0] bg-[#fbf7f0] px-6 py-10 text-center text-sm leading-7 text-[#5f5852]">
            ไม่พบบัญชีผู้ใช้ตามเงื่อนไขที่ค้นหา
          </div>
        )}
      </section>
    </AdminShell>
  );
}
