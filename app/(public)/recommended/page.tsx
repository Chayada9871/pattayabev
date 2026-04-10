import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { getProductsByRecommendedCategory, recommendedCategoryPages } from "@/lib/products";

const recommendedImages: Record<string, string> = {
  "best-sellers": "/images/categories/recommend.jpg",
  "new-arrivals": "/images/hero/hero-main.jpg",
  "monthly-picks": "/images/categories/month.webp",
  "premium-selection": "/images/categories/premium-wine.jpg",
  "gift-selection": "/images/categories/gift.webp"
};

export default async function RecommendedPage() {
  const productGroups = await Promise.all(
    recommendedCategoryPages.map(async (category) => ({
      category,
      products: await getProductsByRecommendedCategory(category.slug, 4)
    }))
  );

  const featuredProducts = productGroups.flatMap((item) => item.products).slice(0, 8);

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / สินค้าแนะนำ
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] w-full sm:h-[360px]">
                <Image src="/images/categories/recommended.jpg" alt="สินค้าแนะนำ" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.06)_0%,rgba(23,18,18,0.22)_100%)]" />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">สินค้าแนะนำ</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">รวมสินค้าแนะนำ</h1>
              <p className="mt-6 text-[15px] leading-8 text-[#5f5852] sm:text-base">
                รวมกลุ่มสินค้าแนะนำของ PattayaBev ไว้ในหน้าเดียว ทั้งสินค้าขายดี สินค้าเข้าใหม่ คัดสรรประจำเดือน พรีเมียมคัดสรร และชุดของขวัญ
              </p>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[30px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">หมวดสินค้าแนะนำ</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#171212]">เลือกดูตามคอลเลกชัน</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendedCategoryPages.map((item) => (
                <Link
                  key={item.slug}
                  href={`/recommended/${item.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-[#ece4d6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative h-[190px]">
                    <Image src={recommendedImages[item.slug] ?? "/images/categories/recommend.jpg"} alt={item.title} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.1)_0%,rgba(23,18,18,0.58)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 px-4 py-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f0d8a8]">Recommended</p>
                      <h3 className="mt-2 text-xl font-extrabold text-white">{item.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece7de] pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">สินค้าเด่น</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">รายการแนะนำล่าสุด</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5852]">
              สินค้าที่ถูกจัดอยู่ในกลุ่มสินค้าแนะนำจะถูกรวมไว้ที่นี่ เพื่อช่วยให้ลูกค้าเลือกดูสินค้าเด่นได้ง่ายขึ้น
            </p>
          </div>

          {featuredProducts.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} fallbackLabel="สินค้าแนะนำ" />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-[#d8cec0] bg-[#fffdf8] p-8 text-sm leading-7 text-[#5f5852]">
              ยังไม่มีสินค้าในกลุ่มสินค้าแนะนำ กรุณากำหนด Recommended Category ให้สินค้าจากหน้าแอดมินก่อน
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
