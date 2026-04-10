import { CategoryPage } from "@/components/site/category-page";
import { getProductsByCategory } from "@/lib/products";

export default async function BarToolsPage() {
  const products = await getProductsByCategory(["อุปกรณ์บาร์", "bar tools"], ["bar-tools"], 24);

  return (
    <CategoryPage
      title="อุปกรณ์บาร์"
      englishTitle="Bar Tools"
      badge="Bar Essentials"
      description="รวมอุปกรณ์บาร์ที่จำเป็นสำหรับร้านอาหาร โรงแรม และผู้ที่ต้องการจัดบาร์ที่บ้าน โดยหน้านี้พร้อมแสดงสินค้าที่เพิ่มจากระบบหลังบ้านได้ทันที"
      image="/images/categories/bartool.jpeg"
      products={products}
    />
  );
}
