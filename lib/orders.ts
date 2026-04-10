import { randomUUID } from "crypto";

import { db } from "@/lib/db";
import {
  estimateProductWeightKg,
  calculateShippingFee,
  type DeliveryMethod,
  type PaymentMethod
} from "@/lib/checkout-config";
import { isValidGoogleMapsUrl, parseLatitude, parseLongitude } from "@/lib/google-maps";

type QueryRow = Record<string, unknown>;

export type CheckoutCartLineInput = {
  productId: string;
  quantity: number;
};

export type ShippingAddressInput = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  googleMapsUrl?: string;
  latitude?: string;
  longitude?: string;
  deliveryNote?: string;
};

export type BillingAddressInput = {
  useSameAsShipping: boolean;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone?: string;
  email?: string;
  companyName?: string;
  taxId?: string;
  branchInfo?: string;
  requiresTaxInvoice: boolean;
};

export type CreateOrderInput = {
  userId: string | null;
  guestId: string;
  cartItems: CheckoutCartLineInput[];
  shippingAddress: ShippingAddressInput;
  billingAddress: BillingAddressInput;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
  ageConfirmed: boolean;
};

export type ValidatedOrderItem = {
  productId: string;
  productName: string;
  productImage: string | null;
  currency: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  subtotal: number;
  discountAmount: number;
  estimatedWeightKg: number;
};

export type OrderSummary = {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
};

export type CheckoutOrder = {
  id: string;
  userId: string | null;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  deliveryMethod: string;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  gatewayProvider: string | null;
  gatewaySessionId: string | null;
  gatewayPaymentId: string | null;
  gatewayReference: string | null;
  ageConfirmationAccepted: boolean;
  shippingAddress: ShippingAddressInput;
  billingAddress: BillingAddressInput;
  items: ValidatedOrderItem[];
  paymentReference: string | null;
  providerName: string | null;
};

export type AccountOrderListItem = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
};

function isMissingCheckoutSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

export function getCheckoutSchemaMessage() {
  return "กรุณารัน supabase/create-checkout-orders.sql สำหรับฐานข้อมูลใหม่ หรือหากใช้ฐานข้อมูลเดิมให้รัน supabase/add-checkout-shipping-map-fields.sql และ supabase/upgrade-checkout-real-payments.sql ก่อนใช้งานระบบ checkout และชำระเงินจริง";
}

