"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { saveBusinessDocumentsAction, type BusinessDocumentsFormState } from "@/app/account/actions";
import type { BusinessDocumentItem } from "@/lib/business";

const initialState: BusinessDocumentsFormState = {
  status: "idle",
  message: ""
};

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center justify-center rounded-full bg-[#171212] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#302520] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "กำลังส่งข้อมูล..." : "ส่งเอกสารให้ทีมงาน"}
    </button>
  );
}

export function BusinessDocumentsForm({
  documents,
  schemaReady
}: {
  documents: BusinessDocumentItem[];
  schemaReady: boolean;
}) {
  const [state, formAction] = useFormState(saveBusinessDocumentsAction, initialState);
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({});

  const canSave = useMemo(() => {
    return documents.every((document) => document.uploaded || Boolean(selectedNames[document.fieldName]));
  }, [documents, selectedNames]);

  return (
    <form action={formAction} className="space-y-5">
      {!schemaReady ? (
        <div className="rounded-[22px] border border-[#d98a2c] bg-[linear-gradient(135deg,#fff6ea_0%,#fffdfa_100%)] px-5 py-4 text-base leading-8 text-[#6b5a45]">
          กรุณารันไฟล์ <code className="rounded bg-white px-1 py-0.5">supabase/create-business-documents.sql</code> ก่อนใช้งานส่วนอัปโหลดเอกสาร
        </div>
      ) : null}

      <div className="grid gap-4">
        {documents.map((document) => {
          const selectedName = selectedNames[document.fieldName];
          const currentName = selectedName || document.originalName || "ยังไม่ได้เลือกไฟล์";

          return (
            <div key={document.type} className="rounded-[24px] border border-[#ece3d7] bg-[#fcfaf6] px-5 py-5">
              <input name={document.existingFieldName} type="hidden" value={document.uploaded ? "true" : "false"} />

              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-base font-extrabold text-[#171212]">{document.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[#5f5852]">{document.helperText}</p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                    document.uploaded || selectedName ? "bg-[#edf7ef] text-[#217148]" : "bg-[#fff2df] text-[#b76818]"
                  }`}
                >
                  {document.uploaded || selectedName ? "พร้อมส่ง" : "ต้องอัปโหลด"}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#d8cec0] bg-white px-5 py-3 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]">
                  อัปโหลดไฟล์
                  <input
                    name={document.fieldName}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setSelectedNames((current) => ({
                        ...current,
                        [document.fieldName]: file?.name ?? ""
                      }));
                    }}
                  />
                </label>

                <p className="text-base leading-7 text-[#5f5852]">{currentName}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className={`text-base font-medium ${state.status === "error" ? "text-[#d04638]" : "text-[#217148]"}`}>{state.message}</p>
          <p className="text-sm leading-7 text-[#7b736a]">รองรับไฟล์ PDF, JPG และ PNG และต้องอัปโหลดครบทุกเอกสารก่อนส่ง</p>
        </div>
        <SaveButton disabled={!schemaReady || !canSave} />
      </div>
    </form>
  );
}
