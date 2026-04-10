"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { adminUpdatePaymentStatus } from "@/lib/admin-payments";

export type AdminPaymentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const allowedPaymentStatuses = new Set(["unpaid", "pending", "paid", "failed", "refunded", "expired"]);
const allowedOrderStatuses = new Set(["cart", "pending_payment", "paid", "processing", "shipped", "completed", "cancelled"]);

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateAdminPaymentAction(
  _: AdminPaymentActionState,
  formData: FormData
): Promise<AdminPaymentActionState> {
  await requireRole("admin");

  const orderId = getTextValue(formData, "orderId");
  const orderNumber = getTextValue(formData, "orderNumber");
  const providerName = getTextValue(formData, "providerName") || "stripe";
  const paymentReference = getTextValue(formData, "paymentReference");
  const transactionRef = getTextValue(formData, "transactionRef");
  const paymentStatus = getTextValue(formData, "paymentStatus");
  const orderStatus = getTextValue(formData, "orderStatus");
  const paymentMethodType = getTextValue(formData, "paymentMethodType");

  if (!orderId || !orderNumber) {
    return {
      status: "error",
      message: "ไม่พบข้อมูลคำสั่งซื้อที่ต้องการอัปเดต"
    };
  }

  if (!paymentReference) {
    return {
      status: "error",
      message: "กรุณากรอกเลขอ้างอิงการชำระเงิน"
    };
  }

  if (!allowedPaymentStatuses.has(paymentStatus)) {
    return {
      status: "error",
      message: "กรุณาเลือกสถานะการชำระเงินให้ถูกต้อง"
    };
  }

  if (!allowedOrderStatuses.has(orderStatus)) {
    return {
      status: "error",
      message: "กรุณาเลือกสถานะคำสั่งซื้อให้ถูกต้อง"
    };
  }

  try {
    await adminUpdatePaymentStatus({
      orderId,
      orderNumber,
      providerName,
      paymentReference,
      transactionRef: transactionRef || null,
      paymentStatus,
      orderStatus,
      paymentMethodType: paymentMethodType || null
    });

    revalidatePath("/admin/payments");
    revalidatePath(`/admin/payments/${orderNumber}`);
    revalidatePath(`/order-confirmation/${orderNumber}`);
    revalidatePath(`/order-confirmation/${orderNumber}/invoice`);
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${orderNumber}`);

    return {
      status: "success",
      message: "บันทึกสถานะการชำระเงินเรียบร้อยแล้ว"
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะการชำระเงินได้"
    };
  }
}
