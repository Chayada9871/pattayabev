import { CategoryPage } from "@/components/site/category-page";
import { getProductsByCategory } from "@/lib/products";

export default async function SpiritsPage() {
  const products = await getProductsByCategory(["สปิริตส์", "spirits", "spirit"], ["spirits", "spirit"], 24);

  return (
    <CategoryPage
      title="สปิริตส์"
      englishTitle="Spirits"
      badge="Spirits Collection"
      description="รวมเครื่องดื่มสปิริตส์หลากหลายประเภทสำหรับการขายปลีก ลูกค้าธุรกิจ และงานบริการ พร้อมรองรับการแสดงสินค้าจริงจากฐานข้อมูลของร้าน"
      image="/images/categories/premium-spirits.jpg"
      products={products}
    />
  );
}
