import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { formatPromotionBenefit, getActivePromotions, getDiscountedPrice } from "@/lib/promotions";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(price);
}

export default async function PromotionsPage() {
  const promotions = await getActivePromotions();
  const productPromotions = promotions.filter(
    (promotion) => promotion.linkedProductId && promotion.linkedProductSlug && promotion.linkedProductPrice != null
  );

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / โปรโมชั่น
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
            <div className="overflow-hidden rounded-[34px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[300px] w-full sm:h-[380px]">
                <Image src="/images/categories/discount.jpg" alt="Promotions" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(64,48,189,0.28)_0%,rgba(23,18,18,0.08)_45%,rgba(23,18,18,0.2)_100%)]" />
                <div className="absolute left-6 top-6 rounded-full bg-white/92 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b] shadow-sm">
                  Discount
                </div>
              </div>
            </div>

            <div className="flex min-h-[300px] items-center rounded-[34px] border border-[#e9dfd1] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] p-8 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:min-h-[380px] sm:p-10">
              <div className="max-w-[420px]">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#8b6a2b]">Promotion Center</p>
                <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] tracking-tight text-[#171212] sm:text-6xl">
                  โปรโมชั่น
                  <br />
                  ส่วนลด
                </h1>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece7de] pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Discount Products</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">สินค้าที่กำลังลดราคา</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#2437e8]">
              ดูสินค้าทั้งหมด
            </Link>
          </div>

          {productPromotions.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productPromotions.map((promotion) => {
                const discountedPrice = getDiscountedPrice(promotion.linkedProductPrice, promotion.discountPercent);

                return (
                  <Link
                    key={promotion.id}
                    href={`/products/${promotion.linkedProductSlug}`}
                    className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative grid h-[240px] place-items-center bg-white">
                      {promotion.imageUrl ? (
                        <Image
                          src={promotion.imageUrl}
                          alt={promotion.linkedProductName ?? promotion.title}
                          fill
                          className="object-contain p-5"
                          sizes="(max-width: 1280px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="grid h-[150px] w-[130px] place-items-center rounded-[28px] border-2 border-dashed border-[#d8cec0] px-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9187]">
                          เพิ่มรูปสินค้า
                        </div>
                      )}
                    </div>

                    <div className="px-2 pb-2">
                      <div className="flex items-end gap-2">
                        <p className="text-xl font-extrabold text-[#d02022]">
                          {discountedPrice != null ? formatPrice(discountedPrice, promotion.linkedProductCurrency) : "-"}
                        </p>
                        {promotion.linkedProductPrice != null ? (
                          <p className="text-sm font-semibold text-[#9b9187] line-through">
                            {formatPrice(promotion.linkedProductPrice, promotion.linkedProductCurrency)}
                          </p>
                        ) : null}
                      </div>

                      {promotion.discountPercent != null ? (
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#d02022]">-{promotion.discountPercent}%</p>
                      ) : null}

                      <h3 className="mt-3 text-sm font-extrabold uppercase leading-6 text-[#171212]">
                        {promotion.linkedProductName}
                        {promotion.linkedProductBottleSizeMl ? ` (${promotion.linkedProductBottleSizeMl} ML)` : ""}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#5f5852]">
                        {promotion.linkedProductBrandName ?? "PROMOTION PRODUCT"}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b6a2b]">
                        {formatPromotionBenefit(promotion)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[30px] border border-dashed border-[#d8cec0] bg-[#fffdf8] p-8 text-sm leading-7 text-[#5f5852]">
              ยังไม่มีสินค้าที่กำลังลดราคาในขณะนี้
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
