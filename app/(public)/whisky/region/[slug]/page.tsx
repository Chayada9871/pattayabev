import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { getWhiskyProductsByRegion, whiskyRegionPages } from "@/lib/products";

const blankProducts = Array.from({ length: 8 }, (_, index) => index + 1);
const whiskyRegionImages: Record<string, string> = {
  speyside: "/images/categories/speyside.jpg",
  highland: "/images/categories/highland.jpg",
  lowland: "/images/categories/lowland.jpg",
  islay: "/images/categories/islay.webp"
};

export default async function WhiskyRegionPage({
  params
}: {
  params: { slug: string };
}) {
  const currentPage = whiskyRegionPages.find((item) => item.slug === params.slug);

  if (!currentPage) {
    notFound();
  }

  const products = await getWhiskyProductsByRegion(currentPage.name.replace("เขต ", ""), 24);
  const heroImage = whiskyRegionImages[currentPage.slug] ?? "/images/categories/whisky.jpg";

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="rounded-[32px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_18px_34px_rgba(0,0,0,0.06)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">หน้าแรก</Link> / <Link href="/whisky" className="hover:text-[#2437e8]">วิสกี้</Link> / {currentPage.name}
          </p>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative h-[260px] overflow-hidden rounded-[28px] bg-[#f8f5ef] sm:h-[340px]">
              <Image src={heroImage} alt={currentPage.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.12)_0%,rgba(23,18,18,0.42)_100%)]" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Whisky Region</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">{currentPage.name}</h1>
              <p className="mt-5 text-sm leading-8 text-[#5f5852] sm:text-base">{currentPage.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/whisky" className="rounded-full border border-[#d8cec0] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#171212]">
                  กลับไปหน้าวิสกี้
                </Link>
                <Link href="/catalog" className="rounded-full bg-[#171212] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white">
                  ดูสินค้าทั้งหมด
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece7de] pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Regional selection</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">สินค้าใน {currentPage.name}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5852]">
              หน้านี้จะแสดงสินค้าวิสกี้ที่ถูกผูกภูมิภาคไว้ตรงกับ {currentPage.name}
            </p>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} fallbackLabel={currentPage.name} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {blankProducts.map((item) => (
                <article key={item} className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <div className="grid h-[240px] place-items-center bg-[linear-gradient(135deg,#faf7f1_0%,#f2f5fb_100%)]">
                    <div className="grid h-[150px] w-[130px] place-items-center rounded-[28px] border-2 border-dashed border-[#d8cec0] px-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9187]">
                      เพิ่มรูปสินค้า
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">{currentPage.name}</p>
                    <div className="mt-3 h-4 w-3/4 rounded-full bg-[#f0ebe2]" />
                    <div className="mt-2 h-4 w-1/2 rounded-full bg-[#f0ebe2]" />
                    <div className="mt-5 h-10 rounded-full border border-[#ddd3c5]" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
