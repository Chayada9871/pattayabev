import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";
import { AddressSection } from "@/components/account/address-section";
import { requireSession } from "@/lib/auth";
import { getBusinessAccountSummary, getBusinessStatusLabel } from "@/lib/business";
import { getAccountAddressData } from "@/lib/addresses";

export const metadata: Metadata = {
  title: "ที่อยู่ของฉัน | PattayaBev",
  description: "จัดการที่อยู่จัดส่ง ข้อมูลใบเสร็จและภาษี รวมถึงที่อยู่ที่บันทึกไว้"
};

export default async function AccountAddressesPage() {
  const session = await requireSession();
  const fullName = session.user.name?.trim() || "สมาชิก PattayaBev";
  const email = session.user.email || "-";

  const [business, addressData] = await Promise.all([
    getBusinessAccountSummary(String(session.user.id)),
    getAccountAddressData(String(session.user.id))
  ]);

  const b2bStatusLabel = getBusinessStatusLabel(business.status);

  return (
    <AccountShell currentSection="addresses" fullName={fullName} email={email} b2bStatusLabel={b2bStatusLabel}>
      <AddressSection
        schemaReady={addressData.schemaReady}
        defaultShippingAddress={addressData.defaultShippingAddress}
        savedAddresses={addressData.savedAddresses}
        billingDetails={addressData.billingDetails}
      />
    </AccountShell>
  );
}
