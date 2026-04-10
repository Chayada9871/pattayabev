import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintInvoiceButton } from "@/components/cart/print-invoice-button";
import { formatPrice } from "@/lib/currency";
import { getCheckoutSchemaMessage, getOrderByOrderNumber } from "@/lib/orders";

function formatAddress(parts: Array<string | undefined>) {
  return parts
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

function formatDocumentDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function getPaymentMethodText(method: string) {
  switch (method) {
    case "promptpay":
      return "พร้อมเพย์ QR";
    case "card":
      return "บัตรเครดิต / เดบิต";
    case "cod":
      return "เก็บเงินปลายทาง";
    default:
      return method || "-";
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case "paid":
      return "ชำระเงินสำเร็จ";
    case "pending":
      return "รอตรวจสอบ";
    case "unpaid":
      return "รอชำระเงิน";
    case "failed":
      return "ชำระเงินไม่สำเร็จ";
    case "refunded":
      return "คืนเงินแล้ว";
    case "expired":
      return "หมดอายุการชำระเงิน";
    default:
      return status || "-";
  }
}

function getDeliveryMethodText(method: string) {
  switch (method) {
    case "standard":
      return "จัดส่งมาตรฐาน";
    case "express":
      return "จัดส่งด่วน";
    default:
      return method || "-";
  }
}

function getItemCode(productId: string, index: number) {
  const compact = productId.replace(/-/g, "").toUpperCase();
  return compact ? compact.slice(0, 8) : String(index + 1).padStart(3, "0");
}

function convertIntegerToThaiText(value: number) {
  const digitText = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positionText = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  if (value === 0) {
    return "";
  }

  let result = "";
  const digits = String(value).split("").map(Number);
  const totalDigits = digits.length;

  for (let index = 0; index < totalDigits; index += 1) {
    const digit = digits[index];
    const position = totalDigits - index - 1;

    if (digit === 0) {
      continue;
    }

    if (position === 0 && digit === 1 && totalDigits > 1) {
      result += "เอ็ด";
      continue;
    }

    if (position === 1) {
      if (digit === 1) {
        result += "สิบ";
        continue;
      }

      if (digit === 2) {
        result += "ยี่สิบ";
        continue;
      }
    }

    result += `${digitText[digit]}${positionText[position]}`;
  }

  return result;
}

function numberToThaiBahtText(amount: number) {
  const normalized = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const fixedAmount = normalized.toFixed(2);
  const [integerPart, decimalPart] = fixedAmount.split(".");
  const integerValue = Number(integerPart);
  const satangValue = Number(decimalPart);

  let bahtText = convertIntegerToThaiText(integerValue);
  if (!bahtText) {
    bahtText = "ศูนย์";
  }

  if (satangValue === 0) {
    return `${bahtText}บาทถ้วน`;
  }

  return `${bahtText}บาท${convertIntegerToThaiText(satangValue)}สตางค์`;
}

export default async function OrderInvoicePage({
  params
}: {
  params: { orderNumber: string };
}) {
  let order = null;
  let schemaMessage = "";

  try {
    order = await getOrderByOrderNumber(params.orderNumber);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === getCheckoutSchemaMessage()) {
      schemaMessage = message;
    } else {
      throw error;
    }
  }

  if (!order && !schemaMessage) {
    notFound();
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] text-[#171212]">
        <main className="mx-auto max-w-[1080px] px-4 py-8">
          <div className="border border-[#f2d1b0] bg-[#fff6ec] px-5 py-4 text-sm text-[#7a5c2d]">{schemaMessage}</div>
        </main>
      </div>
    );
  }

  const customerName = order.billingAddress.companyName || order.billingAddress.fullName || order.shippingAddress.fullName;
  const customerAddress = formatAddress([
    order.billingAddress.addressLine1 || order.shippingAddress.addressLine1,
    order.billingAddress.addressLine2 || order.shippingAddress.addressLine2,
    order.billingAddress.subdistrict || order.shippingAddress.subdistrict,
    order.billingAddress.district || order.shippingAddress.district,
    order.billingAddress.province || order.shippingAddress.province,
    order.billingAddress.postalCode || order.shippingAddress.postalCode
  ]);
  const taxId = order.billingAddress.taxId || "-";
  const vatAmount = Number(((order.totalAmount * 7) / 107).toFixed(2));
  const beforeVatAmount = Math.max(0, Number((order.totalAmount - vatAmount).toFixed(2)));
  const paymentReference = order.paymentReference || order.gatewayReference || order.gatewayPaymentId || "-";
  const companyAddress = "พัทยา จังหวัดชลบุรี";
  const companyPhone = "-";
  const companyFax = "-";
  const companyTaxId = "-";

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#171212]">
      <main className="mx-auto max-w-[1080px] px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Receipt Layout</p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#171212]">ใบเสร็จรับเงิน</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/order-confirmation/${order.orderNumber}`}
              className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-5 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
            >
              กลับไปหน้าคำสั่งซื้อ
            </Link>
            {order.paymentStatus === "paid" ? <PrintInvoiceButton /> : null}
          </div>
        </div>

        {order.paymentStatus !== "paid" ? (
          <section className="border border-[#dcd6cb] bg-white px-6 py-8 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Invoice Status</p>
            <h2 className="mt-3 text-[30px] font-extrabold text-[#171212]">ยังไม่สามารถออกใบเสร็จได้</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5852]">
              ใบเสร็จจะพร้อมใช้งานหลังจากระบบยืนยันว่าคำสั่งซื้อนี้ชำระเงินสำเร็จแล้วเท่านั้น
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/order-confirmation/${order.orderNumber}`}
                className="inline-flex h-11 items-center justify-center bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424]"
              >
                กลับไปติดตามคำสั่งซื้อ
              </Link>
              <Link
                href={`/payment/process?order=${order.orderNumber}`}
                className="inline-flex h-11 items-center justify-center border border-[#d7d1c7] bg-white px-5 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
              >
                ไปชำระเงิน
              </Link>
            </div>
          </section>
        ) : (
          <section className="border border-[#171212] bg-white px-8 py-8 shadow-[0_10px_24px_rgba(0,0,0,0.04)] print:border print:px-6 print:py-6 print:shadow-none">
            <header className="border-b-2 border-[#171212] pb-5">
              <div className="grid gap-6 md:grid-cols-[1.45fr_0.95fr]">
                <div className="space-y-2 text-sm leading-6">
                  <p className="text-xl font-bold text-[#171212]">บริษัท พัทยาเบฟ จำกัด</p>
                  <p className="font-semibold text-[#171212]">PATTAYABEV CO., LTD.</p>
                  <div className="space-y-1 text-[#4d4640]">
                    <p>ที่อยู่: {companyAddress}</p>
                    <p>โทร: {companyPhone}</p>
                    <p>แฟกซ์: {companyFax}</p>
                    <p>เลขประจำตัวผู้เสียภาษี: {companyTaxId}</p>
                  </div>
                </div>

                <div className="border border-[#171212] px-5 py-4">
                  <p className="text-center text-[26px] font-extrabold leading-tight text-[#171212]">
                    ใบเสร็จรับเงิน / ใบกำกับภาษี
                  </p>
                  <p className="mt-1 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#5f5852]">
                    RECEIPT / TAX INVOICE (ORIGINAL)
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-[#171212]">
                    <div className="flex items-center justify-between gap-4 border-t border-[#d8d1c5] pt-2">
                      <span className="font-semibold">เลขที่ / No.</span>
                      <span className="font-bold">{order.orderNumber}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold">วันที่ / Date</span>
                      <span className="font-bold">{formatDocumentDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <section className="grid gap-4 border-b border-[#171212] py-5 md:grid-cols-[1.35fr_0.65fr]">
              <div className="border border-[#171212] px-5 py-4">
                <p className="text-sm font-bold text-[#171212]">ชื่อ, ที่อยู่ (ลูกค้า)</p>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5f5852]">NAME, ADDRESS</p>
                <div className="mt-4 space-y-2 text-sm leading-6 text-[#171212]">
                  <p className="font-bold">{customerName}</p>
                  <p>{customerAddress || "-"}</p>
                  {order.billingAddress.companyName ? <p>ชื่อบริษัท: {order.billingAddress.companyName}</p> : null}
                  {taxId !== "-" ? <p>เลขประจำตัวผู้เสียภาษี: {taxId}</p> : null}
                  {order.billingAddress.branchInfo ? <p>สาขา: {order.billingAddress.branchInfo}</p> : null}
                  <p>โทร: {order.billingAddress.phone || order.shippingAddress.phone || "-"}</p>
                  <p>อีเมล: {order.billingAddress.email || order.shippingAddress.email || "-"}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="border border-[#171212] px-4 py-3 text-sm">
                  <p className="font-bold">ใบสั่งซื้อเลขที่</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">PURCHASE ORDER NO.</p>
                  <p className="mt-2 font-semibold text-[#171212]">{order.orderNumber}</p>
                </div>
                <div className="border border-[#171212] px-4 py-3 text-sm">
                  <p className="font-bold">ใบส่งของ / อ้างอิงธุรกรรม</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">DELIVERY ORDER NO.</p>
                  <p className="mt-2 break-all font-semibold text-[#171212]">{paymentReference}</p>
                </div>
                <div className="border border-[#171212] px-4 py-3 text-sm">
                  <p className="font-bold">วิธีชำระเงิน</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">PAYMENT METHOD</p>
                  <p className="mt-2 font-semibold text-[#171212]">{getPaymentMethodText(order.paymentMethod)}</p>
                </div>
              </div>
            </section>

            <section className="py-5">
              <div className="overflow-hidden border border-[#171212]">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-[#faf8f4] text-[#171212]">
                    <tr>
                      <th className="border-b border-r border-[#171212] px-3 py-3 text-center font-bold">
                        รหัสสินค้า
                        <div className="text-[10px] uppercase tracking-[0.08em] text-[#5f5852]">ITEM CODE</div>
                      </th>
                      <th className="border-b border-r border-[#171212] px-3 py-3 text-left font-bold">
                        รายการ
                        <div className="text-[10px] uppercase tracking-[0.08em] text-[#5f5852]">DESCRIPTION</div>
                      </th>
                      <th className="border-b border-r border-[#171212] px-3 py-3 text-center font-bold">
                        จำนวน
                        <div className="text-[10px] uppercase tracking-[0.08em] text-[#5f5852]">QTY</div>
                      </th>
                      <th className="border-b border-r border-[#171212] px-3 py-3 text-right font-bold">
                        ราคาต่อหน่วย
                        <div className="text-[10px] uppercase tracking-[0.08em] text-[#5f5852]">UNIT PRICE</div>
                      </th>
                      <th className="border-b px-3 py-3 text-right font-bold">
                        จำนวนเงิน
                        <div className="text-[10px] uppercase tracking-[0.08em] text-[#5f5852]">AMOUNT</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={`${item.productId}-${index}`} className="align-top">
                        <td className="border-r border-t border-[#171212] px-3 py-3 text-center text-[#171212]">
                          {getItemCode(item.productId, index)}
                        </td>
                        <td className="border-r border-t border-[#171212] px-3 py-3 text-[#171212]">{item.productName}</td>
                        <td className="border-r border-t border-[#171212] px-3 py-3 text-center text-[#171212]">{item.quantity}</td>
                        <td className="border-r border-t border-[#171212] px-3 py-3 text-right text-[#171212]">
                          {formatPrice(item.unitPrice, order.currency)}
                        </td>
                        <td className="border-t border-[#171212] px-3 py-3 text-right font-semibold text-[#171212]">
                          {formatPrice(item.subtotal, order.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-5 border-t border-[#171212] pt-5 md:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="border border-[#171212] px-5 py-4">
                  <p className="text-sm font-bold text-[#171212]">จำนวนเงินทั้งสิ้น (ตัวอักษร)</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">BAHT</p>
                  <p className="mt-3 text-base font-bold text-[#171212]">{numberToThaiBahtText(order.totalAmount)}</p>
                </div>

                <div className="border border-[#171212] px-5 py-4">
                  <p className="text-sm font-bold text-[#171212]">รายละเอียดการรับชำระ</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">PAYMENT DETAILS</p>
                  <div className="mt-3 space-y-1 text-sm leading-6 text-[#171212]">
                    <p>สถานะการชำระเงิน: {getPaymentStatusText(order.paymentStatus)}</p>
                    <p>วิธีชำระเงิน: {getPaymentMethodText(order.paymentMethod)}</p>
                    <p>การจัดส่ง: {getDeliveryMethodText(order.deliveryMethod)}</p>
                    <p className="break-all">เลขอ้างอิงธุรกรรม: {paymentReference}</p>
                    {order.notes ? <p>หมายเหตุคำสั่งซื้อ: {order.notes}</p> : null}
                    {order.shippingAddress.deliveryNote ? <p>หมายเหตุจัดส่ง: {order.shippingAddress.deliveryNote}</p> : null}
                  </div>
                </div>
              </div>

              <div className="border border-[#171212]">
                <div className="space-y-0 text-sm">
                  <div className="flex items-center justify-between border-b border-[#171212] px-4 py-3">
                    <span className="font-medium text-[#171212]">ยอดก่อนภาษี</span>
                    <span className="font-semibold text-[#171212]">{formatPrice(beforeVatAmount, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#171212] px-4 py-3">
                    <span className="font-medium text-[#171212]">ภาษีมูลค่าเพิ่ม 7%</span>
                    <span className="font-semibold text-[#171212]">{formatPrice(vatAmount, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#171212] px-4 py-3">
                    <span className="font-medium text-[#171212]">ค่าสินค้า</span>
                    <span className="font-semibold text-[#171212]">{formatPrice(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#171212] px-4 py-3">
                    <span className="font-medium text-[#171212]">ค่าจัดส่ง</span>
                    <span className="font-semibold text-[#171212]">{formatPrice(order.shippingFee, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#171212] px-4 py-3">
                    <span className="font-medium text-[#171212]">ส่วนลด</span>
                    <span className="font-semibold text-[#d02022]">
                      {order.discountAmount > 0 ? `- ${formatPrice(order.discountAmount, order.currency)}` : formatPrice(0, order.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-base font-extrabold text-[#171212]">รวมเงินทั้งสิ้น</span>
                    <span className="text-[28px] font-extrabold text-[#171212]">{formatPrice(order.totalAmount, order.currency)}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="border border-[#171212] px-5 py-6 text-center">
                <p className="text-sm font-bold text-[#171212]">ผู้รับเงิน</p>
                <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">COLLECTOR</p>
                <div className="mt-12 border-t border-dashed border-[#171212] pt-3 text-sm text-[#5f5852]">
                  วันที่ {formatDocumentDate(order.createdAt)}
                </div>
              </div>

              <div className="border border-[#171212] px-5 py-6 text-center">
                <p className="text-sm font-bold text-[#171212]">ผู้รับมอบอำนาจ</p>
                <p className="text-xs uppercase tracking-[0.08em] text-[#5f5852]">AUTHORIZED SIGNATURE</p>
                <div className="mt-12 border-t border-dashed border-[#171212] pt-3 text-sm text-[#5f5852]">
                  บริษัท พัทยาเบฟ จำกัด
                </div>
              </div>
            </section>

            <div className="mt-4 text-right text-xs font-semibold text-[#5f5852]">สำหรับลูกค้า (FOR CUSTOMER)</div>
          </section>
        )}
      </main>
    </div>
  );
}
