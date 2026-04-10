"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { adminUpdateBusinessStatus } from "@/lib/admin-business";
import type { BusinessStatus } from "@/lib/business";

export type AdminBusinessActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const allowedStatuses = new Set<Exclude<BusinessStatus, null>>(["pending", "approved", "rejected"]);

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateAdminBusinessStatusAction(
  _: AdminBusinessActionState,
  formData: FormData
): Promise<AdminBusinessActionState> {
  await requireRole("admin");

  const profileId = getTextValue(formData, "profileId");
  const nextStatus = getTextValue(formData, "status") as BusinessStatus;

  if (!profileId) {
    return {
      status: "error",
      message: "ไม่พบคำขอ B2B ที่ต้องการอัปเดต"
    };
  }

  if (!allowedStatuses.has(nextStatus as Exclude<BusinessStatus, null>)) {
    return {
      status: "error",
      message: "กรุณาเลือกสถานะให้ถูกต้อง"
    };
  }

  try {
    await adminUpdateBusinessStatus(profileId, nextStatus as Exclude<BusinessStatus, null>);

    revalidatePath("/admin/b2b");
    revalidatePath(`/admin/b2b/${profileId}`);
    revalidatePath("/account");
    revalidatePath("/account/b2b");

    return {
      status: "success",
      message: "อัปเดตสถานะ B2B เรียบร้อยแล้ว"
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะ B2B ได้"
    };
  }
}
