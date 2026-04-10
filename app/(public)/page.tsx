import { HomePage } from "@/components/site/home-page";
import { getArticles } from "@/lib/articles";
import { getLatestProducts } from "@/lib/products";

export default async function Page() {
  const [latestProducts, articles] = await Promise.all([getLatestProducts(8), getArticles()]);

  return <HomePage latestProducts={latestProducts} latestArticles={articles.slice(0, 4)} />;
}
