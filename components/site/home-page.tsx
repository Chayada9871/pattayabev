import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard as ProductCardItem } from "@/components/site/product-card";
import type { ArticleItem } from "@/lib/articles";
import type { ProductCard as ProductCardData } from "@/lib/products";

const miniPromos = [
  {
    title: "TRENDING",
    headline: "สินค้ายอดนิยม",
    button: "ช้อปเลย",
    description: "ค้นพบสินค้ายอดนิยมที่ลูกค้ากำลังเลือกซื้อในช่วงนี้",
    image: "/images/categories/recommend.jpg"
  },
  {
    title: "FEATURED",
    headline: "สินค้าพิเศษประจำเดือน",
    button: "สำรวจ",
    description: "ขวดคัดสรรประจำเดือนที่โดดเด่นทั้งคุณภาพและความคุ้มค่า",
    image: "/images/categories/budget-wine.jpg"
  },
  {
    title: "B2B",
    headline: "โซลูชันสำหรับราคาส่ง",
    button: "ดูเพิ่มเติม",
    description: "บริการจัดหาเครื่องดื่มสำหรับโรงแรม ร้านอาหาร และงานอีเวนต์อย่างมืออาชีพ",
    image: "/images/hero/wholesale.jpg"
  }
];

miniPromos[2].headline = "สำหรับธุรกิจ (B2B)";
miniPromos[2].button = "ดูรายละเอียด";
miniPromos[2].description = "โซลูชันเครื่องดื่มสำหรับร้านอาหาร บาร์ โรงแรม และผู้ประกอบการ";

const featureSelection = [
  { title: "วิสกี้คัดพิเศษ", subtitle: "ขวดหายากและรสนิยมโดดเด่น", image: "/images/categories/bulk-purchase.jpg" },
  { title: "อิตาเลียน อะเพอริทิโว", subtitle: "สดชื่น ดื่มง่าย และเสิร์ฟคู่เมนูได้ดี", image: "/images/categories/premium-wine.jpg" },
  { title: "รัมสำหรับค่ำคืนสบาย", subtitle: "นุ่มนวล เหมาะกับค่ำคืนสบายและเมนูค็อกเทล", image: "/images/categories/budget-spirit.jpg" },
  { title: "เครื่องดื่มราคาคุ้มค่า", subtitle: "คุ้มราคาและพร้อมใช้สำหรับงานบริการทุกวัน", image: "/images/hero/promo-buy-more.jpg" }
];

const specials = [
  { name: "Pure", caption: "วอดก้าคัดสรร" },
  { name: "Pearl", caption: "ไวท์สปิริต" },
  { name: "Kao Hom", caption: "สุราไทย" },
  { name: "Royal Black", caption: "ขวดสะสม" },
  { name: "Reserve", caption: "ไวน์พรีเมียม" }
];

const featureBrands = [
  { name: "Macallan", image: "/images/brands/macallan.png" },
  { name: "Moet & Chandon", image: "/images/brands/moet-chandon.png" },
  { name: "Jack Daniel's", image: "/images/brands/jack-daniels.png" },
  { name: "Johnnie Walker", image: "/images/brands/johnnie-walker.png" },
  { name: "Hennessy", image: "/images/brands/hennessy.png" },
  { name: "Penfolds", image: "/images/brands/penfolds.png" },
  { name: "Remy Martin", image: "/images/brands/remy-martin.png" },
  { name: "Wolf Blass", image: "/images/brands/wolf-blass.png" }
];

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(price);
}

