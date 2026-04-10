import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { getProductsByCategory } from "@/lib/products";

const liqueurCategoryCards = [
  { name: "จิน", href: "/liqueur/type/gin", image: "/images/categories/gin.jpg" },
  { name: "รัม", href: "/liqueur/type/rum", image: "/images/categories/rum.jpg" },
  { name: "วอดก้า", href: "/liqueur/type/vodka", image: "/images/categories/vodka.jpg" },
  { name: "เตกีล่า", href: "/liqueur/type/tequila", image: "/images/categories/tequila.jpg" },
  { name: "สาเก / โซจู", href: "/liqueur/type/sake-shochu", image: "/images/categories/sake.jpg" },
  { name: "เหล้าบ๊วย / ยูซุ", href: "/liqueur/type/plum-yuzu", image: "/images/categories/ume.webp" },
  { name: "แบรนดี้", href: "/liqueur/type/brandy", image: "/images/categories/brandy.jpg" },
  { name: "แกรปป้า", href: "/liqueur/type/grappa", image: "/images/categories/grappa.jpg" },
  { name: "อควาวิท", href: "/liqueur/type/aquavit", image: "/images/categories/aquavit.jpg" },
  { name: "คาชาซ่า", href: "/liqueur/type/cachaca", image: "/images/categories/cachaca.jpg" },
  { name: "แอ๊บซินท์", href: "/liqueur/type/absinthe", image: "/images/categories/absinthe.webp" },
  { name: "ค็อกเทลพร้อมดื่ม", href: "/liqueur/type/cocktail-ready-to-drink", image: "/images/categories/cocktail.webp" }
] as const;

const blankProducts = Array.from({ length: 8 }, (_, index) => index + 1);

export default async function LiqueurPage() {
  const products = await getProductsByCategory(["ลิเคียวร์", "liqueur"], ["liqueur"], 24);

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / ลิเคียวร์
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] w-full sm:h-[360px]">
                <Image src="/images/categories/liquor.png" alt="Liqueur" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.06)_0%,rgba(23,18,18,0.22)_100%)]" />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Liqueur Selection</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">ลิเคียวร์ (Liqueur)</h1>
              <p className="mt-6 text-[15px] leading-8 text-[#5f5852] sm:text-base">
                รวมหมวดลิเคียวร์และเครื่องดื่มในกลุ่มใกล้เคียงสำหรับการขายออนไลน์ การจัดเมนูบาร์ และการค้นหาสินค้าตามประเภทได้สะดวกขึ้น
                โดยแต่ละหมวดย่อยสามารถกดเข้าไปดูสินค้าเฉพาะกลุ่มได้ทันที
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-[#f5efe5] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b6a2b]">Premium Assortment</div>
                <div className="rounded-full bg-[#f3f6ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2437e8]">Browse by Type</div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[30px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">หมวดหมู่ยอดนิยม</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#171212]">เลือกตามประเภทลิเคียวร์</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5852]">
              เลือกดูตามประเภทเครื่องดื่มยอดนิยม เช่น จิน รัม วอดก้า เตกีล่า และหมวดย่อยอื่นๆ เพื่อให้ค้นหาสินค้าในระบบได้ง่ายขึ้น
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {liqueurCategoryCards.map((item) => (
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
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">สินค้าในหมวดลิเคียวร์</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5852]">
              สินค้าที่ถูกเพิ่มและจัดอยู่ในหมวดลิเคียวร์จะขึ้นแสดงที่หน้านี้อัตโนมัติ พร้อมลิงก์เข้าสู่รายละเอียดสินค้า
            </p>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} fallbackLabel="Liqueur" />
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
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">Liqueur Item {item}</p>
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
