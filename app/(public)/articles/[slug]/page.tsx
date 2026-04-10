import { Fragment } from "react";

import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getArticleBySlug, getArticleCategories, getArticles, type ArticleSection } from "@/lib/articles";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

const articleSectionImages: Record<string, string[][]> = {
  "drink-guide-for-every-occasion": [
    ["/images/categories/whisky.jpg"],
    ["/images/categories/premium-wine.jpg"],
    ["/images/categories/cocktail-bar.jpg"],
    ["/images/categories/recommended.jpg"]
  ],
  "how-to-choose-whisky-for-your-bar": [
    ["/images/categories/scotch-whisky.png"],
    ["/images/categories/single-malt-whisky.png", "/images/categories/american-whisky.jpg"],
    ["/images/categories/cocktail-bar.jpg"]
  ],
  "wine-pairing-for-hospitality-business": [
    ["/images/categories/premium-wine.jpg"],
    ["/images/categories/budget-wine.jpg"],
    ["/images/categories/gift.webp"]
  ],
  "b2b-drinks-supply-in-pattaya": [
    ["/images/hero/partner.jpg"],
    ["/images/categories/bulk-purchase.jpg"],
    ["/images/hero/delivery.jpg"]
  ],
  "stock-planning-for-events-and-hotels": [
    ["/images/categories/minibar.jpg"],
    ["/images/hero/partner.jpg"],
    ["/images/hero/delivery.jpg"]
  ],
  "gift-bottle-selection-for-corporate-clients": [
    ["/images/categories/gift.webp"],
    ["/images/categories/recommended.jpg"],
    ["/images/categories/premium-spirits.jpg"]
  ]
};

function buildSectionId(title: string, index: number) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `section-${index + 1}`;
}

function getSectionImages(articleSlug: string, section: ArticleSection, index: number) {
  if (section.image) {
    return [section.image];
  }

  return articleSectionImages[articleSlug]?.[index] ?? [];
}

function getArticleTags(category: string) {
  return ["PattayaBev", category, "บทความแนะนำ"];
}

function InlineImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <figure className="mt-6 overflow-hidden rounded-[14px] border border-[#eadfce] bg-[#f7f1e8]">
      <div className="relative aspect-[16/9]">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 760px" priority={priority} />
      </div>
    </figure>
  );
}

