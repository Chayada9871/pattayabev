import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { getWhiskyProducts } from "@/lib/products";

const whiskyStyleCards = [
  {
    name: "ซิงเกิลมอลต์ วิสกี้",
    href: "/whisky/type/single-malt-whisky",
    image: "/images/categories/single-malt-whisky.png"
  },
  {
    name: "สกอตช์ วิสกี้",
    href: "/whisky/type/scotch-whisky",
    image: "/images/categories/scotch-whisky.png"
  },
  {
    name: "อเมริกัน วิสกี้",
    href: "/whisky/type/american-whisky",
    image: "/images/categories/american-whisky.jpg"
  },
  {
    name: "ไอริช วิสกี้",
    href: "/whisky/type/irish-whisky",
    image: "/images/categories/irish-whisky.jpg"
  },
  {
    name: "เจแปนนีส วิสกี้",
    href: "/whisky/type/japanese-whisky",
    image: "/images/categories/japanese-whisky.jpg"
  }
] as const;

const whiskyRegionCards = [
  {
    name: "เขต Speyside",
    href: "/whisky/region/speyside",
    image: "/images/categories/speyside.jpg"
  },
  {
    name: "เขต Highland",
    href: "/whisky/region/highland",
    image: "/images/categories/highland.jpg"
  },
  {
    name: "เขต Lowland",
    href: "/whisky/region/lowland",
    image: "/images/categories/lowland.jpg"
  },
  {
    name: "เขต Islay",
    href: "/whisky/region/islay",
    image: "/images/categories/islay.webp"
  },
  {
    name: "เขต Island",
    href: "/whisky/region/island",
    image: "/images/categories/whisky.jpg"
  }
] as const;

const blankProducts = Array.from({ length: 12 }, (_, index) => index + 1);

export default async function WhiskyPage() {
  const products = await getWhiskyProducts(12);

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / วิสกี้
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] w-full sm:h-[360px]">
                <Image src="/images/categories/whisky.jpg" alt="Whisky" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.04)_0%,rgba(23,18,18,0.18)_100%)]" />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Whisky Guide</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">วิสกี้ (Whisky)</h1>

              <div className="mt-6 space-y-4 text-[15px] leading-8 text-[#5f5852] sm:text-base">
                <p>
                  วิสกี้ (Whisky) เป็นเครื่องดื่มแอลกอฮอล์ที่ทำจากธัญพืช เช่น ข้าวบาร์เลย์หรือข้าวโพด ผ่านกระบวนการหมัก กลั่น และบ่มในถังไม้
                  ทำให้มีกลิ่นหอมและรสชาติที่หลากหลาย
                </p>
                <p>
                  วิสกี้มีหลายประเภท เช่น Scotch Whisky จากสกอตแลนด์ และ American Whiskey อย่าง Bourbon
                  ซึ่งแต่ละแบบจะมีรสชาติแตกต่างกันไปตามแหล่งผลิต
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-[#f5efe5] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b6a2b]">Premium Selection</div>
                <div className="rounded-full bg-[#f3f6ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2437e8]">Curated by Region</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 pt-10 xl:grid-cols-2">
          <div className="rounded-[30px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">หมวดหมู่ยอดนิยม</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#171212]">เลือกตามสไตล์วิสกี้</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5852]">
              จัดกลุ่มประเภทวิสกี้ยอดนิยมไว้ชัดเจน เพื่อให้ค้นหาได้ง่ายและเข้าไปยังหน้าหมวดย่อยของแต่ละสไตล์ได้ทันที
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {whiskyStyleCards.map((style) => (
                <Link
                  key={style.name}
                  href={style.href}
                  className="group relative overflow-hidden rounded-2xl border border-[#ece4d6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative h-[165px]">
                    <Image
                      src={style.image}
                      alt={style.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.08)_0%,rgba(23,18,18,0.5)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-sm font-semibold text-white">{style.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">ภูมิภาคแนะนำ</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#171212]">เลือกตามแหล่งผลิต</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5852]">แยกภูมิภาคยอดนิยมสำหรับค้นหาคาแรกเตอร์ กลิ่น และโทนรสชาติของวิสกี้จากแต่ละเขต</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {whiskyRegionCards.map((region) => (
                <Link
                  key={region.name}
                  href={region.href}
                  className="group relative overflow-hidden rounded-2xl border border-[#ece4d6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative h-[165px]">
                    <Image
                      src={region.image}
                      alt={region.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.08)_0%,rgba(23,18,18,0.5)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-sm font-semibold text-white">{region.name}</div>
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
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">สินค้าวิสกี้ในระบบ</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5852]">
              หากคุณเพิ่มข้อมูลสินค้าลงในระบบแล้ว รายการจะขึ้นแสดงตรงส่วนนี้อัตโนมัติ และสามารถกดเข้าไปดูรายละเอียดสินค้าได้ทันที
            </p>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} fallbackLabel="Whisky" />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {blankProducts.map((item) => (
                <article key={item} className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                  <div className="grid h-[240px] place-items-center bg-[linear-gradient(135deg,#faf7f1_0%,#f2f5fb_100%)]">
                    <div className="grid h-[150px] w-[130px] place-items-center rounded-[28px] border-2 border-dashed border-[#d8cec0] px-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9187]">
                      เพิ่มรูปสินค้า
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">Whisky Item {item}</p>
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
