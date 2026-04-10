import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { getLatestProducts, searchProductsByName } from "@/lib/products";

const productCategoryCards = [
  { name: "วิสกี้", href: "/whisky", image: "/images/categories/whisky.jpg" },
  { name: "ลิเคียวร์", href: "/liqueur", image: "/images/categories/liquor.png" },
  { name: "สินค้าอื่นๆ", href: "/other-products", image: "/images/categories/bev.webp" },
  { name: "สุราไทย", href: "/thai-spirits", image: "/images/categories/recommend.jpg" },
  { name: "อุปกรณ์บาร์", href: "/bar-tools", image: "/images/categories/cocktail-bar.jpg" }
] as const;

type ProductsPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const keyword = searchParams?.q?.trim() ?? "";
  const products = keyword ? await searchProductsByName(keyword, 24) : await getLatestProducts(12);

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / สินค้า
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] w-full sm:h-[360px]">
                <Image src="/images/hero/hero-main.jpg" alt="All products" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.06)_0%,rgba(23,18,18,0.22)_100%)]" />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Product Directory</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">รวมสินค้าทั้งหมด</h1>
              <p className="mt-6 text-[15px] leading-8 text-[#5f5852] sm:text-base">
                รวมหมวดสินค้าหลักของ PattayaBev ไว้ในหน้าเดียว พร้อมค้นหาสินค้าตามชื่อ และเลือกดูตามหมวดได้สะดวกยิ่งขึ้น
              </p>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[30px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">หมวดสินค้าหลัก</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#171212]">เลือกดูตามหมวดสินค้า</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {productCategoryCards.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-[#ece4d6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative h-[180px]">
                    <Image src={item.image} alt={item.name} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.08)_0%,rgba(23,18,18,0.5)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-base font-semibold text-white">{item.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-5 border-b border-[#ece7de] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">{keyword ? "Search Results" : "Latest Products"}</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">{keyword ? `ผลการค้นหา: ${keyword}` : "รายการที่เพิ่มล่าสุด"}</h2>
              <p className="mt-2 text-sm leading-7 text-[#5f5852]">{keyword ? `พบสินค้าทั้งหมด ${products.length} รายการ` : "ค้นหาสินค้าตามชื่อได้จากช่องด้านขวา"}</p>
            </div>

            <form action="/products" className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row">
              <input
                type="search"
                name="q"
                defaultValue={keyword}
                placeholder="ค้นหาตามชื่อสินค้า"
                className="h-12 w-full rounded-full border border-[#d9cfbf] bg-white px-5 text-sm text-[#171212] outline-none transition focus:border-[#d98a2c] focus:ring-2 focus:ring-[#f2dec0]"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#171212] px-5 text-sm font-bold text-white transition hover:bg-[#2b2424]"
                >
                  ค้นหา
                </button>
                {keyword ? (
                  <Link
                    href="/products"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#d9cfbf] bg-white px-5 text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
                  >
                    ล้าง
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} fallbackLabel="สินค้า" />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-[#d8cec0] bg-[#fffdf8] p-8 text-sm leading-7 text-[#5f5852]">
              ไม่พบสินค้าที่ตรงกับชื่อที่ค้นหา ลองพิมพ์ชื่อสินค้าใหม่อีกครั้ง
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
