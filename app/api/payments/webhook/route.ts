import { NextResponse } from "next/server";

import { getCheckoutSchemaMessage } from "@/lib/orders";
import { processStripeWebhook } from "@/lib/payment-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await processStripeWebhook(payload, signature);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    const isSchemaError = message === getCheckoutSchemaMessage();

    return NextResponse.json({ error: message }, { status: isSchemaError ? 503 : 400 });
  }
}

