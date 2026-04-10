import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "บทความ | PattayaBev",
  description: "บทความเกี่ยวกับเครื่องดื่ม เมนู และแนวทางสำหรับร้านอาหาร บาร์ โรงแรม และธุรกิจบริการในพัทยา"
};

const articleHighlights = [
  {
    label: "GUIDE",
    title: "คู่มือสำหรับผู้เริ่มต้น",
    description: "เข้าใจประเภทเครื่องดื่ม รสชาติ และวิธีเลือกให้เหมาะกับตัวเองได้ง่ายขึ้น",
    href: "/articles/drink-guide-for-every-occasion"
  },
  {
    label: "PATTAYA",
    title: "บทความสำหรับธุรกิจในพัทยา",
    description: "แนวคิดเรื่องเมนู การจัดซื้อ และการจัดสต็อกที่เหมาะกับธุรกิจในพื้นที่",
    href: "/b2b"
  }
] as const;

export default async function ArticlesPage() {
  noStore();

  const articles = await getArticles();
  const [featuredArticle, ...otherArticles] = articles;

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <main className="pb-16">
        <section className="px-4 pt-6">
          <div className="mx-auto max-w-[1220px]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
              <Link href="/" className="hover:text-[#2437e8]">
                หน้าแรก
              </Link>{" "}
              / บทความ
            </p>

            <div className="mt-5 grid gap-[3px] lg:grid-cols-[1fr_1.05fr]">
              <article className="relative min-h-[320px] overflow-hidden rounded-l-[28px] rounded-r-[28px] bg-[#ececec] sm:min-h-[420px] lg:rounded-r-none">
                <Image
                  src="/images/hero/hero-main.jpg"
                  alt="บทความและไอเดียจาก PattayaBev"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,15,15,0.12),rgba(15,15,15,0.3))]" />
                <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
                  <p className="inline-flex w-fit bg-white/18 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                    EDITORIAL
                  </p>

                  <div className="max-w-[420px] rounded-[22px] border border-white/20 bg-white/12 p-4 text-white backdrop-blur-sm sm:p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f0d6a8]">PattayaBev Journal</p>
                    <p className="mt-2 text-[14px] leading-7 text-white/90 sm:text-[15px]">
                      รวมบทความเกี่ยวกับเครื่องดื่ม เมนู การเลือกสินค้า และแนวคิดที่ช่วยให้ทั้งลูกค้าทั่วไปและธุรกิจตัดสินใจได้ง่ายขึ้น
                    </p>
                  </div>
                </div>
              </article>

              <article className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-white sm:min-h-[420px] lg:rounded-l-none">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_58%,#f5f8ff_100%)]" />
                <div className="relative z-10 flex h-full flex-col justify-center px-5 py-7 sm:px-7 md:px-8 lg:px-10">
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">ARTICLE DIRECTORY</p>
                  <h1 className="mt-4 max-w-[620px] text-[34px] font-extrabold leading-[1.04] tracking-tight text-[#171212] sm:text-[44px] lg:text-[52px]">
                    บทความที่ช่วยให้
                    <br />
                    เลือกเครื่องดื่มได้ง่ายขึ้น
                  </h1>
                  <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-[#5f5852] sm:text-base sm:leading-8">
                    รวมคอนเทนต์ที่อ่านง่าย ใช้ได้จริง และเหมาะกับทั้งคนที่กำลังเริ่มต้นสนใจเครื่องดื่ม ไปจนถึงร้านอาหาร บาร์ และธุรกิจบริการในพัทยา
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {articleHighlights.map((item, index) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`rounded-[22px] border border-[#e9dfd1] px-4 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 ${
                          index === 0 ? "bg-white" : "bg-[#f7f8ff]"
                        }`}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8b6a2b]">{item.label}</p>
                        <h2 className="mt-2 text-[17px] font-extrabold leading-6 text-[#171212]">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#5f5852]">{item.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {featuredArticle ? (
          <section className="px-4 pt-10 sm:pt-12">
            <div className="mx-auto max-w-[1220px]">
              <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-black sm:text-[34px]">Featured Article</h2>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">เรื่องแนะนำล่าสุด</span>
              </div>

              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="grid gap-[3px] overflow-hidden rounded-[28px] lg:grid-cols-[1.05fr_0.95fr]"
              >
                <div className="relative min-h-[280px] overflow-hidden bg-[#ececec] sm:min-h-[360px]">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 52vw"
                  />
                </div>

                <div className="flex flex-col justify-center bg-[linear-gradient(135deg,#171212_0%,#2b2420_42%,#5b3716_100%)] px-6 py-8 text-white sm:px-8 sm:py-10">
                  <p className="inline-flex w-fit bg-white/14 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#f2d2a1]">
                    {featuredArticle.category}
                  </p>
                  <h3 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[36px]">{featuredArticle.title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-white/80 sm:text-base sm:leading-8">{featuredArticle.excerpt}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
                    <span>{featuredArticle.publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <span>{featuredArticle.readTime}</span>
                  </div>

                  <span className="mt-7 inline-flex w-fit rounded-full bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171212]">
                    อ่านบทความ
                  </span>
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="px-4 pt-10 sm:pt-12">
          <div className="mx-auto max-w-[1220px]">
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <h2 className="text-[24px] font-extrabold uppercase tracking-[0.02em] text-black sm:text-[34px]">Latest Stories</h2>
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a9a9a]">อัปเดตจาก PattayaBev</span>
            </div>
            <p className="mb-5 max-w-[760px] text-[13px] leading-6 text-[#5b5b5b] sm:text-[14px] sm:leading-7">
              บทความที่คัดมาเพื่อช่วยให้เลือกสินค้าได้ง่ายขึ้น ทั้งในมุมของการดื่ม การจัดเมนู และการวางแผนสำหรับธุรกิจ
            </p>

            {otherArticles.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {otherArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative h-[230px] bg-[#f7f3ec]">
                      <Image src={article.image} alt={article.title} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 33vw" />
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">{article.category}</p>
                      <h3 className="line-clamp-2 text-[22px] font-extrabold leading-7 text-[#171212]">{article.title}</h3>
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
            ) : !featuredArticle ? (
              <div className="rounded-[24px] border border-dashed border-[#d8cec0] bg-[#fbf7f0] px-6 py-10 text-center text-sm leading-7 text-[#5f5852]">
                ยังไม่มีบทความในระบบ
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
