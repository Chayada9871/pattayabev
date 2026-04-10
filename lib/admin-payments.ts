import { db } from "@/lib/db";
import { getCheckoutSchemaMessage, getOrderByOrderNumber } from "@/lib/orders";

type QueryRow = Record<string, unknown>;

export type AdminPaymentListItem = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  providerName: string | null;
  paymentReference: string | null;
  transactionRef: string | null;
  paidAt: string | null;
};

export type AdminPaymentSummary = {
  totalOrders: number;
  awaitingPayment: number;
  paidOrders: number;
  problemOrders: number;
  totalPaidAmount: number;
};

export type AdminPaymentRecord = {
  id: string;
  providerName: string;
  paymentMethodType: string | null;
  paymentReference: string;
  transactionRef: string | null;
  paymentIntentId: string | null;
  amount: number;
  currency: string;
  paymentStatus: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  rawResponse: string;
  rawWebhookJson: string;
};

export type AdminPaymentDetail = {
  order: NonNullable<Awaited<ReturnType<typeof getOrderByOrderNumber>>>;
  payments: AdminPaymentRecord[];
};

export type AdminPaymentFilters = {
  query?: string;
  paymentStatus?: string;
  paymentMethod?: string;
};

function isMissingCheckoutSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }

  return 0;
}

function sanitizeText(value: string | undefined | null) {
  return (value ?? "").trim();
}

function mapAdminPaymentListItem(row: QueryRow): AdminPaymentListItem {
  return {
    orderId: String(row.order_id),
    orderNumber: String(row.order_number),
    customerName: String(row.customer_name ?? "-"),
    customerEmail: String(row.customer_email ?? "-"),
    customerPhone: String(row.customer_phone ?? "-"),
    totalAmount: toNumber(row.total_amount),
    currency: String(row.currency ?? "THB"),
    paymentMethod: String(row.payment_method ?? "promptpay"),
    orderStatus: String(row.order_status ?? "pending_payment"),
    paymentStatus: String(row.payment_status ?? "unpaid"),
    createdAt: String(row.created_at),
    providerName: row.provider_name ? String(row.provider_name) : null,
    paymentReference: row.payment_reference ? String(row.payment_reference) : null,
    transactionRef: row.transaction_ref ? String(row.transaction_ref) : null,
    paidAt: row.paid_at ? String(row.paid_at) : null
  };
}

export async function getAdminPaymentSummary(): Promise<AdminPaymentSummary> {
  try {
    const result = await db.query(
      `
        select
          count(*)::int as total_orders,
          count(*) filter (where payment_status in ('unpaid', 'pending'))::int as awaiting_payment,
          count(*) filter (where payment_status = 'paid')::int as paid_orders,
          count(*) filter (where payment_status in ('failed', 'expired', 'refunded'))::int as problem_orders,
          coalesce(sum(total_amount) filter (where payment_status = 'paid'), 0) as total_paid_amount
        from public.orders
      `
    );

    const row = result.rows[0] ?? {};

    return {
      totalOrders: Number(row.total_orders ?? 0),
      awaitingPayment: Number(row.awaiting_payment ?? 0),
      paidOrders: Number(row.paid_orders ?? 0),
      problemOrders: Number(row.problem_orders ?? 0),
      totalPaidAmount: toNumber(row.total_paid_amount)
    };
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      throw new Error(getCheckoutSchemaMessage());
    }

    throw error;
  }
}

export async function getAdminPayments(filters: AdminPaymentFilters = {}, limit = 100): Promise<AdminPaymentListItem[]> {
  const query = sanitizeText(filters.query);
  const paymentStatus = sanitizeText(filters.paymentStatus);
  const paymentMethod = sanitizeText(filters.paymentMethod);

  try {
    const result = await db.query(
      `
        select
          o.id as order_id,
          o.order_number,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.total_amount,
          o.currency,
          o.payment_method,
          o.order_status,
          o.payment_status,
          o.created_at,
          lp.provider_name,
          lp.payment_reference,
          lp.transaction_ref,
          lp.paid_at
        from public.orders o
        left join lateral (
          select provider_name, payment_reference, transaction_ref, paid_at
          from public.payments
          where order_id = o.id
          order by created_at desc
          limit 1
        ) lp on true
        where (
          $1 = ''
          or o.order_number ilike '%' || $1 || '%'
          or o.customer_name ilike '%' || $1 || '%'
          or o.customer_email ilike '%' || $1 || '%'
          or coalesce(lp.payment_reference, '') ilike '%' || $1 || '%'
          or coalesce(lp.transaction_ref, '') ilike '%' || $1 || '%'
        )
          and ($2 = '' or o.payment_status = $2)
          and ($3 = '' or o.payment_method = $3)
        order by o.created_at desc
        limit $4
      `,
      [query, paymentStatus, paymentMethod, limit]
    );

    return result.rows.map(mapAdminPaymentListItem);
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      throw new Error(getCheckoutSchemaMessage());
    }

    throw error;
  }
}

