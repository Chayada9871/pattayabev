"use client";

import Image from "next/image";
import Link from "next/link";

import { OrderSummaryCard } from "@/components/cart/order-summary-card";
import { ResponsiblePurchaseBanner } from "@/components/cart/responsible-purchase-banner";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/currency";

export function CartPageClient() {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    totalPrice,
    isReady,
    increaseQuantity,
    decreaseQuantity,
    removeItem
  } = useCart();

  if (!isReady) {
    return <div className="rounded-[30px] border border-[#ece4d6] bg-white p-8 text-sm text-[#6d655d]">กำลังโหลดตะกร้าสินค้า...</div>;
  }

  if (!items.length) {
    return (
      <section className="rounded-[30px] border border-[#ece4d6] bg-white p-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-12">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Cart</p>
        <h1 className="mt-3 text-3xl font-extrabold text-[#171212] sm:text-4xl">ยังไม่มีสินค้าในตะกร้า</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5f5852]">
          เลือกสินค้าที่ต้องการจากหน้ารวมสินค้า หรือหน้าหมวดต่าง ๆ แล้วกดใส่ตะกร้าเพื่อเริ่มคำสั่งซื้อ
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
          >
            กลับไปเลือกสินค้า
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <ResponsiblePurchaseBanner />

        <div className="rounded-[30px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#ece4d6] pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Cart</p>
              <h1 className="mt-2 text-3xl font-extrabold text-[#171212]">ตะกร้าสินค้า</h1>
            </div>
            <p className="text-sm font-semibold text-[#5f5852]">{itemCount} ชิ้นในตะกร้า</p>
          </div>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-[24px] border border-[#ece4d6] bg-[#fffdf9] p-4 sm:grid-cols-[140px_1fr]"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative block h-[140px] overflow-hidden rounded-[20px] border border-[#ece4d6] bg-white"
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-4" sizes="140px" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9187]">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-col justify-between gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/products/${item.slug}`} className="line-clamp-2 text-lg font-extrabold text-[#171212] hover:text-[#2437e8]">
                        {item.name}
                      </Link>
                      <p className="mt-2 text-sm text-[#5f5852]">ราคาต่อชิ้น {formatPrice(item.price, item.currency)}</p>
                      {item.discountAmount > 0 ? (
                        <p className="mt-1 text-xs font-semibold text-[#d02022]">
                          ประหยัด {formatPrice(item.discountAmount / item.quantity, item.currency)} ต่อชิ้น
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-[#ddc9bb] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#7a3a2e] transition hover:bg-[#fff2ee]"
                    >
                      ลบ
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-full border border-[#dfd4c6] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        className="inline-grid h-10 w-10 place-items-center rounded-full text-lg font-bold text-[#171212] transition hover:bg-[#f5efe5]"
                      >
                        -
                      </button>
                      <span className="min-w-[56px] text-center text-base font-bold text-[#171212]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        className="inline-grid h-10 w-10 place-items-center rounded-full text-lg font-bold text-[#171212] transition hover:bg-[#f5efe5]"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">Subtotal</p>
                      <p className="mt-1 text-xl font-extrabold text-[#171212]">{formatPrice(item.subtotal, item.currency)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:h-fit">
        <OrderSummaryCard
          items={items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))}
          currency={items[0]?.currency ?? "THB"}
          subtotal={subtotal}
          shippingFee={0}
          discountAmount={discountAmount}
          totalAmount={totalPrice}
          footer={
            <>
              <p className="rounded-[20px] border border-[#ece4d6] bg-[#fffdf9] px-4 py-3 text-sm leading-6 text-[#5f5852]">
                ค่าจัดส่งจริงจะคำนวณอีกครั้งในขั้นตอน Checkout ตามวิธีจัดส่งที่เลือก
              </p>
              <Link
                href="/checkout"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#171212] px-6 text-sm font-bold text-white transition hover:bg-[#2b2424]"
              >
                ดำเนินการชำระเงิน
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#d9cfbf] bg-white px-6 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
              >
                เลือกซื้อสินค้าต่อ
              </Link>
            </>
          }
        />
      </div>
    </section>
  );
}
