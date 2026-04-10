"use client";

import { useFormState, useFormStatus } from "react-dom";

import {
  updateAdminBusinessStatusAction,
  type AdminBusinessActionState
} from "@/app/admin/b2b/actions";
import type { BusinessStatus } from "@/lib/business";

type BusinessStatusFormProps = {
  profileId: string;
  currentStatus: BusinessStatus;
};

const initialState: AdminBusinessActionState = {
  status: "idle",
  message: ""
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "กำลังบันทึก..." : "บันทึกสถานะ"}
    </button>
  );
}

export function BusinessStatusForm({ profileId, currentStatus }: BusinessStatusFormProps) {
  const [state, formAction] = useFormState(updateAdminBusinessStatusAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="profileId" value={profileId} />

      <label className="grid gap-2 text-sm font-semibold text-[#171212]">
        <span>สถานะคำขอ B2B</span>
        <select
          name="status"
          defaultValue={currentStatus ?? "pending"}
          className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
        >
          <option value="pending">รอตรวจสอบ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ขอเอกสารเพิ่ม / ต้องแก้ไข</option>
        </select>
      </label>

      <div className="rounded-[20px] border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-sm leading-7 text-[#5f5852]">
        ใช้สถานะ <span className="font-semibold text-[#171212]">อนุมัติแล้ว</span> เมื่อตรวจเอกสารครบ,
        ใช้ <span className="font-semibold text-[#171212]">ขอเอกสารเพิ่ม / ต้องแก้ไข</span> เมื่อต้องการให้ลูกค้าอัปโหลดใหม่
        และใช้ <span className="font-semibold text-[#171212]">รอตรวจสอบ</span> เมื่อต้องการคงคำขอไว้ในคิวตรวจสอบ
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#ece4d6] bg-white px-4 py-4">
        <div className="min-h-[24px] text-sm font-medium">
          {state.message ? (
            <p className={state.status === "success" ? "text-[#207443]" : "text-[#a61b1f]"}>{state.message}</p>
          ) : (
            <p className="text-[#7a736b]">เมื่อบันทึกแล้ว สถานะจะอัปเดตทั้งฝั่งแอดมินและหน้าบัญชีของลูกค้า</p>
          )}
        </div>
        <SaveButton />
      </div>
    </form>
  );
}
