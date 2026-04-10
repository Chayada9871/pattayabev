import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

type AccountSectionKey = "overview" | "addresses" | "b2b" | "orders";

type AccountShellProps = {
  currentSection: AccountSectionKey;
  fullName: string;
  email: string;
  b2bStatusLabel: string;
  children: ReactNode;
};

const navItems: Array<{ key: AccountSectionKey; label: string; href: string }> = [
  { key: "overview", label: "บัญชีของฉัน", href: "/account" },
  { key: "addresses", label: "ที่อยู่", href: "/account/addresses" },
  { key: "b2b", label: "บัญชีธุรกิจ (B2B)", href: "/account/b2b" },
  { key: "orders", label: "คำสั่งซื้อของฉัน", href: "/account/orders" }
];

export function AccountShell({
  currentSection,
  fullName,
  email,
  b2bStatusLabel,
  children
}: AccountShellProps) {
  const initial = fullName.charAt(0).toUpperCase() || "P";

  return (
    <div className="min-h-screen bg-white text-[#171212]">
      <SiteHeader />

      <main className="mx-auto max-w-[1520px] px-4 pb-16 pt-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b6a2b]">
          <Link href="/" className="hover:text-[#2437e8]">
            หน้าแรก
          </Link>{" "}
          / บัญชีของฉัน
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="border border-[#dcd6cb] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <div className="px-5 py-5">
                <div className="flex items-center gap-4">
                  <div className="inline-grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(135deg,#171212_0%,#4b3729_100%)] text-2xl font-extrabold text-white shadow-[0_16px_30px_rgba(23,18,18,0.15)]">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-[#171212]">{fullName}</p>
                    <p className="mt-1 break-all text-sm text-[#5f5852]">{email}</p>
                  </div>
                </div>

                <div className="mt-5 bg-[linear-gradient(135deg,#d98a2c_0%,#ed9e46_100%)] px-4 py-4 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/80">สถานะ B2B</p>
                  <p className="mt-2 text-base font-extrabold">{b2bStatusLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-white/90">
                    จัดการเอกสาร สมัครใช้งาน และติดตามสถานะบัญชีธุรกิจได้จากหน้า B2B โดยเฉพาะ
                  </p>
                </div>
              </div>
            </div>

            <nav className="border border-[#dcd6cb] bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`block px-4 py-3 text-sm font-medium transition ${
                    currentSection === item.key
                      ? "bg-[#f4efe7] text-[#171212]"
                      : "text-[#5e564f] hover:bg-[#faf7f1] hover:text-[#171212]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <LogoutButton
                className="block w-full px-4 py-3 text-left text-sm font-medium text-[#5e564f] transition hover:bg-[#faf7f1] hover:text-[#171212]"
                redirectTo="/login"
              >
                ออกจากระบบ
              </LogoutButton>
            </nav>
          </aside>

          <div className="space-y-6">{children}</div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function AccountSectionCard({
  id,
  title,
  subtitle,
  children
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden border border-[#dcd6cb] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div id={id} className="border-b border-[#e5dfd5] px-5 py-4">
        <h2 className="text-[24px] font-extrabold text-[#171212]">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5f5852]">{subtitle}</p> : null}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

export function AccountActionButton({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#171212] transition hover:bg-[#faf7f1]"
    >
      {children}
    </button>
  );
}

export function AccountMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#dcd6cb] bg-white px-4 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8f8579]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-[#171212]">{value}</p>
    </div>
  );
}
