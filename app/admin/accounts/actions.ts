"use server";

import { revalidatePath } from "next/cache";

import { requireRole, requireSession } from "@/lib/auth";
import { adminUpdateAccountRole } from "@/lib/admin-accounts";
import type { AppRole } from "@/lib/auth-utils";

export type AdminAccountActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const allowedRoles = new Set<AppRole>(["admin", "manager", "user"]);

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateAdminAccountRoleAction(
  _: AdminAccountActionState,
  formData: FormData
): Promise<AdminAccountActionState> {
  await requireRole("admin");

  const session = await requireSession();
  const userId = getTextValue(formData, "userId");
  const role = getTextValue(formData, "role") as AppRole;

  if (!userId) {
    return {
      status: "error",
      message: "ไม่พบบัญชีผู้ใช้ที่ต้องการอัปเดต"
    };
  }

  if (!allowedRoles.has(role)) {
    return {
      status: "error",
      message: "กรุณาเลือกระดับสิทธิ์ให้ถูกต้อง"
    };
  }

  if (String(session.user.id) === userId && role !== "admin") {
    return {
      status: "error",
      message: "ไม่สามารถลดสิทธิ์ของบัญชีแอดมินที่กำลังใช้งานอยู่ได้"
    };
  }

  try {
    await adminUpdateAccountRole(userId, role);

    revalidatePath("/admin/accounts");

    return {
      status: "success",
      message: "อัปเดตสิทธิ์ผู้ใช้เรียบร้อยแล้ว"
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้"
    };
  }
}
