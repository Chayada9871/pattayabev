import type { Metadata } from "next";

import { AccountSectionCard, AccountShell } from "@/components/account/account-shell";
import { BusinessAccountSection } from "@/components/account/business-account-section";
import { requireSession } from "@/lib/auth";
import { getBusinessAccountSummary, getBusinessStatusLabel } from "@/lib/business";

export const metadata: Metadata = {
  title: "บัญชีธุรกิจ (B2B) | PattayaBev",
  description: "จัดการเอกสารและติดตามสถานะบัญชีธุรกิจของคุณ"
};

export default async function AccountB2BPage() {
  const session = await requireSession();
  const fullName = session.user.name?.trim() || "สมาชิก PattayaBev";
  const email = session.user.email || "-";
  const business = await getBusinessAccountSummary(String(session.user.id));
  const b2bStatusLabel = getBusinessStatusLabel(business.status);

  return (
    <AccountShell currentSection="b2b" fullName={fullName} email={email} b2bStatusLabel={b2bStatusLabel}>
      <AccountSectionCard
        id="b2b-overview"
        title="บัญชีธุรกิจ (B2B)"
        subtitle="หน้านี้ใช้สำหรับส่งเอกสาร ติดตามสถานะ และดูสิทธิประโยชน์ของบัญชีธุรกิจโดยเฉพาะ"
      >
        <div className="border border-[#dcd6cb] bg-[#fffcf8] px-5 py-4 text-sm leading-7 text-[#5f5852]">
          สถานะปัจจุบันของคุณคือ <span className="font-extrabold text-[#171212]">{b2bStatusLabel}</span> และเมื่อเอกสารครบ ระบบจะส่งให้ทีมงานตรวจสอบอัตโนมัติ
        </div>
      </AccountSectionCard>

      <BusinessAccountSection
        schemaReady={business.schemaReady}
        status={business.status}
        statusLabel={b2bStatusLabel}
        documents={business.documents}
        highlight
      />
    </AccountShell>
  );
}