export async function getAdminPaymentDetail(orderNumber: string): Promise<AdminPaymentDetail | null> {
  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    return null;
  }

  try {
    const paymentsResult = await db.query(
      `
        select
          id,
          provider_name,
          payment_method_type,
          payment_reference,
          transaction_ref,
          payment_intent_id,
          amount,
          currency,
          payment_status,
          paid_at,
          created_at,
          updated_at,
          raw_response,
          raw_webhook_json
        from public.payments
        where order_id = $1::uuid
        order by created_at desc
      `,
      [order.id]
    );

    return {
      order,
      payments: paymentsResult.rows.map((row) => ({
        id: String(row.id),
        providerName: String(row.provider_name ?? "stripe"),
        paymentMethodType: row.payment_method_type ? String(row.payment_method_type) : null,
        paymentReference: String(row.payment_reference ?? "-"),
        transactionRef: row.transaction_ref ? String(row.transaction_ref) : null,
        paymentIntentId: row.payment_intent_id ? String(row.payment_intent_id) : null,
        amount: toNumber(row.amount),
        currency: String(row.currency ?? "THB"),
        paymentStatus: String(row.payment_status ?? "unpaid"),
        paidAt: row.paid_at ? String(row.paid_at) : null,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
        rawResponse: JSON.stringify(row.raw_response ?? {}, null, 2),
        rawWebhookJson: JSON.stringify(row.raw_webhook_json ?? {}, null, 2)
      }))
    };
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      throw new Error(getCheckoutSchemaMessage());
    }

    throw error;
  }
}

export async function adminUpdatePaymentStatus(args: {
  orderId: string;
  orderNumber: string;
  providerName: string;
  paymentReference: string;
  transactionRef?: string | null;
  paymentStatus: string;
  orderStatus: string;
  paymentMethodType?: string | null;
}) {
  const connection = await db.connect();

  try {
    await connection.query("begin");

    const orderResult = await connection.query(
      `
        select id, currency, total_amount, payment_method
        from public.orders
        where id = $1::uuid
          and order_number = $2
        limit 1
      `,
      [args.orderId, args.orderNumber]
    );

    if (!orderResult.rowCount) {
      throw new Error("ไม่พบคำสั่งซื้อที่ต้องการอัปเดต");
    }

    const order = orderResult.rows[0];
    const paidAt = args.paymentStatus === "paid" ? new Date().toISOString() : null;

    const existingPayment = await connection.query(
      `
        select id
        from public.payments
        where order_id = $1::uuid
          and provider_name = $2
        order by created_at desc
        limit 1
      `,
      [args.orderId, args.providerName]
    );

    if (existingPayment.rowCount) {
      await connection.query(
        `
          update public.payments
          set
            provider = $2,
            provider_name = $2,
            payment_method_type = coalesce($3, payment_method_type),
            payment_reference = $4,
            transaction_ref = $5,
            amount = $6,
            currency = $7,
            payment_status = $8,
            paid_at = $9::timestamptz,
            updated_at = now()
          where id = $1::uuid
        `,
        [
          String(existingPayment.rows[0].id),
          args.providerName,
          args.paymentMethodType ?? String(order.payment_method ?? "promptpay"),
          args.paymentReference,
          args.transactionRef ?? null,
          toNumber(order.total_amount),
          String(order.currency ?? "THB"),
          args.paymentStatus,
          paidAt
        ]
      );
    } else {
      await connection.query(
        `
          insert into public.payments (
            order_id,
            provider,
            provider_name,
            payment_method_type,
            payment_reference,
            transaction_ref,
            amount,
            currency,
            payment_status,
            raw_response,
            raw_webhook_json,
            paid_at
          )
          values ($1::uuid, $2, $2, $3, $4, $5, $6, $7, $8, '{}'::jsonb, '{}'::jsonb, $9::timestamptz)
        `,
        [
          args.orderId,
          args.providerName,
          args.paymentMethodType ?? String(order.payment_method ?? "promptpay"),
          args.paymentReference,
          args.transactionRef ?? null,
          toNumber(order.total_amount),
          String(order.currency ?? "THB"),
          args.paymentStatus,
          paidAt
        ]
      );
    }

    await connection.query(
      `
        update public.orders
        set
          order_status = $2,
          payment_status = $3,
          gateway_provider = $4,
          gateway_payment_id = coalesce($5, gateway_payment_id),
          gateway_reference = $6,
          updated_at = now()
        where id = $1::uuid
      `,
      [
        args.orderId,
        args.orderStatus,
        args.paymentStatus,
        args.providerName,
        args.transactionRef ?? null,
        args.paymentReference
      ]
    );

    await connection.query("commit");
  } catch (error) {
    await connection.query("rollback");

    if (isMissingCheckoutSchema(error)) {
      throw new Error(getCheckoutSchemaMessage());
    }

    throw error;
  } finally {
    connection.release();
  }
}
