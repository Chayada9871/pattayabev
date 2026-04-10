import { NextResponse } from "next/server";

import { getCheckoutSchemaMessage } from "@/lib/orders";
import { createPaymentSessionForOrder } from "@/lib/payment-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderNumber?: string };
    const orderNumber = body.orderNumber?.trim();

    if (!orderNumber) {
      return NextResponse.json({ error: "ไม่พบหมายเลขคำสั่งซื้อ" }, { status: 400 });
    }

    const session = await createPaymentSessionForOrder(orderNumber);
    return NextResponse.json({ ok: true, session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถสร้างรายการชำระเงินจริงได้";
    const isSchemaError = message === getCheckoutSchemaMessage();

    return NextResponse.json({ error: message }, { status: isSchemaError ? 503 : 400 });
  }
}

