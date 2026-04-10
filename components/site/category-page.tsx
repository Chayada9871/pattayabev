import Image from "next/image";
import Link from "next/link";

import type { ProductCard } from "@/lib/products";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard as ProductCardItem } from "@/components/site/product-card";

type CategoryPageProps = {
  title: string;
  englishTitle: string;
  badge: string;
  description: string;
  image: string;
  products: ProductCard[];
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  emptyMessage?: string;
};

const blankProducts = Array.from({ length: 8 }, (_, index) => index + 1);

export function CategoryPage({ title, englishTitle, badge, description, image, products, breadcrumbs, emptyMessage }: CategoryPageProps) {
  const breadcrumbItems =
    breadcrumbs && breadcrumbs.length
      ? breadcrumbs
      : [
          { label: "หน้าแรก", href: "/" },
          { label: title }
        ];

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            {breadcrumbItems.map((item, index) => (
              <span key={`${item.label}-${index}`}>
                {index > 0 ? " / " : null}
                {item.href ? (
                  <Link href={item.href} className="hover:text-[#2437e8]">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </span>
            ))}
          </p>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-[#e9dfd1] bg-[#f8f5ef] shadow-[0_18px_34px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] w-full sm:h-[360px]">
                <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,18,0.06)_0%,rgba(23,18,18,0.22)_100%)]" />
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">{badge}</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">
                {title}
                {englishTitle ? <span className="text-[#8b6a2b]"> ({englishTitle})</span> : null}
              </h1>

              <p className="mt-6 text-[15px] leading-8 text-[#5f5852] sm:text-base">{description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-[#f5efe5] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b6a2b]">Curated Selection</div>
                <div className="rounded-full bg-[#f3f6ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2437e8]">Ready for Catalog</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ece7de] pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">รายการสินค้า</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#171212]">สินค้าในหมวด {title}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5852]">สินค้าที่ถูกเพิ่มและจัดอยู่ในหมวด {title} จะแสดงที่หน้านี้อัตโนมัติ พร้อมลิงก์เข้าสู่รายละเอียดสินค้า</p>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCardItem key={product.id} product={product} fallbackLabel={englishTitle || title} />
              ))}
            </div>
          ) : emptyMessage ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-[#d8cec0] bg-[#fffdf8] p-8 text-sm leading-7 text-[#5f5852]">{emptyMessage}</div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {blankProducts.map((item) => (
                <article key={item} className="overflow-hidden rounded-[24px] border border-[#ece4d6] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <div className="grid h-[240px] place-items-center bg-white">
                    <div className="grid h-[150px] w-[130px] place-items-center rounded-[28px] border-2 border-dashed border-[#d8cec0] px-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9187]">
                      เพิ่มรูปสินค้า
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8b6a2b]">
                      {englishTitle || title} {item}
                    </p>
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