function sanitizeText(value: string | undefined | null) {
  return (value ?? "").trim();
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function isValidThaiPhoneNumber(value: string) {
  return /^0\d{8,9}$/.test(normalizePhoneNumber(value));
}

export function isValidPostalCode(value: string) {
  return /^\d{5}$/.test(sanitizeText(value));
}

export function isValidTaxId(value: string) {
  return /^\d{13}$/.test(sanitizeText(value));
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

function createOrderNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const token = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `PBV${yy}${mm}${dd}-${token}`;
}

function validateShippingAddress(address: ShippingAddressInput) {
  const requiredFields = [
    address.fullName,
    address.phone,
    address.email,
    address.addressLine1,
    address.subdistrict,
    address.district,
    address.province,
    address.postalCode
  ];

  if (requiredFields.some((field) => !sanitizeText(field))) {
    throw new Error("กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน");
  }

  if (!isValidThaiPhoneNumber(address.phone)) {
    throw new Error("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
  }

  if (!isValidPostalCode(address.postalCode)) {
    throw new Error("กรุณากรอกรหัสไปรษณีย์ 5 หลัก");
  }

  if (sanitizeText(address.googleMapsUrl) && !isValidGoogleMapsUrl(address.googleMapsUrl ?? "")) {
    throw new Error("กรุณาวางลิงก์ Google Maps ที่ถูกต้อง");
  }

  if (sanitizeText(address.latitude) && parseLatitude(address.latitude ?? "") == null) {
    throw new Error("กรุณากรอกละติจูดให้ถูกต้อง");
  }

  if (sanitizeText(address.longitude) && parseLongitude(address.longitude ?? "") == null) {
    throw new Error("กรุณากรอกลองจิจูดให้ถูกต้อง");
  }
}

function validateBillingAddress(address: BillingAddressInput) {
  const requiredBaseFields = [
    address.fullName,
    address.addressLine1,
    address.subdistrict,
    address.district,
    address.province,
    address.postalCode
  ];

  if (requiredBaseFields.some((field) => !sanitizeText(field))) {
    throw new Error("กรุณากรอกข้อมูลออกใบกำกับภาษีให้ครบถ้วน");
  }

  if (!isValidPostalCode(address.postalCode)) {
    throw new Error("กรุณากรอกรหัสไปรษณีย์ 5 หลัก");
  }

  if (address.phone && !isValidThaiPhoneNumber(address.phone)) {
    throw new Error("กรุณากรอกเบอร์โทรสำหรับออกใบกำกับภาษีให้ถูกต้อง");
  }

  if (address.requiresTaxInvoice) {
    if (!sanitizeText(address.companyName)) {
      throw new Error("กรุณากรอกชื่อบริษัทสำหรับออกใบกำกับภาษี");
    }

    if (!sanitizeText(address.taxId)) {
      throw new Error("กรุณากรอกเลขประจำตัวผู้เสียภาษี");
    }

    if (!isValidTaxId(address.taxId ?? "")) {
      throw new Error("กรุณากรอกเลขประจำตัวผู้เสียภาษี 13 หลัก");
    }
  }
}

function mapValidatedItem(row: QueryRow, quantity: number): ValidatedOrderItem {
  const basePrice = toNumber(row.price);
  const discountPercent = row.active_discount_percent ? Number(row.active_discount_percent) : 0;
  const unitPrice = Math.max(0, basePrice - basePrice * (discountPercent / 100));
  const subtotal = unitPrice * quantity;
  const originalSubtotal = basePrice * quantity;

  return {
    productId: String(row.id),
    productName: String(row.name),
    productImage: row.image_url ? String(row.image_url) : null,
    currency: row.currency ? String(row.currency) : "THB",
    quantity,
    unitPrice,
    originalUnitPrice: basePrice,
    subtotal,
    discountAmount: Math.max(0, originalSubtotal - subtotal),
    estimatedWeightKg: estimateProductWeightKg(toNumber(row.bottle_size_ml))
  };
}

export async function validateCartItems(cartItems: CheckoutCartLineInput[]) {
  if (!cartItems.length) {
    throw new Error("ยังไม่มีสินค้าในตะกร้า");
  }

  const sanitizedItems = cartItems
    .map((item) => ({
      productId: sanitizeText(item.productId),
      quantity: Number.isFinite(item.quantity) ? Math.max(1, Math.floor(item.quantity)) : 1
    }))
    .filter((item) => item.productId);

  if (!sanitizedItems.length) {
    throw new Error("ยังไม่มีสินค้าในตะกร้า");
  }

  let result;

  try {
    result = await db.query(
      `
        select
          p.id,
          p.name,
          p.price,
          p.currency,
          p.bottle_size_ml,
          p.in_stock,
          p.stock_qty,
          (
            select pi.image_url
            from public.product_images pi
            where pi.product_id = p.id
            order by pi.is_main desc, pi.sort_order asc
            limit 1
          ) as image_url,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = p.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent
        from public.products p
        where p.id = any($1::uuid[])
          and p.is_active = true
      `,
      [sanitizedItems.map((item) => item.productId)]
    );
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      result = await db.query(
        `
          select
            p.id,
            p.name,
            p.price,
            p.currency,
            p.bottle_size_ml,
            p.in_stock,
            p.stock_qty,
            (
              select pi.image_url
              from public.product_images pi
              where pi.product_id = p.id
              order by pi.is_main desc, pi.sort_order asc
              limit 1
            ) as image_url,
            null::numeric as active_discount_percent
          from public.products p
          where p.id = any($1::uuid[])
            and p.is_active = true
        `,
        [sanitizedItems.map((item) => item.productId)]
      );
    } else {
      throw error;
    }
  }

  const rowsById = new Map<string, QueryRow>(result.rows.map((row) => [String(row.id), row]));

  return sanitizedItems.map((item) => {
    const row = rowsById.get(item.productId);

    if (!row) {
      throw new Error("มีสินค้าบางรายการไม่พร้อมจำหน่ายแล้ว");
    }

    if (!row.in_stock) {
      throw new Error(`สินค้า ${String(row.name)} หมดสต็อก`);
    }

    const stockQty = Number(row.stock_qty ?? 0);
    if (stockQty > 0 && item.quantity > stockQty) {
      throw new Error(`สินค้า ${String(row.name)} มีสต็อกไม่เพียงพอ`);
    }

    return mapValidatedItem(row, item.quantity);
  });
}

export function calculateOrderSummary(
  items: ValidatedOrderItem[],
  deliveryMethod: DeliveryMethod,
  destinationAddress: Pick<ShippingAddressInput, "province" | "district" | "subdistrict" | "postalCode" | "latitude" | "longitude">
): OrderSummary {
  const subtotal = items.reduce((total, item) => total + item.originalUnitPrice * item.quantity, 0);
  const discountAmount = items.reduce((total, item) => total + item.discountAmount, 0);
  const chargedSubtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const totalEstimatedWeightKg = items.reduce((total, item) => total + item.estimatedWeightKg * item.quantity, 0);
  const shippingFee = calculateShippingFee({
    deliveryMethod,
    province: destinationAddress.province,
    district: destinationAddress.district,
    subdistrict: destinationAddress.subdistrict,
    postalCode: destinationAddress.postalCode,
    totalWeightKg: totalEstimatedWeightKg,
    latitude: destinationAddress.latitude,
    longitude: destinationAddress.longitude
  }).fee;

  return {
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount: chargedSubtotal + shippingFee,
    currency: items[0]?.currency ?? "THB"
  };
}

export async function createOrder(input: CreateOrderInput) {
  validateShippingAddress(input.shippingAddress);
  validateBillingAddress(input.billingAddress);

  if (!input.ageConfirmed) {
    throw new Error("กรุณายืนยันอายุและการสั่งซื้ออย่างมีความรับผิดชอบ");
  }

  const validatedItems = await validateCartItems(input.cartItems);
  const summary = calculateOrderSummary(validatedItems, input.deliveryMethod, {
    province: input.shippingAddress.province,
    district: input.shippingAddress.district,
    subdistrict: input.shippingAddress.subdistrict,
    postalCode: input.shippingAddress.postalCode,
    latitude: input.shippingAddress.latitude,
    longitude: input.shippingAddress.longitude
  });
  const orderNumber = createOrderNumber();
  const connection = await db.connect();

  try {
    await connection.query("begin");

    const orderResult = await connection.query(
      `
        insert into public.orders (
          order_number,
          user_id,
          guest_id,
          customer_name,
          customer_email,
          customer_phone,
          subtotal,
          shipping_fee,
          discount_amount,
          total_amount,
          grand_total,
          currency,
          delivery_method,
          shipping_method,
          payment_method,
          order_status,
          payment_status,
          notes,
          age_confirmed,
          age_confirmation_accepted,
          gateway_provider,
          gateway_session_id,
          gateway_payment_id,
          gateway_reference
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $12, $13, 'pending_payment', 'unpaid', $14, $15, $15, null, null, null, null
        )
        returning id
      `,
      [
        orderNumber,
        input.userId,
        input.guestId,
        sanitizeText(input.shippingAddress.fullName),
        sanitizeText(input.shippingAddress.email),
        normalizePhoneNumber(input.shippingAddress.phone),
        summary.subtotal,
        summary.shippingFee,
        summary.discountAmount,
        summary.totalAmount,
        summary.currency,
        input.deliveryMethod,
        input.paymentMethod,
        sanitizeText(input.notes),
        input.ageConfirmed
      ]
    );

    const orderId = String(orderResult.rows[0].id);

    for (const item of validatedItems) {
      await connection.query(
        `
          insert into public.order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            unit_price,
            quantity,
            subtotal
          )
          values ($1, $2::uuid, $3, $4, $5, $6, $7)
        `,
        [orderId, item.productId, item.productName, item.productImage, item.unitPrice, item.quantity, item.subtotal]
      );
    }

    const shippingAddressResult = await connection.query(
      `
        insert into public.shipping_addresses (
          order_id,
          full_name,
          phone,
          email,
          address_line_1,
          address_line_2,
          subdistrict,
          district,
          province,
          postal_code,
          google_maps_url,
          latitude,
          longitude,
          delivery_note
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        returning id
      `,
      [
        orderId,
        sanitizeText(input.shippingAddress.fullName),
        normalizePhoneNumber(input.shippingAddress.phone),
        sanitizeText(input.shippingAddress.email),
        sanitizeText(input.shippingAddress.addressLine1),
        sanitizeText(input.shippingAddress.addressLine2),
        sanitizeText(input.shippingAddress.subdistrict),
        sanitizeText(input.shippingAddress.district),
        sanitizeText(input.shippingAddress.province),
        sanitizeText(input.shippingAddress.postalCode),
        sanitizeText(input.shippingAddress.googleMapsUrl),
        parseLatitude(input.shippingAddress.latitude ?? ""),
        parseLongitude(input.shippingAddress.longitude ?? ""),
        sanitizeText(input.shippingAddress.deliveryNote)
      ]
    );

    const billingAddressResult = await connection.query(
      `
        insert into public.billing_addresses (
          order_id,
          full_name,
          address_line_1,
          address_line_2,
          subdistrict,
          district,
          province,
          postal_code,
          phone,
          email,
          company_name,
          tax_id,
          branch_info,
          requires_tax_invoice
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        returning id
      `,
      [
        orderId,
        sanitizeText(input.billingAddress.fullName),
        sanitizeText(input.billingAddress.addressLine1),
        sanitizeText(input.billingAddress.addressLine2),
        sanitizeText(input.billingAddress.subdistrict),
        sanitizeText(input.billingAddress.district),
        sanitizeText(input.billingAddress.province),
        sanitizeText(input.billingAddress.postalCode),
        sanitizeText(input.billingAddress.phone),
        sanitizeText(input.billingAddress.email),
        sanitizeText(input.billingAddress.companyName),
        sanitizeText(input.billingAddress.taxId),
        sanitizeText(input.billingAddress.branchInfo),
        input.billingAddress.requiresTaxInvoice
      ]
    );

    await connection.query(
      `
        update public.orders
        set
          shipping_address_id = $2::uuid,
          billing_address_id = $3::uuid,
          updated_at = now()
        where id = $1::uuid
      `,
      [orderId, String(shippingAddressResult.rows[0].id), String(billingAddressResult.rows[0].id)]
    );

    await connection.query("commit");

    return {
      orderId,
      orderNumber,
      summary,
      items: validatedItems
    };
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

export async function getOrderByOrderNumber(orderNumber: string): Promise<CheckoutOrder | null> {
  try {
    const orderResult = await db.query(
      `
        select
          o.id,
          o.user_id,
          o.order_number,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.subtotal,
          o.shipping_fee,
          o.discount_amount,
          o.total_amount,
          o.currency,
          o.delivery_method,
          o.payment_method,
          o.order_status,
          o.payment_status,
          o.notes,
          o.gateway_provider,
          o.gateway_session_id,
          o.gateway_payment_id,
          o.gateway_reference,
          o.age_confirmation_accepted,
          o.created_at,
          p.provider,
          p.provider_name,
          p.payment_reference,
          p.transaction_ref,
          p.payment_intent_id
        from public.orders o
        left join lateral (
          select provider, provider_name, payment_reference, transaction_ref, payment_intent_id
          from public.payments
          where order_id = o.id
          order by created_at desc
          limit 1
        ) p on true
        where o.order_number = $1
        limit 1
      `,
      [orderNumber]
    );

    if (!orderResult.rowCount) {
      return null;
    }

    const order = orderResult.rows[0];
    const orderId = String(order.id);

    const [itemsResult, shippingResult, billingResult] = await Promise.all([
      db.query(
        `
          select product_id, product_name, product_image, unit_price, quantity, subtotal
          from public.order_items
          where order_id = $1
          order by id asc
        `,
        [orderId]
      ),
      db.query(`select * from public.shipping_addresses where order_id = $1 limit 1`, [orderId]),
      db.query(`select * from public.billing_addresses where order_id = $1 limit 1`, [orderId])
    ]);

    const shipping = shippingResult.rows[0];
    const billing = billingResult.rows[0];

    return {
      id: orderId,
      userId: order.user_id ? String(order.user_id) : null,
      orderNumber: String(order.order_number),
      customerName: String(order.customer_name),
      customerEmail: String(order.customer_email),
      customerPhone: String(order.customer_phone),
      subtotal: toNumber(order.subtotal),
      shippingFee: toNumber(order.shipping_fee),
      discountAmount: toNumber(order.discount_amount),
      totalAmount: toNumber(order.total_amount),
      currency: String(order.currency ?? "THB"),
      deliveryMethod: String(order.delivery_method),
      paymentMethod: String(order.payment_method),
      orderStatus: String(order.order_status),
      paymentStatus: String(order.payment_status),
      notes: order.notes ? String(order.notes) : null,
      createdAt: String(order.created_at),
      gatewayProvider: order.gateway_provider ? String(order.gateway_provider) : null,
      gatewaySessionId: order.gateway_session_id ? String(order.gateway_session_id) : null,
      gatewayPaymentId: order.gateway_payment_id ? String(order.gateway_payment_id) : order.payment_intent_id ? String(order.payment_intent_id) : null,
      gatewayReference: order.gateway_reference ? String(order.gateway_reference) : order.transaction_ref ? String(order.transaction_ref) : null,
      ageConfirmationAccepted: Boolean(order.age_confirmation_accepted),
      paymentReference: order.payment_reference ? String(order.payment_reference) : null,
      providerName: order.provider ? String(order.provider) : order.provider_name ? String(order.provider_name) : null,
      shippingAddress: {
        fullName: String(shipping?.full_name ?? ""),
        phone: String(shipping?.phone ?? ""),
        email: String(shipping?.email ?? ""),
        addressLine1: String(shipping?.address_line_1 ?? ""),
        addressLine2: String(shipping?.address_line_2 ?? ""),
        subdistrict: String(shipping?.subdistrict ?? ""),
        district: String(shipping?.district ?? ""),
        province: String(shipping?.province ?? ""),
        postalCode: String(shipping?.postal_code ?? ""),
        googleMapsUrl: String(shipping?.google_maps_url ?? ""),
        latitude: shipping?.latitude != null ? String(shipping.latitude) : "",
        longitude: shipping?.longitude != null ? String(shipping.longitude) : "",
        deliveryNote: String(shipping?.delivery_note ?? "")
      },
      billingAddress: {
        useSameAsShipping: false,
        fullName: String(billing?.full_name ?? ""),
        addressLine1: String(billing?.address_line_1 ?? ""),
        addressLine2: String(billing?.address_line_2 ?? ""),
        subdistrict: String(billing?.subdistrict ?? ""),
        district: String(billing?.district ?? ""),
        province: String(billing?.province ?? ""),
        postalCode: String(billing?.postal_code ?? ""),
        phone: String(billing?.phone ?? ""),
        email: String(billing?.email ?? ""),
        companyName: String(billing?.company_name ?? ""),
        taxId: String(billing?.tax_id ?? ""),
        branchInfo: String(billing?.branch_info ?? ""),
        requiresTaxInvoice: Boolean(billing?.requires_tax_invoice)
      },
      items: itemsResult.rows.map((item) => ({
        productId: String(item.product_id),
        productName: String(item.product_name),
        productImage: item.product_image ? String(item.product_image) : null,
        currency: String(order.currency ?? "THB"),
        quantity: Number(item.quantity ?? 1),
        unitPrice: toNumber(item.unit_price),
        originalUnitPrice: toNumber(item.unit_price),
        subtotal: toNumber(item.subtotal),
        discountAmount: 0,
        estimatedWeightKg: 0
      }))
    };
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      throw new Error(getCheckoutSchemaMessage());
    }

    throw error;
  }
}

export async function getOrderByIdentifier(identifier: string): Promise<CheckoutOrder | null> {
  const normalizedIdentifier = sanitizeText(identifier);

  if (!normalizedIdentifier) {
    return null;
  }

  try {
    const result = await db.query(
      `
        select order_number
        from public.orders
        where order_number = $1
           or id::text = $1
        order by created_at desc
        limit 1
      `,
      [normalizedIdentifier]
    );

    if (!result.rowCount) {
      return null;
    }

    return getOrderByOrderNumber(String(result.rows[0].order_number));
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      throw new Error(getCheckoutSchemaMessage());
    }

    throw error;
  }
}

export async function getOrderByOrderNumberForUser(userId: string, orderNumber: string): Promise<CheckoutOrder | null> {
  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    return null;
  }

  return order.userId === userId ? order : null;
}