function ArticleSectionBlock({
  articleSlug,
  section,
  index
}: {
  articleSlug: string;
  section: ArticleSection;
  index: number;
}) {
  const sectionId = buildSectionId(section.title, index);
  const [primaryImage, secondaryImage] = getSectionImages(articleSlug, section, index);

  if (section.variant === "cta") {
    return (
      <section
        id={sectionId}
        className="scroll-mt-28 rounded-[24px] border border-[#e1cfbb] bg-[linear-gradient(135deg,#faf3e8_0%,#fffaf3_100%)] px-6 py-7 sm:px-8"
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#b56d22]">เลือกต่อได้ทันที</p>
        <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-[#171212] sm:text-[34px]">{section.title}</h2>
        {section.intro ? <p className="mt-4 text-[17px] leading-8 text-[#403833]">{section.intro}</p> : null}
        {section.paragraphs?.length ? (
          <div className="mt-5 space-y-5">
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={`${sectionId}-paragraph-${paragraphIndex}`} className="text-[16px] leading-8 text-[#403833]">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
        {section.buttonLabel && section.buttonHref ? (
          <Link
            href={section.buttonHref}
            className="mt-7 inline-flex rounded-full bg-[#171212] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2d2622]"
          >
            {section.buttonLabel}
          </Link>
        ) : null}
      </section>
    );
  }

  if (section.variant === "note") {
    return (
      <section id={sectionId} className="scroll-mt-28 border-t border-[#eadfce] pt-10">
        <div className="rounded-[22px] border border-[#eadfce] bg-[#fff8ef] px-6 py-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#b56d22]">หมายเหตุ</p>
          <h2 className="mt-3 text-[24px] font-extrabold leading-tight text-[#171212] sm:text-[28px]">{section.title}</h2>
          {section.paragraphs?.length ? (
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${sectionId}-paragraph-${paragraphIndex}`} className="text-[16px] leading-8 text-[#433c36]">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id={sectionId} className="scroll-mt-28 border-t border-[#eadfce] pt-10 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#b56d22]">Section {String(index + 1).padStart(2, "0")}</p>
      <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-[#b4411d] sm:text-[34px]">{section.title}</h2>

      {section.intro ? <p className="mt-4 text-[17px] leading-8 text-[#39322e]">{section.intro}</p> : null}
      {primaryImage ? <InlineImage src={primaryImage} alt={section.title} priority={index === 0} /> : null}

      {section.paragraphs?.length ? (
        <div className="mt-6 space-y-5">
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <Fragment key={`${sectionId}-paragraph-${paragraphIndex}`}>
              <p className="text-[16px] leading-8 text-[#39322e]">{paragraph}</p>
              {secondaryImage && paragraphIndex === 0 ? <InlineImage src={secondaryImage} alt={section.title} /> : null}
            </Fragment>
          ))}
        </div>
      ) : null}

      {section.bullets?.length ? (
        <ul className="mt-6 space-y-3">
          {section.bullets.map((item, bulletIndex) => (
            <li key={`${sectionId}-bullet-${bulletIndex}`} className="flex items-start gap-3 text-[16px] leading-8 text-[#39322e]">
              <span className="mt-[11px] inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#c55b1f]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "ไม่พบบทความ | PattayaBev"
    };
  }

  return {
    title: `${article.title} | PattayaBev`,
    description: article.excerpt
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  noStore();

  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const [allArticles, categories] = await Promise.all([getArticles(), getArticleCategories()]);
  const relatedArticles = allArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const sectionLinks = article.sections.map((section, index) => ({
    href: `#${buildSectionId(section.title, index)}`,
    title: section.title
  }));
  const tags = getArticleTags(article.category);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <main className="pb-20 pt-6">
        <section className="px-4">
          <div className="mx-auto max-w-[1180px]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b6a2b]">
              <Link href="/" className="transition hover:text-[#2437e8]">
                หน้าแรก
              </Link>{" "}
              /{" "}
              <Link href="/articles" className="transition hover:text-[#2437e8]">
                บทความ
              </Link>{" "}
              / {article.title}
            </p>

            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,760px)_240px]">
              <article className="min-w-0">
                <header>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">{article.category}</p>
                  <h1 className="mt-3 text-[32px] font-extrabold leading-[1.12] tracking-tight text-[#171212] sm:text-[40px] lg:text-[46px]">
                    {article.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] font-semibold text-[#8f867b]">
                    <span>{article.publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d4c8ba]" />
                    <span>{article.readTime}</span>
                  </div>
                </header>

                <div className="mt-6 overflow-hidden rounded-[16px] border border-[#eadfce] bg-[#f5efe6]">
                  <div className="relative aspect-[16/9]">
                    <Image src={article.image} alt={article.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 760px" priority />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className={`inline-flex rounded-sm px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                        index === 0 ? "bg-[#be1e2d] text-white" : index === 1 ? "bg-[#f4d8df] text-[#9d1631]" : "bg-[#ece9ff] text-[#3646d4]"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 space-y-5 border-b border-[#eadfce] pb-10">
                  {article.introduction.map((paragraph, index) => (
                    <p key={`${article.slug}-intro-${index}`} className="text-[16px] leading-8 text-[#39322e] sm:text-[17px]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-10 space-y-10">
                  {article.sections.map((section, index) => (
                    <ArticleSectionBlock key={`${article.slug}-${section.title}-${index}`} articleSlug={article.slug} section={section} index={index} />
                  ))}
                </div>
              </article>

              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="rounded-[14px] border border-[#eadfce] bg-white p-5">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">เนื้อหาในบทความ</p>
                    <nav className="mt-4 grid gap-2">
                      {sectionLinks.map((item, index) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="rounded-[12px] border border-[#ece4d6] px-4 py-3 text-sm font-semibold leading-6 text-[#171212] transition hover:border-[#d9c2a0] hover:bg-[#fbf6ee]"
                        >
                          <span className="mr-2 text-[#b56d22]">{String(index + 1).padStart(2, "0")}.</span>
                          {item.title}
                        </a>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-6 border-t border-[#eadfce] pt-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">หมวดบทความ</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href="/articles"
                          className={`rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${
                            category === article.category ? "bg-[#171212] text-white" : "border border-[#e1d7ca] text-[#5a524c]"
                          }`}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedArticles.length ? (
          <section className="px-4 pt-14">
            <div className="mx-auto max-w-[1180px] border-t border-[#eadfce] pt-10">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">อ่านต่อ</p>
                  <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#171212]">บทความที่เกี่ยวข้อง</h2>
                </div>
                <Link href="/articles" className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2437e8]">
                  ดูบทความทั้งหมด
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {relatedArticles.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/articles/${item.slug}`}
                    className="overflow-hidden rounded-[18px] border border-[#ece4d6] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.05)]"
                  >
                    <div className="relative aspect-[16/10] bg-[#f5efe6]">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 33vw" />
                    </div>
                    <div className="space-y-3 px-5 py-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8b6a2b]">{item.category}</p>
                      <h3 className="line-clamp-2 text-[22px] font-extrabold leading-7 text-[#171212]">{item.title}</h3>
                      <p className="line-clamp-3 text-[15px] leading-7 text-[#5e5752]">{item.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
