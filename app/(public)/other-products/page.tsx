import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { getProductsByCategory } from "@/lib/products";

const otherProductCards = [
  { name: "น้ำแร่", href: "/other-products/mineral-water", image: "/images/categories/mineral.jpg" },
  { name: "ไซรัป (น้ำเชื่อม)", href: "/other-products/syrup", image: "/images/categories/syrup.webp" },
  { name: "บิทเทอร์", href: "/other-products/bitters", image: "/images/categories/bitters.jpg" },
  { name: "ซิการ์", href: "/other-products/cigar", image: "/images/categories/cigar.webp" }
] as const;

const blankProducts = Array.from({ length: 8 }, (_, index) => index + 1);

export default async function OtherProductsPage() {
  const products = await getProductsByCategory(["สินค้าอื่นๆ", "other products"], ["other-products"], 24);

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / สินค้าอื่นๆ
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] w-full sm:h-[360px]">
                <Image src="/images/categories/bev.webp" alt="Other products" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.06)_0%,rgba(23,18,18,0.22)_100%)]" />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Other Product Selection</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">สินค้าอื่นๆ (Other Products)</h1>
              <p className="mt-6 text-[15px] leading-8 text-[#5f5852] sm:text-base">
                รวมสินค้าที่เกี่ยวข้องกับการเสิร์ฟ การผสมเครื่องดื่ม และไลฟ์สไตล์ เช่น น้ำแร่ ไซรัป บิทเทอร์ และซิการ์
                เพื่อให้สามารถจัดแสดงและค้นหาสินค้าแต่ละกลุ่มได้สะดวกขึ้น
              </p>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[30px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">หมวดย่อยแนะนำ</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#171212]">เลือกตามประเภทสินค้า</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5852]">กดเข้าสู่หน้าหมวดย่อยเพื่อดูสินค้าจริงของแต่ละกลุ่มได้ทันที</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {otherProductCards.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-[#ece4d6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative h-[165px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.08)_0%,rgba(23,18,18,0.5)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-sm font-semibold text-white">{item.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece7de] pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">รายการสินค้า</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">สินค้าในหมวดสินค้าอื่นๆ</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5852]">สินค้าที่อยู่ในหมวดนี้จะถูกแสดงที่หน้านี้อัตโนมัติ พร้อมลิงก์เข้าสู่หน้ารายละเอียดสินค้า</p>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} fallbackLabel="Other Products" />
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
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">Other Item {item}</p>
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