export async function getOrdersByUserId(userId: string, limit = 6): Promise<AccountOrderListItem[]> {
  try {
    const result = await db.query(
      `
        select
          id,
          order_number,
          total_amount,
          currency,
          payment_method,
          order_status,
          payment_status,
          created_at
        from public.orders
        where user_id = $1
        order by created_at desc
        limit $2
      `,
      [userId, limit]
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      orderNumber: String(row.order_number),
      totalAmount: toNumber(row.total_amount),
      currency: String(row.currency ?? "THB"),
      paymentMethod: String(row.payment_method ?? "promptpay"),
      orderStatus: String(row.order_status ?? "pending_payment"),
      paymentStatus: String(row.payment_status ?? "unpaid"),
      createdAt: String(row.created_at)
    }));
  } catch (error) {
    if (isMissingCheckoutSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function updateOrderPaymentState(args: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  gatewayProvider?: string | null;
  gatewaySessionId?: string | null;
  gatewayPaymentId?: string | null;
  gatewayReference?: string | null;
}) {
  await db.query(
    `
      update public.orders
      set
        order_status = $2,
        payment_status = $3,
        gateway_provider = coalesce($4, gateway_provider),
        gateway_session_id = coalesce($5, gateway_session_id),
        gateway_payment_id = coalesce($6, gateway_payment_id),
        gateway_reference = coalesce($7, gateway_reference),
        updated_at = now()
      where id = $1::uuid
    `,
    [
      args.orderId,
      args.orderStatus,
      args.paymentStatus,
      args.gatewayProvider ?? null,
      args.gatewaySessionId ?? null,
      args.gatewayPaymentId ?? null,
      args.gatewayReference ?? null
    ]
  );
}

export async function upsertPaymentRecord(args: {
  orderId: string;
  providerName: string;
  paymentMethodType?: string | null;
  paymentReference: string;
  transactionRef?: string | null;
  gatewaySessionId?: string | null;
  paymentIntentId?: string | null;
  amount: number;
  currency: string;
  paymentStatus: string;
  rawResponse?: unknown;
  rawWebhookJson?: unknown;
  paidAt?: string | null;
}) {
  const existing = await db.query(
    `
      select id
      from public.payments
      where order_id = $1::uuid
        and provider_name = $2
        and payment_reference = $3
      limit 1
    `,
    [args.orderId, args.providerName, args.paymentReference]
  );

  if (existing.rowCount) {
    await db.query(
      `
        update public.payments
        set
          provider = coalesce($2, provider),
          payment_method_type = coalesce($3, payment_method_type),
          transaction_ref = coalesce($4, transaction_ref),
          payment_reference = $5,
          payment_intent_id = coalesce($6, payment_intent_id),
          amount = $7,
          currency = $8,
          payment_status = $9,
          raw_response = $10::jsonb,
          raw_webhook_json = coalesce($11::jsonb, raw_webhook_json),
          paid_at = case when $12 is not null then $12::timestamptz else paid_at end,
          updated_at = now()
        where id = $1::uuid
      `,
      [
        String(existing.rows[0].id),
        args.providerName,
        args.paymentMethodType ?? null,
        args.transactionRef ?? args.gatewaySessionId ?? args.paymentReference,
        args.paymentReference,
        args.paymentIntentId ?? null,
        args.amount,
        args.currency,
        args.paymentStatus,
        JSON.stringify(args.rawResponse ?? {}),
        args.rawWebhookJson ? JSON.stringify(args.rawWebhookJson) : null,
        args.paidAt ?? null
      ]
    );

    return String(existing.rows[0].id);
  }

  const insertResult = await db.query(
    `
      insert into public.payments (
        order_id,
        provider,
        provider_name,
        payment_method_type,
        payment_reference,
        transaction_ref,
        payment_intent_id,
        amount,
        currency,
        payment_status,
        raw_response,
        raw_webhook_json,
        paid_at
      )
      values ($1::uuid, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::timestamptz)
      returning id
    `,
    [
      args.orderId,
      args.providerName,
      args.paymentMethodType ?? null,
      args.paymentReference,
      args.transactionRef ?? args.gatewaySessionId ?? args.paymentReference,
      args.paymentIntentId ?? null,
      args.amount,
      args.currency,
      args.paymentStatus,
      JSON.stringify(args.rawResponse ?? {}),
      args.rawWebhookJson ? JSON.stringify(args.rawWebhookJson) : JSON.stringify({}),
      args.paidAt ?? null
    ]
  );

  return String(insertResult.rows[0].id);
}
