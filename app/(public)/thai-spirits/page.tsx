import { CategoryPage } from "@/components/site/category-page";
import { getProductsByCategory } from "@/lib/products";

export default async function ThaiSpiritsPage() {
  const products = await getProductsByCategory(["สุราไทย", "thai spirits"], ["thai-spirits"], 24);

  return (
    <CategoryPage
      title="สุราไทย"
      englishTitle="Thai Spirits"
      badge="Thai Selection"
      description="หมวดสุราไทยสำหรับรวบรวมแบรนด์ท้องถิ่นและสินค้าที่สะท้อนเอกลักษณ์ของตลาดไทย เหมาะสำหรับขายปลีก ลูกค้าธุรกิจ และจัดแสดงบนเว็บไซต์อย่างเป็นระบบ"
      image="/images/categories/thaispirit.jpg"
      products={products}
    />
  );
}
