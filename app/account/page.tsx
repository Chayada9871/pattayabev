import type { Metadata } from "next";

import { AccountActionButton, AccountSectionCard, AccountShell } from "@/components/account/account-shell";
import { requireSession } from "@/lib/auth";
import { getBusinessAccountSummary, getBusinessStatusLabel } from "@/lib/business";

export const metadata: Metadata = {
  title: "บัญชีของฉัน | PattayaBev",
  description: "จัดการข้อมูลบัญชีและการตั้งค่าพื้นฐานของคุณ"
};

export default async function AccountPage() {
  const session = await requireSession();
  const fullName = session.user.name?.trim() || "สมาชิก PattayaBev";
  const email = session.user.email || "-";

  const business = await getBusinessAccountSummary(String(session.user.id));
  const b2bStatusLabel = getBusinessStatusLabel(business.status);

  return (
    <AccountShell currentSection="overview" fullName={fullName} email={email} b2bStatusLabel={b2bStatusLabel}>
      <AccountSectionCard
        id="overview"
        title="ข้อมูลบัญชี"
        subtitle="ดูข้อมูลบัญชีหลักและตั้งค่าการแจ้งเตือนของคุณจากหน้านี้"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="border border-[#dcd6cb] bg-white px-5 py-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ข้อมูลส่วนตัว</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="border border-[#ece5db] bg-[#fffcf8] px-4 py-4">
                  <p className="text-xs font-bold text-[#8f8579]">ชื่อ - นามสกุล</p>
                  <p className="mt-2 text-sm font-semibold text-[#171212]">{fullName}</p>
                </div>
                <div className="border border-[#ece5db] bg-[#fffcf8] px-4 py-4">
                  <p className="text-xs font-bold text-[#8f8579]">อีเมล</p>
                  <p className="mt-2 break-all text-sm font-semibold text-[#171212]">{email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <AccountActionButton>แก้ไขโปรไฟล์</AccountActionButton>
                <AccountActionButton>เปลี่ยนรหัสผ่าน</AccountActionButton>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-[#dcd6cb] bg-white px-5 py-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">การแจ้งเตือน</p>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4f4943]">
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 border-[#d6cec3]" />
                  <span>รับข่าวสาร โปรโมชั่น และสินค้าใหม่จาก PattayaBev</span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 border-[#d6cec3]" />
                  <span>รับการแจ้งเตือนเกี่ยวกับคำสั่งซื้อและเอกสาร</span>
                </label>
              </div>
            </div>

            <div className="border border-[#dcd6cb] bg-white px-5 py-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">สถานะบัญชีธุรกิจ</p>
              <div className="mt-4 border border-[#ece5db] bg-[#fffcf8] px-4 py-4">
                <p className="text-xs font-bold text-[#8f8579]">B2B</p>
                <p className="mt-2 text-lg font-extrabold text-[#171212]">{b2bStatusLabel}</p>
                <p className="mt-2 text-sm leading-7 text-[#5f5852]">
                  หากต้องการดูเอกสารและสถานะการสมัครธุรกิจ กรุณาไปที่เมนูบัญชีธุรกิจ (B2B)
                </p>
              </div>
            </div>
          </div>
        </div>
      </AccountSectionCard>
    </AccountShell>
  );
}
