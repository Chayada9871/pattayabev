import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/lib/auth";

export default async function ManagerPage() {
  const session = await requireRole("manager");

  return (
    <main className="grid min-h-screen place-items-center bg-hero-glow px-4 py-10">
      <section className="w-full max-w-3xl rounded-[28px] border border-[#e9dfd1] bg-white px-8 py-10 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">แดชบอร์ดผู้จัดการ</p>
        <h1 className="mt-3 text-4xl font-extrabold uppercase text-ink">สวัสดี, {session.user.name}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#625b54]">
          หน้านี้เปิดเฉพาะผู้ใช้ที่มีบทบาท <code>manager</code> และใช้การป้องกันหน้าแบบ server-side เพื่อลดการเข้าถึงที่ไม่ถูกต้อง
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-full bg-ink px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white" href="/">
            หน้าแรก
          </Link>
          <LogoutButton className="rounded-full border border-[#d8cec0] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink" redirectTo="/login" />
        </div>
      </section>
    </main>
  );
}
