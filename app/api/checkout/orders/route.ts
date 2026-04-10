import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  createOrder,
  type BillingAddressInput,
  type CheckoutCartLineInput,
  getCheckoutSchemaMessage,
  type ShippingAddressInput
} from "@/lib/orders";

type RequestBody = {
  cartItems?: CheckoutCartLineInput[];
  shippingAddress?: ShippingAddressInput;
  billingAddress?: BillingAddressInput;
  deliveryMethod?: "standard" | "express";
  paymentMethod?: "promptpay" | "card" | "cod";
  notes?: string;
  guestId?: string;
  ageConfirmed?: boolean;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!body.cartItems?.length) {
      return NextResponse.json({ error: "ยังไม่มีสินค้าในตะกร้า" }, { status: 400 });
    }

    if (!body.shippingAddress || !body.billingAddress || !body.deliveryMethod || !body.paymentMethod) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลคำสั่งซื้อให้ครบถ้วน" }, { status: 400 });
    }

    const order = await createOrder({
      userId: session?.user?.id ?? null,
      guestId: body.guestId?.trim() || "guest-checkout",
      cartItems: body.cartItems,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      deliveryMethod: body.deliveryMethod,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      ageConfirmed: Boolean(body.ageConfirmed)
    });

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      summary: order.summary
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถสร้างคำสั่งซื้อได้";
    const isSchemaError = message === getCheckoutSchemaMessage();

    return NextResponse.json({ error: message }, { status: isSchemaError ? 503 : 400 });
  }
}

