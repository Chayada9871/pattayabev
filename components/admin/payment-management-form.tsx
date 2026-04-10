"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  updateAdminPaymentAction,
  type AdminPaymentActionState
} from "@/app/admin/payments/actions";

type PaymentManagementFormProps = {
  orderId: string;
  orderNumber: string;
  providerName: string | null;
  paymentReference: string | null;
  transactionRef: string | null;
  paymentStatus: string;
  orderStatus: string;
  paymentMethodType: string;
};

const initialState: AdminPaymentActionState = {
  status: "idle",
  message: ""
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-[#171212] px-5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#2b2424] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
    </button>
  );
}

function getRecommendedOrderStatus(paymentStatus: string) {
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "refunded") return "cancelled";
  return "pending_payment";
}

export function PaymentManagementForm({
  orderId,
  orderNumber,
  providerName,
  paymentReference,
  transactionRef,
  paymentStatus,
  orderStatus,
  paymentMethodType
}: PaymentManagementFormProps) {
  const [state, formAction] = useFormState(updateAdminPaymentAction, initialState);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(paymentStatus);
  const [currentOrderStatus, setCurrentOrderStatus] = useState(orderStatus);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="orderNumber" value={orderNumber} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#171212]">
          <span>ผู้ให้บริการชำระเงิน</span>
          <input
            name="providerName"
            defaultValue={providerName ?? "stripe"}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#171212]">
          <span>วิธีชำระเงิน</span>
          <select
            name="paymentMethodType"
            defaultValue={paymentMethodType}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          >
            <option value="promptpay">พร้อมเพย์ QR</option>
            <option value="card">บัตรเครดิต / เดบิต</option>
            <option value="cod">เก็บเงินปลายทาง</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#171212]">
          <span>เลขอ้างอิงการชำระเงิน</span>
          <input
            name="paymentReference"
            required
            defaultValue={paymentReference ?? orderNumber}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#171212]">
          <span>เลขอ้างอิงธุรกรรม</span>
          <input
            name="transactionRef"
            defaultValue={transactionRef ?? ""}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#171212]">
          <span>สถานะการชำระเงิน</span>
          <select
            name="paymentStatus"
            value={currentPaymentStatus}
            onChange={(event) => {
              const nextPaymentStatus = event.target.value;
              setCurrentPaymentStatus(nextPaymentStatus);
              setCurrentOrderStatus((previous) => {
                if (["processing", "shipped", "completed"].includes(previous)) {
                  return previous;
                }

                return getRecommendedOrderStatus(nextPaymentStatus);
              });
            }}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          >
            <option value="unpaid">ยังไม่ชำระ</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="failed">ชำระไม่สำเร็จ</option>
            <option value="expired">หมดอายุ</option>
            <option value="refunded">คืนเงินแล้ว</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#171212]">
          <span>สถานะคำสั่งซื้อ</span>
          <select
            name="orderStatus"
            value={currentOrderStatus}
            onChange={(event) => setCurrentOrderStatus(event.target.value)}
            className="min-h-[46px] rounded-2xl border border-[#ddd3c5] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
          >
            <option value="cart">ในตะกร้า</option>
            <option value="pending_payment">รอชำระเงิน</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="processing">กำลังเตรียมสินค้า</option>
            <option value="shipped">จัดส่งแล้ว</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </label>
      </div>

      <div className="rounded-[20px] border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-sm leading-7 text-[#5f5852]">
        <p className="font-semibold text-[#171212]">หมายเหตุ</p>
        <p className="mt-2">
          ควรเปลี่ยนเป็น <span className="font-semibold text-[#171212]">ชำระแล้ว</span> เฉพาะเมื่อคุณตรวจสอบการรับเงินจริงจากเกตเวย์,
          การโอนเงิน, หรือหลักฐานที่ยืนยันได้แล้วเท่านั้น
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#ece4d6] bg-white px-4 py-4">
        <div className="min-h-[24px] text-sm font-medium">
          {state.message ? (
            <p className={state.status === "success" ? "text-[#207443]" : "text-[#a61b1f]"}>{state.message}</p>
          ) : (
            <p className="text-[#7a736b]">เมื่อบันทึกแล้ว สถานะการชำระเงินและสถานะออเดอร์ของลูกค้าจะอัปเดตตามไปพร้อมกัน</p>
          )}
        </div>
        <SaveButton />
      </div>
    </form>
  );
}
