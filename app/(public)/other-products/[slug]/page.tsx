import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/site/category-page";
import { getProductsByCategoryOrType } from "@/lib/products";

const otherProductPages = [
  {
    slug: "mineral-water",
    title: "น้ำแร่",
    englishTitle: "Mineral Water",
    badge: "Essential Beverage",
    image: "/images/categories/mineral.jpg",
    description: "น้ำแร่สำหรับเสิร์ฟคู่กับอาหาร เครื่องดื่ม และงานบริการในร้านอาหาร โรงแรม หรือการจัดเลี้ยง ให้ภาพลักษณ์สะอาดและพรีเมียม",
    matchNames: ["น้ำแร่", "mineral water"],
    matchSlugs: ["mineral-water"]
  },
  {
    slug: "syrup",
    title: "ไซรัป (น้ำเชื่อม)",
    englishTitle: "Syrup",
    badge: "Bar Mixer",
    image: "/images/categories/syrup.webp",
    description: "ไซรัปและน้ำเชื่อมสำหรับผสมเครื่องดื่ม ชา กาแฟ และค็อกเทล ช่วยเพิ่มรสชาติและความสะดวกในการใช้งานหลังบาร์",
    matchNames: ["ไซรัป (น้ำเชื่อม)", "ไซรัป", "น้ำเชื่อม", "syrup"],
    matchSlugs: ["syrup"]
  },
  {
    slug: "bitters",
    title: "บิทเทอร์",
    englishTitle: "Bitters",
    badge: "Cocktail Accent",
    image: "/images/categories/bitters.jpg",
    description: "บิทเทอร์สำหรับเติมกลิ่นและมิติให้ค็อกเทล เหมาะสำหรับร้านบาร์และผู้ที่ต้องการสร้างสรรค์เครื่องดื่มอย่างมืออาชีพ",
    matchNames: ["บิทเทอร์", "bitters", "bitter"],
    matchSlugs: ["bitters", "bitter"]
  },
  {
    slug: "cigar",
    title: "ซิการ์",
    englishTitle: "Cigar",
    badge: "Lifestyle Item",
    image: "/images/categories/cigar.webp",
    description: "หมวดซิการ์สำหรับจัดแสดงสินค้ากลุ่มไลฟ์สไตล์และของพรีเมียม ให้ลูกค้าสามารถเข้าถึงรายการสินค้าเฉพาะทางได้สะดวก",
    matchNames: ["ซิการ์", "cigar", "cigars"],
    matchSlugs: ["cigar", "cigars"]
  }
] as const;

type OtherProductPageProps = {
  params: {
    slug: string;
  };
};

export default async function OtherProductSubPage({ params }: OtherProductPageProps) {
  const currentPage = otherProductPages.find((item) => item.slug === params.slug);

  if (!currentPage) {
    notFound();
  }

  const products = await getProductsByCategoryOrType([...currentPage.matchNames], [...currentPage.matchSlugs], 24);

  return (
    <CategoryPage
      title={currentPage.title}
      englishTitle={currentPage.englishTitle}
      badge={currentPage.badge}
      description={currentPage.description}
      image={currentPage.image}
      products={products}
      breadcrumbs={[
        { label: "หน้าแรก", href: "/" },
        { label: "สินค้าอื่นๆ", href: "/other-products" },
        { label: currentPage.title }
      ]}
    />
  );
}
