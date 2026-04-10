import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import {
  AdminShell,
  adminPrimaryActionClass,
  adminSecondaryActionClass
} from "@/components/admin/admin-shell";
import { BusinessStatusForm } from "@/components/admin/business-status-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/lib/auth";
import { getAdminBusinessDetail } from "@/lib/admin-business";

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

function SummaryStat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[22px] border border-[#ece4d6] bg-white px-4 py-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8b6a2b]">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-[#171212]">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-6 text-[#625b54]">{helper}</p> : null}
    </div>
  );
}

export default async function AdminBusinessDetailPage({
  params
}: {
  params: { profileId: string };
}) {
  noStore();

  await requireRole("admin");

  const detail = await getAdminBusinessDetail(params.profileId);

  if (!detail) {
    notFound();
  }

  return (
    <AdminShell
      currentPath="/admin/b2b"
      eyebrow="PattayaBev Admin"
      title="รายละเอียดคำขอ B2B"
      description="ตรวจข้อมูลผู้สมัคร เปิดเอกสารที่อัปโหลด และปรับผลการพิจารณาให้ลูกค้าได้จากหน้านี้"
      actions={
        <>
          <Link className={adminSecondaryActionClass} href="/admin/b2b">
            กลับหน้ารายการ B2B
          </Link>
          <LogoutButton className={adminPrimaryActionClass} redirectTo="/login" />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="ผู้สมัคร" value={detail.customerName} helper={detail.customerEmail} />
        <SummaryStat label="สถานะ" value={detail.statusLabel} helper={`อัปเดตล่าสุด ${formatDateTime(detail.updatedAt)}`} />
        <SummaryStat label="เอกสารที่ส่งแล้ว" value={`${detail.uploadedDocuments}/3`} helper="ระบบคาดหวังเอกสาร 3 รายการก่อนพิจารณา" />
        <SummaryStat label="ส่งคำขอครั้งแรก" value={formatDateTime(detail.createdAt)} helper={`รหัสผู้ใช้ ${detail.userId}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <section className="space-y-6">
          <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">เอกสาร</p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#171212] sm:text-3xl">ไฟล์ที่ลูกค้าส่งมา</h2>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusPillClass(detail.status ?? "pending")}`}
              >
                {detail.statusLabel}
              </span>
            </div>

            {detail.documents.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {detail.documents.map((document) => (
                  <article key={document.id} className="rounded-[22px] border border-[#ece4d6] bg-[#fffcf8] p-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">
                      {document.type}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold text-[#171212]">{document.label}</h3>
                    <p className="mt-3 break-words text-sm leading-7 text-[#5f5852]">{document.originalName}</p>
                    <p className="mt-2 text-sm leading-7 text-[#5f5852]">
                      อัปโหลดเมื่อ {formatDateTime(document.uploadedAt)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full bg-[#171212] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
                      >
                        เปิดไฟล์
                      </a>
                      <a
                        href={document.fileUrl}
                        download
                        className="inline-flex rounded-full border border-[#d8cec0] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#171212]"
                      >
                        ดาวน์โหลด
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#d8cec0] bg-[#fbf7f0] px-6 py-10 text-center text-sm leading-7 text-[#5f5852]">
                ลูกค้ารายนี้ยังไม่ได้อัปโหลดเอกสาร
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="border-b border-[#ece4d6] pb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">จัดการสถานะ</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#171212]">อัปเดตผลการพิจารณา</h2>
              <p className="mt-3 text-sm leading-7 text-[#5f5852]">
                เมื่อเปลี่ยนสถานะแล้ว ฝั่งลูกค้าจะเห็นผลล่าสุดในหน้า B2B ของบัญชีตนเอง
              </p>
            </div>

            <div className="mt-6">
              <BusinessStatusForm profileId={detail.id} currentStatus={detail.status} />
            </div>
          </section>

          <section className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="border-b border-[#ece4d6] pb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">สรุป</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#171212]">ข้อมูลที่ควรเช็กก่อนอนุมัติ</h2>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-7 text-[#5f5852]">
              <div className="rounded-[20px] border border-[#ece4d6] px-4 py-4">
                <p className="font-semibold text-[#171212]">อีเมลผู้สมัคร</p>
                <p className="mt-2">{detail.customerEmail}</p>
              </div>
              <div className="rounded-[20px] border border-[#ece4d6] px-4 py-4">
                <p className="font-semibold text-[#171212]">จำนวนไฟล์ที่ได้รับ</p>
                <p className="mt-2">{detail.uploadedDocuments} จาก 3 ไฟล์</p>
              </div>
              <div className="rounded-[20px] border border-[#ece4d6] bg-[#fffaf3] px-4 py-4">
                <p className="font-semibold text-[#171212]">คำแนะนำ</p>
                <ul className="mt-2 space-y-2">
                  <li>ตรวจว่าไฟล์เปิดได้และตรงกับประเภทธุรกิจ</li>
                  <li>ถ้าเอกสารยังไม่ครบ ให้เลือกสถานะขอเอกสารเพิ่ม</li>
                  <li>ถ้าตรวจครบแล้ว ให้เปลี่ยนเป็นอนุมัติแล้ว</li>
                </ul>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