export function HomePage({
  latestProducts = [],
  latestArticles = []
}: {
  latestProducts?: ProductCardData[];
  latestArticles?: ArticleItem[];
}) {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <main className="pb-10">
        <section className="px-4 pt-4 sm:pt-6">
          <div className="mx-auto max-w-[1220px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_60%,#f5f8ff_100%)] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">Staff Tools</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#171212] sm:text-xl">จัดการสินค้าในเว็บไซต์</h2>
                <p className="mt-1 text-sm leading-6 text-[#5f5852]">สำหรับผู้ดูแลระบบและผู้จัดการ สามารถเพิ่มสินค้าใหม่และอัปเดตข้อมูลได้จากหลังบ้าน</p>
              </div>

              <Link
                href="/admin"
                className="inline-flex items-center rounded-full bg-[#171212] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#2b2424]"
              >
                เพิ่มสินค้า
              </Link>
            </div>

            <div className="grid gap-[3px] lg:grid-cols-[0.95fr_1.1fr_1fr]">
              <article className="relative min-h-[220px] overflow-hidden bg-[#ececec] sm:min-h-[268px]">
                <Image
                  src="/images/hero/hero-main.jpg"
                  alt="PattayaBev main highlight"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 27vw"
                  priority
                />
              </article>

              <article className="relative min-h-[240px] overflow-hidden bg-white sm:min-h-[268px]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)]" />
                <div className="relative z-10 flex h-full flex-col justify-center px-4 py-5 sm:px-5 sm:py-6 md:px-8">
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.02em] text-[#2a2a2a] sm:text-[14px]">HIGHLIGHT</p>
                  <h1 className="mt-3 inline-flex w-fit max-w-full bg-[#2437e8] px-3 py-2 text-[26px] font-extrabold uppercase leading-none text-white sm:mt-4 sm:px-4 sm:text-[34px] md:text-[54px]">
                    คัดสรรเครื่องดื่มสำหรับทุกโอกาส
                  </h1>
                  <p className="mt-4 max-w-[500px] text-[12px] font-bold uppercase leading-5 text-[#232323] sm:mt-5 sm:text-[13px] sm:leading-6 md:text-[14px]">
                    พบกับไวน์ สุรา และเครื่องดื่มคุณภาพ สำหรับร้านอาหาร งานอีเวนต์ ของขวัญ และการใช้งานในทุกวัน
                  </p>
                  <p className="mt-3 max-w-[480px] text-[12px] leading-5 text-[#4c4c4c] sm:text-[13px] sm:leading-6">
                    สินค้าคัดสรรอย่างพิถีพิถัน บริการที่ไว้ใจได้ และการสั่งซื้อที่สะดวกครบจบในที่เดียว
                  </p>
                  <a
                    href="/catalog"
                    className="mt-5 inline-flex w-fit items-center rounded-full bg-[#2437e8] px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white sm:mt-6 sm:px-6 sm:py-3 sm:text-[12px]"
                  >
                    เลือกชมสินค้า
                  </a>
                </div>
              </article>

              <div className="grid gap-[3px]">
                <article className="relative min-h-[132px] overflow-hidden">
                  <Image
                    src="/images/hero/delivery.jpg"
                    alt="Fast delivery"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 27vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(160,76,251,0.82),rgba(89,26,170,0.52))]" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white sm:p-6">
                    <div className="max-w-[240px]">
                      <p className="inline-flex bg-white/18 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                        SERVICE
                      </p>
                      <h2 className="mt-3 text-[20px] font-extrabold uppercase leading-tight sm:text-[24px]">จัดส่งรวดเร็ว</h2>
                      <p className="mt-3 text-[12px] leading-5 text-white/90">
                        ส่งภายใน 1 วันในเขตพัทยา พร้อมบริการที่รวดเร็วและเชื่อถือได้
                      </p>
                    </div>
                    <a href="/catalog" className="inline-flex w-fit rounded-full bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] sm:px-5 sm:text-[11px]">
                      สำรวจ
                    </a>
                  </div>
                </article>

                <article className="relative min-h-[132px] overflow-hidden">
                  <Image
                    src="/images/hero/partner.jpg"
                    alt="PattayaBev B2B service"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 27vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,20,20,0.58),rgba(153,24,24,0.36))]" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white sm:p-6">
                    <div className="max-w-[240px]">
                      <p className="inline-flex bg-white/18 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                        B2B SERVICE
                      </p>
                      <h2 className="mt-3 text-[20px] font-extrabold uppercase leading-tight text-transparent sm:text-[24px]">
                        <span className="text-white">เครื่องดื่มคุณภาพ สำหรับธุรกิจของคุณ</span>
                      ร่วมเป็นพาร์ทเนอร์กับเรา
                      </h2>
                      <p className="mt-3 text-[12px] leading-5 text-transparent">
                        <span className="text-white/90">รวมสินค้าพรีเมียมจากทั่วโลก เหมาะสำหรับร้านอาหาร บาร์ โรงแรม และผู้ประกอบการ</span>
                        สมัครเพื่อรับสิทธิ์ราคาส่ง โปรโมชั่นพิเศษ และการดูแลสำหรับลูกค้าธุรกิจ
                      </p>
                    </div>
                    <a href="/b2b" className="inline-flex w-fit rounded-full bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] sm:px-5 sm:text-[11px]">
                      ดูรายละเอียด
                    </a>
                  </div>
                </article>
              </div>
            </div>

            <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-black sm:text-[13px]">PATTAYABEV B2B SERVICE</p>
          </div>
        </section>

        <section className="px-4 pt-10 sm:pt-14">
          <div className="mx-auto grid max-w-[1220px] gap-4 lg:grid-cols-3">
            {miniPromos.map((item, index) => (
              <article key={item.title} className="relative min-h-[180px] overflow-hidden rounded-[4px] bg-[#efefef] sm:min-h-[150px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.68),rgba(255,255,255,0.18))]"
                      : index === 1
                        ? "bg-[linear-gradient(90deg,rgba(20,20,20,0.42),rgba(255,255,255,0.08))]"
                        : "bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72),rgba(255,255,255,0.28))]"
                  }`}
                />
                <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                  <div className={`max-w-[220px] ${index === 1 ? "text-white" : "text-[#171717]"}`}>
                    <p
                      className={`inline-flex px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                        index === 1 ? "bg-[#684df3] text-white" : "bg-[#3b73d9] text-white"
                      }`}
                    >
                      {item.title}
                    </p>
                    <h3 className="mt-3 text-[18px] font-extrabold uppercase tracking-[0.04em]">
                      {item.headline}
                    </h3>
                    <p className={`mt-3 text-[12px] leading-5 ${index === 1 ? "text-white/90" : "text-[#202020]"}`}>
                      {item.description}
                    </p>
                  </div>
                  <a
                    href={index === 2 ? "/b2b" : "/catalog"}
                    className={`inline-flex w-fit rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      index === 1 ? "bg-white text-[#171717]" : index === 2 ? "bg-black text-white" : "bg-[#2437e8] text-white"
                    }`}
                  >
                    {item.button}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {latestArticles.length ? (
          <section className="px-4 pt-10 sm:pt-12">
            <div className="mx-auto max-w-[1220px]">
              <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-black sm:text-[34px]">บทความล่าสุด</h2>
                <Link href="/articles" className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">
                  ดูทั้งหมด
                </Link>
              </div>
              <p className="mb-5 max-w-[760px] text-[13px] leading-6 text-[#5b5b5b] sm:text-[14px] sm:leading-7">
                อัปเดตบทความล่าสุดจาก PattayaBev เพื่อช่วยให้ลูกค้าเลือกสินค้าได้ง่ายขึ้น และเห็นเรื่องน่าสนใจใหม่ ๆ บนเว็บไซต์ทันที
              </p>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {latestArticles.slice(0, 4).map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative h-[220px] bg-[#f7f3ec]">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 25vw"
                      />
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">{article.category}</p>
                      <h3 className="line-clamp-2 text-[20px] font-extrabold leading-7 text-[#171212]">{article.title}</h3>
                      <p className="line-clamp-3 text-sm leading-7 text-[#5f5852]">{article.excerpt}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a9187]">
                        <span>{article.publishedAt}</span>
                        <span className="h-1 w-1 rounded-full bg-[#d0c3b5]" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {false && (
          <>
        <section className="px-4 pt-10 sm:pt-12">
          <div className="mx-auto max-w-[1220px]">
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-black sm:text-[34px]">Feature Selection</h2>
              <a href="/catalog" className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">
                ดูทั้งหมด
              </a>
            </div>
            <p className="mb-5 max-w-[760px] text-[13px] leading-6 text-[#5b5b5b] sm:text-[14px] sm:leading-7">
              สำรวจคอลเลกชันคัดสรรที่เลือกมาเพื่อคุณภาพ รสนิยม และโอกาสพิเศษที่น่าจดจำ
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureSelection.map((item, index) => (
                <article key={item.title} className="relative min-h-[120px] overflow-hidden rounded-[2px] sm:min-h-[92px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                  />
                  <div
                    className={`absolute inset-0 ${
                      index === 0
                        ? "bg-[linear-gradient(90deg,rgba(0,0,0,0.22),rgba(255,255,255,0.62))]"
                        : index === 1
                          ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.3),rgba(255,255,255,0.68))]"
                          : index === 2
                            ? "bg-[linear-gradient(90deg,rgba(0,0,0,0.46),rgba(255,255,255,0.26))]"
                            : "bg-[linear-gradient(90deg,rgba(145,54,255,0.62),rgba(255,255,255,0.18))]"
                    }`}
                  />
                  <div className="relative z-10 flex h-full items-start p-4">
                    <div className="max-w-[82%] sm:max-w-[78%]">
                      <p className="inline-flex bg-[#4051ff] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-white">
                        คัดสรร
                      </p>
                      <h3 className="mt-2 text-[16px] font-extrabold uppercase leading-4 text-white sm:text-[18px]">{item.title}</h3>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/90">{item.subtitle}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pt-10 sm:pt-12">
          <div className="mx-auto max-w-[1220px]">
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-[#d11d17] sm:text-[34px]">Special of the Week</h2>
              <a href="/catalog" className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">
                ดูทั้งหมด
              </a>
            </div>
            <p className="mb-5 max-w-[760px] text-[13px] leading-6 text-[#5b5b5b] sm:text-[14px] sm:leading-7">
              ขวดแนะนำประจำสัปดาห์ที่คัดมาเพื่อคุณภาพ ความคุ้มค่า และความนิยมของลูกค้า
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {specials.map((item) => (
                <article key={item.name} className="rounded-md border border-[#e3e3e3] bg-white px-3 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-transform duration-300 hover:-translate-y-1">
                  <div className="grid h-[180px] w-full place-items-center rounded-md border border-dashed border-[#d6d6d6] bg-[#fafafa] text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[#a3a3a3] sm:h-[210px]">
                    เพิ่มรูปสินค้า
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-[14px] font-extrabold uppercase tracking-[0.08em] text-[#171717]">{item.name}</h3>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7b7b7b]">{item.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

          </>
        )}

        {latestProducts.length ? (
          <section className="px-4 pt-10 sm:pt-12">
            <div className="mx-auto max-w-[1220px]">
              <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-black sm:text-[34px]">Latest Products</h2>
                <a href="/catalog" className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">
                  View all
                </a>
              </div>
              <p className="mb-5 max-w-[760px] text-[13px] leading-6 text-[#5b5b5b] sm:text-[14px] sm:leading-7">
                Newly added products from the admin panel will appear here automatically so the storefront always stays current.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {latestProducts.map((product) => (
                  <ProductCardItem key={`card-${product.id}`} product={product} fallbackLabel="Product" />
                ))}
                {false && latestProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative h-[240px] bg-white">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-5" sizes="(max-width: 1024px) 100vw, 25vw" />
                      ) : (
                        <div className="grid h-full place-items-center text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9187]">
                          No image yet
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 px-5 py-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">{product.brandName ?? product.categoryName ?? "Product"}</p>
                      <h3 className="line-clamp-2 text-base font-extrabold text-[#171212]">{product.name}</h3>
                      <p className="text-sm text-[#5f5852]">
                        {[product.bottleSizeMl ? `${product.bottleSizeMl} ml` : null, product.alcoholPercent ? `${product.alcoholPercent}%` : null]
                          .filter(Boolean)
                          .join(" • ") || "View product details"}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-lg font-extrabold ${product.discountedPrice != null ? "text-[#d02022]" : "text-[#171212]"}`}>
                            {formatPrice(product.discountedPrice ?? product.price, product.currency)}
                          </p>
                          {product.discountedPrice != null ? (
                            <div className="mt-1 flex items-center gap-2">
                              <p className="text-xs font-semibold text-[#9b9187] line-through">{formatPrice(product.price, product.currency)}</p>
                              {product.activeDiscountPercent != null ? (
                                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#d02022]">-{product.activeDiscountPercent}%</span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${product.inStock ? "bg-[#edf7ef] text-[#207443]" : "bg-[#fbe9e9] text-[#a61b1f]"}`}>
                          {product.inStock ? "In stock" : "Out"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="px-4 pt-12">
          <div className="mx-auto max-w-[1220px]">
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-black sm:text-[34px]">Feature Brands</h2>
              <a href="/catalog" className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">
                View all
              </a>
            </div>

            <div className="overflow-x-auto border-t border-[#ececec] pt-6">
              <div className="flex min-w-max items-center gap-8 pb-2">
              {featureBrands.map((brand) => (
                <div key={brand.name} className="relative h-[74px] w-[180px] shrink-0 sm:w-[220px]">
                  <Image src={brand.image} alt={brand.name} fill className="object-contain" sizes="240px" />
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
