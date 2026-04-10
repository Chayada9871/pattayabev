import { NextResponse } from "next/server";

import { getCheckoutSchemaMessage, getOrderByIdentifier } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const order = await getOrderByIdentifier(params.orderNumber);

    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้";
    const isSchemaError = message === getCheckoutSchemaMessage();

    return NextResponse.json({ error: message }, { status: isSchemaError ? 503 : 400 });
  }
}
