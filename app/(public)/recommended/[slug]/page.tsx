import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/site/category-page";
import { getProductsByRecommendedCategory, recommendedCategoryPages } from "@/lib/products";

const recommendedImages: Record<string, string> = {
  "best-sellers": "/images/categories/recommend.jpg",
  "new-arrivals": "/images/hero/hero-main.jpg",
  "monthly-picks": "/images/categories/month.webp",
  "premium-selection": "/images/categories/premium-wine.jpg",
  "gift-selection": "/images/categories/gift.webp"
};

export default async function RecommendedCategoryPage({
  params
}: {
  params: { slug: string };
}) {
  const currentPage = recommendedCategoryPages.find((item) => item.slug === params.slug);

  if (!currentPage) {
    notFound();
  }

  const products = await getProductsByRecommendedCategory(currentPage.slug, 24);

  return (
    <CategoryPage
      title={currentPage.title}
      englishTitle=""
      badge="สินค้าแนะนำ"
      description={currentPage.description}
      image={recommendedImages[currentPage.slug] ?? "/images/categories/recommend.jpg"}
      products={products}
      emptyMessage="No products available"
      breadcrumbs={[
        { label: "หน้าแรก", href: "/" },
        { label: "สินค้าแนะนำ", href: "/recommended/best-sellers" },
        { label: currentPage.title }
      ]}
    />
  );
}
