"use client";

import { useMemo } from "react";

import { BusinessDocumentsForm } from "@/components/account/business-documents-form";
import type { BusinessDocumentItem, BusinessStatus } from "@/lib/business";

type BusinessAccountSectionProps = {
  schemaReady: boolean;
  status: BusinessStatus;
  statusLabel: string;
  documents: BusinessDocumentItem[];
  highlight?: boolean;
};

type StepItem = {
  id: number;
  title: string;
  detail: string;
};

const workflowSteps: StepItem[] = [
  { id: 1, title: "เตรียมเอกสาร", detail: "อัปโหลดเอกสารให้ครบ" },
  { id: 2, title: "ส่งให้ทีมงาน", detail: "กดส่งคำขอเข้าระบบ" },
  { id: 3, title: "รอตรวจสอบ", detail: "ทีมงานกำลังตรวจข้อมูล" },
  { id: 4, title: "ผลการพิจารณา", detail: "อนุมัติหรือขอข้อมูลเพิ่ม" }
];

function getCurrentStep(status: BusinessStatus, uploadedCount: number, totalDocuments: number) {
  if (uploadedCount < totalDocuments) {
    return 1;
  }

  if (status === null) {
    return 2;
  }

  if (status === "pending") {
    return 3;
  }

  return 4;
}

function getStatusCopy(status: BusinessStatus) {
  if (status === "approved") {
    return {
      eyebrow: "บัญชีธุรกิจพร้อมใช้งาน",
      title: "บัญชี B2B ของคุณพร้อมใช้งานแล้ว",
      description: "คุณสามารถใช้งานราคาธุรกิจและติดตามสถานะเอกสารได้จากหน้านี้"
    };
  }

  if (status === "pending") {
    return {
      eyebrow: "ทีมงานกำลังตรวจสอบ",
      title: "เอกสารถูกส่งเข้าระบบแล้ว",
      description: "คำขอของคุณอยู่ระหว่างการตรวจสอบ โดยปกติใช้เวลา 1-2 วันทำการ"
    };
  }

  if (status === "rejected") {
    return {
      eyebrow: "ต้องอัปเดตข้อมูล",
      title: "กรุณาอัปโหลดหรือแก้ไขเอกสารอีกครั้ง",
      description: "ทีมงานต้องการข้อมูลเพิ่มเติมก่อนอนุมัติบัญชีธุรกิจของคุณ"
    };
  }

  return {
    eyebrow: "เริ่มสมัคร B2B",
    title: "เริ่มสมัคร B2B ได้จากการอัปโหลดเอกสาร",
    description: "เมื่ออัปโหลดครบและกดส่ง ระบบจะส่งคำขอให้ทีมงานทันที"
  };
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/15 bg-white/8 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
      <p className="text-xs font-bold text-white/70">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function WorkflowItem({
  step,
  active,
  complete
}: {
  step: StepItem;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`border px-5 py-5 transition ${
        active
          ? "border-[#d98a2c] bg-[linear-gradient(135deg,#fff9ef_0%,#fff5e7_100%)] shadow-[0_14px_28px_rgba(217,138,44,0.12)]"
          : complete
            ? "border-[#dfe8db] bg-[#f7fbf7]"
            : "border-[#ece3d7] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold ${
            active
              ? "border-[#d98a2c] bg-white text-[#b76818]"
              : complete
                ? "border-[#b7d7c0] bg-white text-[#217148]"
                : "border-[#e3d7c8] bg-[#faf7f1] text-[#8f8579]"
          }`}
        >
          {step.id}
        </span>
        <div>
          <p className="text-base font-extrabold text-[#171212]">{step.title}</p>
          <p className="mt-1 text-sm leading-7 text-[#5f5852]">{step.detail}</p>
        </div>
      </div>
    </div>
  );
}

