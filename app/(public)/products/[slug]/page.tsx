import Image from "next/image";
import Link from "next/link";

import { ProductPurchaseControls } from "@/components/cart/product-purchase-controls";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { estimateProductWeightKg } from "@/lib/checkout-config";
import { formatPrice } from "@/lib/currency";
import { getRequiredProductBySlug } from "@/lib/products";

function buildCategoryHref(categoryName: string | null) {
  if (!categoryName) {
    return "/products";
  }

  const normalized = categoryName.trim().toLowerCase();

  if (normalized.includes("whisky") || normalized.includes("วิสกี้")) {
    return "/whisky";
  }
  if (normalized.includes("liqueur") || normalized.includes("ลิเคียวร์")) {
    return "/liqueur";
  }
  if (normalized.includes("สุราไทย") || normalized.includes("thai spirits")) {
    return "/thai-spirits";
  }
  if (normalized.includes("อุปกรณ์บาร์") || normalized.includes("bar tools")) {
    return "/bar-tools";
  }
  if (normalized.includes("สินค้าอื่น") || normalized.includes("other products")) {
    return "/other-products";
  }

  return "/products";
}

function renderMetaValue(value: string | null) {
  return value && value.trim() ? value : "-";
}

export default async function ProductDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const product = await getRequiredProductBySlug(params.slug);
  const mainImage = product.images[0]?.imageUrl ?? "/images/hero/hero-main.jpg";
  const categoryHref = buildCategoryHref(product.categoryName);
  const sellingPrice = product.discountedPrice ?? product.price;

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <div className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
          <Link href="/" className="hover:text-[#2437e8]">
            หน้าแรก
          </Link>{" "}
          /{" "}
          <Link href={categoryHref} className="hover:text-[#2437e8]">
            {product.categoryName ?? "สินค้า"}
          </Link>{" "}
          / {product.name}
        </div>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[30px] border border-[#ece4d6] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <div className="relative h-[420px] overflow-hidden rounded-[24px] bg-white sm:h-[540px]">
              <Image src={mainImage} alt={product.name} fill className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 48vw" />
            </div>

            {product.images.length > 1 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {product.images.slice(0, 4).map((image) => (
                  <div key={image.id} className="relative h-24 overflow-hidden rounded-2xl border border-[#ece4d6] bg-white">
                    <Image src={image.imageUrl} alt={image.altText ?? product.name} fill className="object-contain p-3" sizes="120px" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[30px] border border-[#ece4d6] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8b6a2b]">{product.brandName ?? "PATTAYABEV"}</p>
            <h1 className="mt-3 text-3xl font-extrabold text-[#171212] sm:text-4xl">{product.name}</h1>
            {product.subtitle ? <p className="mt-2 text-sm uppercase tracking-[0.14em] text-[#8a8278]">{product.subtitle}</p> : null}

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#ece4d6] pb-6">
              <div>
                <p className={`text-4xl font-extrabold ${product.discountedPrice != null ? "text-[#b3171f]" : "text-[#171212]"}`}>
                  {formatPrice(sellingPrice, product.currency)}
                </p>
                {product.discountedPrice != null ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-[#8a8278] line-through">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    {product.activeDiscountPercent != null ? (
                      <span className="rounded-full bg-[#fdeceb] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#b3171f]">
                        ส่วนลด {product.activeDiscountPercent}%
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <p className="mt-3 text-sm text-[#6f675f]">
                  {product.ratingAvg ? `${product.ratingAvg.toFixed(1)} / 5` : "ยังไม่มีคะแนน"} • {product.reviewCount} รีวิว
                </p>
              </div>
              <div
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  product.inStock ? "bg-[#edf7ef] text-[#207443]" : "bg-[#fbe9e9] text-[#a61b1f]"
                }`}
              >
                {product.inStock ? "พร้อมส่ง" : "สินค้าหมด"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#ece4d6] bg-[#faf7f1] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">ประเทศ</p>
                <p className="mt-2 text-base font-semibold text-[#171212]">{renderMetaValue(product.countryName)}</p>
              </div>
              <div className="rounded-2xl border border-[#ece4d6] bg-[#faf7f1] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">ขนาดบรรจุ</p>
                <p className="mt-2 text-base font-semibold text-[#171212]">{product.bottleSizeMl ? `${product.bottleSizeMl} ml` : "-"}</p>
              </div>
              <div className="rounded-2xl border border-[#ece4d6] bg-[#faf7f1] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">ประเภทสินค้า</p>
                <p className="mt-2 text-base font-semibold text-[#171212]">{renderMetaValue(product.productTypeName)}</p>
              </div>
              <div className="rounded-2xl border border-[#ece4d6] bg-[#faf7f1] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">แอลกอฮอล์</p>
                <p className="mt-2 text-base font-semibold text-[#171212]">{product.alcoholPercent ? `${product.alcoholPercent}%` : "-"}</p>
              </div>
            </div>

            {product.shortDescription ? <p className="mt-6 text-sm leading-7 text-[#5f5852]">{product.shortDescription}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <ProductPurchaseControls
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  imageUrl: mainImage,
                  price: sellingPrice,
                  currency: product.currency,
                  originalPrice: product.discountedPrice != null ? product.price : null,
                  estimatedWeightKg: estimateProductWeightKg(product.bottleSizeMl)
                }}
                disabled={!product.inStock}
              />
              <button className="rounded-full border border-[#d9cfbf] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#171212]">
                บันทึกไว้ภายหลัง
              </button>
            </div>

            {product.sku ? <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#8a8278]">SKU: {product.sku}</p> : null}
          </div>
        </section>

        {product.fullDescription ? (
          <section className="mt-12 rounded-[30px] border border-[#ece4d6] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <h2 className="text-2xl font-extrabold text-[#171212]">รายละเอียดสินค้า</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#5f5852]">{product.fullDescription}</p>
          </section>
        ) : null}

        {product.specs.length ? (
          <section className="mt-10 rounded-[30px] border border-[#ece4d6] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <h2 className="text-2xl font-extrabold text-[#171212]">ข้อมูลสินค้า</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {product.specs.map((spec) => (
                <div key={spec.id} className="rounded-2xl border border-[#ece4d6] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">{spec.label}</p>
                  <p className="mt-2 text-sm font-semibold text-[#171212]">{spec.value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {product.sections.length ? (
          <section className="mt-10 rounded-[30px] border border-[#ece4d6] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <h2 className="text-2xl font-extrabold text-[#171212]">เนื้อหาสินค้า</h2>
            <div className="mt-6 space-y-6">
              {product.sections.map((section) => (
                <article key={section.id}>
                  <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#171212]">{section.title}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[#5f5852]">{section.content}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {product.awards.length || product.recipes.length ? (
          <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[30px] border border-[#ece4d6] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#171212]">รางวัลและการยอมรับ</h2>
              {product.awards.length ? (
                <div className="mt-6 space-y-4">
                  {product.awards.map((award) => (
                    <div key={award.id} className="rounded-2xl border border-[#ece4d6] px-4 py-4">
                      <p className="text-sm font-semibold text-[#171212]">{award.title}</p>
                      <p className="mt-1 text-sm text-[#5f5852]">{[award.year, award.organization].filter(Boolean).join(" • ") || "รางวัลเด่น"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[#5f5852]">ยังไม่มีข้อมูลรางวัลสำหรับสินค้านี้</p>
              )}
            </div>

            <div className="rounded-[30px] border border-[#ece4d6] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#171212]">สูตรแนะนำ</h2>
              {product.recipes.length ? (
                <div className="mt-6 space-y-6">
                  {product.recipes.map((recipe) => (
                    <article key={recipe.id} className="grid gap-5 md:grid-cols-[220px_1fr]">
                      <div className="relative h-48 overflow-hidden rounded-[24px] bg-[#faf7f1]">
                        {recipe.imageUrl ? (
                          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" sizes="220px" />
                        ) : (
                          <div className="grid h-full place-items-center text-sm text-[#8a8278]">ยังไม่มีรูปสูตร</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#171212]">{recipe.title}</h3>
                        {recipe.items.length ? (
                          <ul className="mt-4 space-y-2 text-sm leading-7 text-[#5f5852]">
                            {recipe.items.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        ) : null}
                        {recipe.instructions ? <p className="mt-4 text-sm leading-7 text-[#5f5852]">{recipe.instructions}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[#5f5852]">ยังไม่มีสูตรแนะนำสำหรับสินค้านี้</p>
              )}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
