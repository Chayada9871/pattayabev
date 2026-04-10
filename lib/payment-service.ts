import { randomUUID } from "crypto";

import type Stripe from "stripe";

import { getPaymentMethodOption } from "@/lib/checkout-config";
import {
  type CheckoutOrder,
  getOrderByOrderNumber,
  updateOrderPaymentState,
  upsertPaymentRecord
} from "@/lib/orders";
import {
  constructVerifiedStripeEvent,
  createHostedStripeCheckoutSession,
  isStripePaymentConfigured,
  retrieveHostedStripeCheckoutSession
} from "@/lib/stripe";

export type PaymentSessionResponse = {
  orderNumber: string;
  paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded" | "expired";
  orderStatus: string;
  providerName: string;
  paymentReference: string;
  redirectPath: string;
  redirectUrl: string | null;
  gatewaySessionId: string | null;
  message: string;
};

function buildManualPaymentReference(order: CheckoutOrder) {
  return `${order.orderNumber}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function toPaidState(paymentStatus: PaymentSessionResponse["paymentStatus"]) {
  return paymentStatus === "paid" ? "paid" : "pending_payment";
}

function getStripeRedirectPath(orderNumber: string, sessionId?: string | null) {
  const query = new URLSearchParams();
  if (sessionId) {
    query.set("session_id", sessionId);
  }
  const suffix = query.toString();
  return suffix
    ? `/order-confirmation/${orderNumber}?${suffix}`
    : `/order-confirmation/${orderNumber}`;
}

async function buildReusableStripeSessionResponse(order: CheckoutOrder, sessionId: string) {
  const stripeSession = await retrieveHostedStripeCheckoutSession(sessionId);

  if (stripeSession.status === "expired") {
    await updateOrderPaymentState({
      orderId: order.id,
      orderStatus: "pending_payment",
      paymentStatus: "expired",
      gatewayProvider: "stripe",
      gatewaySessionId: stripeSession.id,
      gatewayPaymentId: typeof stripeSession.payment_intent === "string" ? stripeSession.payment_intent : null,
      gatewayReference: stripeSession.id
    });

    await upsertPaymentRecord({
      orderId: order.id,
      providerName: "stripe",
      paymentMethodType: order.paymentMethod,
      paymentReference: stripeSession.id,
      transactionRef:
        typeof stripeSession.payment_intent === "string" ? stripeSession.payment_intent : stripeSession.id,
      gatewaySessionId: stripeSession.id,
      paymentIntentId: typeof stripeSession.payment_intent === "string" ? stripeSession.payment_intent : null,
      amount: order.totalAmount,
      currency: order.currency,
      paymentStatus: "expired",
      rawResponse: stripeSession
    });

    return null;
  }

  if (stripeSession.status === "open" && stripeSession.url) {
    return {
      orderNumber: order.orderNumber,
      paymentStatus: "pending" as const,
      orderStatus: order.orderStatus,
      providerName: "stripe",
      paymentReference: stripeSession.id,
      redirectPath: getStripeRedirectPath(order.orderNumber, stripeSession.id),
      redirectUrl: stripeSession.url,
      gatewaySessionId: stripeSession.id,
      message: "พบรายการชำระเงินที่ยังใช้งานได้ ระบบจะพาไปหน้าชำระเงินจริงต่อทันที"
    };
  }

  return null;
}

export async function createPaymentSessionForOrder(orderNumber: string): Promise<PaymentSessionResponse> {
  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    throw new Error("ไม่พบคำสั่งซื้อที่ต้องการชำระเงิน");
  }

  const paymentMethod = getPaymentMethodOption(order.paymentMethod);

  if (order.paymentStatus === "paid") {
    return {
      orderNumber: order.orderNumber,
      paymentStatus: "paid",
      orderStatus: order.orderStatus,
      providerName: order.providerName ?? paymentMethod.providerName,
      paymentReference: order.paymentReference ?? order.gatewayReference ?? buildManualPaymentReference(order),
      redirectPath: `/order-confirmation/${order.orderNumber}`,
      redirectUrl: null,
      gatewaySessionId: order.gatewaySessionId,
      message: "คำสั่งซื้อนี้ชำระเงินเรียบร้อยแล้ว"
    };
  }

  if (order.paymentMethod === "cod") {
    const paymentReference = order.gatewayReference ?? buildManualPaymentReference(order);

    await upsertPaymentRecord({
      orderId: order.id,
      providerName: "manual",
      paymentMethodType: "cod",
      paymentReference,
      transactionRef: paymentReference,
      amount: order.totalAmount,
      currency: order.currency,
      paymentStatus: "unpaid",
      rawResponse: {
        type: "cash_on_delivery",
        note: "Customer will pay when receiving the order"
      }
    });

    await updateOrderPaymentState({
      orderId: order.id,
      orderStatus: "processing",
      paymentStatus: "unpaid",
      gatewayProvider: "manual",
      gatewayReference: paymentReference
    });

    return {
      orderNumber: order.orderNumber,
      paymentStatus: "unpaid",
      orderStatus: "processing",
      providerName: "manual",
      paymentReference,
      redirectPath: `/order-confirmation/${order.orderNumber}`,
      redirectUrl: null,
      gatewaySessionId: null,
      message: "คำสั่งซื้อถูกบันทึกแล้ว และจะชำระเงินตอนรับสินค้า"
    };
  }

  if (!isStripePaymentConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า Stripe สำหรับรับชำระเงินจริง กรุณาเพิ่ม STRIPE_SECRET_KEY และ STRIPE_WEBHOOK_SECRET ก่อน");
  }

  if (order.gatewayProvider === "stripe" && order.gatewaySessionId && (order.paymentStatus === "pending" || order.paymentStatus === "unpaid")) {
    const reusableSession = await buildReusableStripeSessionResponse(order, order.gatewaySessionId);
    if (reusableSession) {
      return reusableSession;
    }
  }

  const checkoutSession = await createHostedStripeCheckoutSession(order);

  await upsertPaymentRecord({
    orderId: order.id,
    providerName: "stripe",
    paymentMethodType: order.paymentMethod,
    paymentReference: checkoutSession.paymentReference,
    transactionRef: checkoutSession.sessionId,
    gatewaySessionId: checkoutSession.sessionId,
    paymentIntentId: checkoutSession.paymentIntentId,
    amount: order.totalAmount,
    currency: order.currency,
    paymentStatus: "pending",
    rawResponse: {
      sessionId: checkoutSession.sessionId,
      checkoutUrl: checkoutSession.checkoutUrl,
      expiresAt: checkoutSession.expiresAt
    }
  });

  await updateOrderPaymentState({
    orderId: order.id,
    orderStatus: "pending_payment",
    paymentStatus: "pending",
    gatewayProvider: "stripe",
    gatewaySessionId: checkoutSession.sessionId,
    gatewayPaymentId: checkoutSession.paymentIntentId,
    gatewayReference: checkoutSession.paymentReference
  });

  return {
    orderNumber: order.orderNumber,
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    providerName: "stripe",
    paymentReference: checkoutSession.paymentReference,
    redirectPath: getStripeRedirectPath(order.orderNumber, checkoutSession.sessionId),
    redirectUrl: checkoutSession.checkoutUrl,
    gatewaySessionId: checkoutSession.sessionId,
    message: "สร้างหน้าชำระเงินจริงเรียบร้อยแล้ว ระบบจะพาไปยัง Stripe Checkout"
  };
}

function getOrderNumberFromStripeSession(session: Stripe.Checkout.Session) {
  return session.client_reference_id || session.metadata?.orderNumber || null;
}

function mapStripeEventToStatuses(
  eventType: string,
  session: Stripe.Checkout.Session
): {
  paymentStatus: PaymentSessionResponse["paymentStatus"];
  orderStatus: string;
  paidAt: string | null;
} {
  if (eventType === "checkout.session.expired") {
    return {
      paymentStatus: "expired",
      orderStatus: "pending_payment",
      paidAt: null
    };
  }

  if (eventType === "checkout.session.async_payment_failed") {
    return {
      paymentStatus: "failed",
      orderStatus: "pending_payment",
      paidAt: null
    };
  }

  if (eventType === "checkout.session.async_payment_succeeded") {
    return {
      paymentStatus: "paid",
      orderStatus: "paid",
      paidAt: new Date().toISOString()
    };
  }

  if (eventType === "checkout.session.completed" && session.payment_status === "paid") {
    return {
      paymentStatus: "paid",
      orderStatus: "paid",
      paidAt: new Date().toISOString()
    };
  }

  return {
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    paidAt: null
  };
}

export async function processStripeWebhook(payload: string, signature: string | null) {
  const event = constructVerifiedStripeEvent(payload, signature);

  if (!event.type.startsWith("checkout.session.")) {
    return {
      ok: true,
      ignored: true,
      eventType: event.type
    };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderNumber = getOrderNumberFromStripeSession(session);

  if (!orderNumber) {
    throw new Error("Stripe webhook does not contain an order reference");
  }

  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    throw new Error("ไม่พบคำสั่งซื้อที่เกี่ยวข้องกับ Stripe webhook นี้");
  }

  const nextState = mapStripeEventToStatuses(event.type, session);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  await upsertPaymentRecord({
    orderId: order.id,
    providerName: "stripe",
    paymentMethodType: session.metadata?.paymentMethod ?? order.paymentMethod,
    paymentReference: session.id,
    transactionRef: paymentIntentId ?? session.id,
    gatewaySessionId: session.id,
    paymentIntentId,
    amount: order.totalAmount,
    currency: order.currency,
    paymentStatus: nextState.paymentStatus,
    rawResponse: session,
    rawWebhookJson: event,
    paidAt: nextState.paidAt
  });

  await updateOrderPaymentState({
    orderId: order.id,
    orderStatus: nextState.orderStatus,
    paymentStatus: nextState.paymentStatus,
    gatewayProvider: "stripe",
    gatewaySessionId: session.id,
    gatewayPaymentId: paymentIntentId,
    gatewayReference: session.id
  });

  return {
    ok: true,
    ignored: false,
    orderNumber,
    eventType: event.type,
    paymentStatus: nextState.paymentStatus,
    orderStatus: nextState.orderStatus
  };
}
