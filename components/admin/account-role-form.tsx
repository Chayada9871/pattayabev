"use client";

import { useFormState, useFormStatus } from "react-dom";

import {
  updateAdminAccountRoleAction,
  type AdminAccountActionState
} from "@/app/admin/accounts/actions";
import type { AppRole } from "@/lib/auth-utils";

const initialState: AdminAccountActionState = {
  status: "idle",
  message: ""
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-full bg-[#171212] px-4 text-xs font-bold text-white transition hover:bg-[#2b2424] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "กำลังบันทึก..." : "บันทึก"}
    </button>
  );
}

export function AccountRoleForm({ userId, role }: { userId: string; role: AppRole }) {
  const [state, formAction] = useFormState(updateAdminAccountRoleAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />

      <select
        name="role"
        defaultValue={role}
        className="min-h-[42px] w-full rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
      >
        <option value="user">ลูกค้าทั่วไป</option>
        <option value="manager">ผู้จัดการ</option>
        <option value="admin">แอดมิน</option>
      </select>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[20px] text-xs">
          {state.message ? (
            <p className={state.status === "success" ? "text-[#207443]" : "text-[#a61b1f]"}>{state.message}</p>
          ) : null}
        </div>
        <SaveButton />
      </div>
    </form>
  );
}