export function BusinessAccountSection({
  schemaReady,
  status,
  statusLabel,
  documents,
  highlight = false
}: BusinessAccountSectionProps) {
  const uploadedCount = useMemo(() => documents.filter((document) => document.uploaded).length, [documents]);
  const totalDocuments = documents.length;
  const currentStep = getCurrentStep(status, uploadedCount, totalDocuments);
  const statusCopy = getStatusCopy(status);

  return (
    <section id="business" className="space-y-6">
      <div className="overflow-hidden border border-[#dcd6cb] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#e5dfd5] px-5 py-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">B2B</p>
          <h2 className="mt-2 text-[24px] font-extrabold text-[#171212]">บัญชีธุรกิจ</h2>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[#5f5852]">
            สมัครลูกค้าธุรกิจ ติดตามสถานะ และส่งเอกสารให้ทีมงานจากส่วนนี้ได้เลย
          </p>
        </div>

        <div className="px-5 py-5">

        <div
          className={`overflow-hidden border bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)] ${
            highlight ? "border-[#d98a2c] ring-2 ring-[#f3d3a6]" : "border-[#eadfce]"
          }`}
        >
          <div className="bg-[linear-gradient(160deg,#2d211d_0%,#5e3c28_55%,#b96e1a_100%)] px-6 py-7 text-white sm:px-7 sm:py-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
              <div>
                <p className="text-xs font-bold text-white/70">{statusCopy.eyebrow}</p>
                <h3 className="mt-3 text-4xl font-extrabold leading-tight">{statusCopy.title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">{statusCopy.description}</p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <StatCard label="เอกสารพร้อมส่ง" value={`${uploadedCount}/${totalDocuments}`} />
                  <StatCard label="สถานะ" value={statusLabel} />
                  <StatCard label="เวลาตรวจสอบ" value="1-2 วัน" />
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#business-documents"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#171212] transition hover:bg-[#f7efe4]"
                  >
                    ไปที่ส่วนอัปโหลดเอกสาร
                  </a>
                </div>
              </div>

              <div className="border border-white/12 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
                <p className="text-xs font-bold text-white/70">สถานะตอนนี้</p>
                <h4 className="mt-2 text-3xl font-extrabold text-white">
                  ขั้นตอน {currentStep}: {workflowSteps[currentStep - 1]?.title}
                </h4>
                <p className="mt-3 text-base leading-8 text-white/85">{workflowSteps[currentStep - 1]?.detail}</p>

                <div className="mt-6 border-t border-white/12 pt-5">
                  <p className="text-xs font-bold text-white/70">สิทธิประโยชน์</p>
                  <ul className="mt-4 grid gap-3 text-base leading-8 text-white/85">
                    <li className="flex items-start gap-3">
                      <span className="mt-3 inline-block h-2.5 w-2.5 rounded-full bg-[#f0c78b]" />
                      <span>เข้าถึงราคาสำหรับลูกค้าธุรกิจ</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-3 inline-block h-2.5 w-2.5 rounded-full bg-[#f0c78b]" />
                      <span>รับข้อเสนอพิเศษสำหรับร้านค้าและองค์กร</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-3 inline-block h-2.5 w-2.5 rounded-full bg-[#f0c78b]" />
                      <span>มีทีมติดตามสถานะหลังส่งเอกสาร</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="business-progress" className="mt-8 border-t border-white/12 pt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-white/70">ขั้นตอนการสมัคร</p>
                  <h4 className="mt-2 text-3xl font-extrabold text-white">สถานะการส่งให้ทีมงาน</h4>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                  {statusLabel}
                </span>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-4">
                {workflowSteps.map((step) => (
                  <WorkflowItem
                    key={step.id}
                    step={step}
                    active={step.id === currentStep}
                    complete={step.id < currentStep}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          id="business-documents"
          className="mt-6 overflow-hidden border border-[#dcd6cb] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
        >
          <div className="border-b border-[#eee5d8] px-6 py-5 sm:px-7">
            <p className="text-xs font-bold text-[#8b6a2b]">เอกสาร</p>
            <h3 className="mt-2 text-3xl font-extrabold text-[#171212]">เอกสารและการส่งให้ทีมงาน</h3>
            <p className="mt-3 max-w-3xl text-base leading-8 text-[#5f5852]">
              อัปโหลดเอกสารให้ครบทั้ง 3 รายการก่อนกดส่ง ระบบจะส่งคำขอให้ทีมงานตรวจสอบให้อัตโนมัติ
            </p>
          </div>

          <div className="px-6 py-6 sm:px-7">
            <div className="grid gap-4 xl:grid-cols-3">
              {documents.map((document) => (
                <div key={document.type} className="border border-[#dcd6cb] bg-[#fffdfa] px-5 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-extrabold text-[#171212]">{document.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5f5852]">{document.helperText}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        document.uploaded ? "bg-[#edf7ef] text-[#217148]" : "bg-[#fff2df] text-[#b76818]"
                      }`}
                    >
                      {document.uploaded ? "พร้อมใช้งาน" : "รออัปโหลด"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {!schemaReady ? (
              <div className="mt-5 border border-[#d98a2c] bg-[linear-gradient(135deg,#fff6ea_0%,#fffdfa_100%)] px-5 py-4 text-base leading-8 text-[#6b5a45]">
                ต้องรัน <code className="rounded bg-white px-1 py-0.5">supabase/create-business-documents.sql</code> ก่อนใช้งานระบบเอกสาร B2B
              </div>
            ) : null}

            <div className="mt-6 border-t border-[#eee5d8] pt-6">
              <BusinessDocumentsForm documents={documents} schemaReady={schemaReady} />
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
