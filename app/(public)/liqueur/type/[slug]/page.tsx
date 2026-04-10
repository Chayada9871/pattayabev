import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/site/category-page";
import { getProductsByCategoryOrType } from "@/lib/products";

const liqueurTypePages = [
  {
    slug: "gin",
    title: "จิน",
    englishTitle: "Gin",
    badge: "Gin Selection",
    image: "/images/categories/gin.jpg",
    description: "สุราที่มีกลิ่นเด่นจากจูนิเปอร์เบอร์รี่ ผสานสมุนไพรและเครื่องเทศ ให้รสสดชื่น นิยมใช้ในค็อกเทลคลาสสิก",
    matchNames: ["จิน", "gin"],
    matchSlugs: ["gin"]
  },
  {
    slug: "rum",
    title: "รัม",
    englishTitle: "Rum",
    badge: "Rum Selection",
    image: "/images/categories/rum.jpg",
    description: "สุราที่ผลิตจากอ้อยหรือกากน้ำตาล ให้รสหวานนุ่ม มีกลิ่นคาราเมลและเครื่องเทศ พบได้ตั้งแต่สไตล์เบาไปจนถึงเข้มข้น",
    matchNames: ["รัม", "rum"],
    matchSlugs: ["rum"]
  },
  {
    slug: "vodka",
    title: "วอดก้า",
    englishTitle: "Vodka",
    badge: "Vodka Selection",
    image: "/images/categories/vodka.jpg",
    description: "สุราที่ผ่านการกลั่นหลายครั้งจนมีความใสและรสสะอาด มักทำจากธัญพืชหรือมันฝรั่ง เหมาะสำหรับดื่มเพียวหรือผสมค็อกเทล",
    matchNames: ["วอดก้า", "vodka"],
    matchSlugs: ["vodka"]
  },
  {
    slug: "tequila",
    title: "เตกีล่า",
    englishTitle: "Tequila",
    badge: "Tequila Selection",
    image: "/images/categories/tequila.jpg",
    description: "สุราจากเม็กซิโกที่ผลิตจากพืชอากาเว่ ให้รสเฉพาะตัวตั้งแต่สดใสไปจนถึงนุ่มลึกตามระยะเวลาการบ่ม",
    matchNames: ["เตกีล่า", "tequila"],
    matchSlugs: ["tequila"]
  },
  {
    slug: "sake-shochu",
    title: "สาเก / โซจู",
    englishTitle: "Sake / Shochu",
    badge: "Asian Spirits",
    image: "/images/categories/sake.jpg",
    description: "เครื่องดื่มแอลกอฮอล์จากเอเชีย โดยสาเกทำจากข้าวผ่านการหมัก ส่วนโซจูเป็นสุรากลั่นรสนุ่ม ดื่มง่าย และได้รับความนิยมอย่างแพร่หลาย",
    matchNames: ["สาเก / โซจู", "สาเก", "โซจู", "sake", "shochu", "soju"],
    matchSlugs: ["sake-shochu", "sake", "shochu", "soju"]
  },
  {
    slug: "plum-yuzu",
    title: "เหล้าบ๊วย / ยูซุ",
    englishTitle: "Plum / Yuzu",
    badge: "Fruit Liqueur",
    image: "/images/categories/ume.webp",
    description: "เหล้าผลไม้ที่ทำจากบ๊วยหรือส้มยูซุ ให้รสหวานอมเปรี้ยว กลิ่นหอมสดชื่น เหมาะสำหรับดื่มง่ายหรือเสิร์ฟแบบเย็น",
    matchNames: ["เหล้าบ๊วย / ยูซุ", "เหล้าบ๊วย", "ยูซุ", "plum", "yuzu"],
    matchSlugs: ["plum-yuzu", "plum", "yuzu"]
  },
  {
    slug: "brandy",
    title: "แบรนดี้",
    englishTitle: "Brandy",
    badge: "Brandy Selection",
    image: "/images/categories/brandy.jpg",
    description: "สุราที่กลั่นจากไวน์หรือผลไม้และผ่านการบ่มในถังไม้ ให้รสเข้มลึก กลิ่นผลไม้แห้งและวานิลลา นิยมดื่มหลังอาหาร",
    matchNames: ["แบรนดี้", "brandy"],
    matchSlugs: ["brandy"]
  },
  {
    slug: "grappa",
    title: "แกรปป้า",
    englishTitle: "Grappa",
    badge: "Grappa Selection",
    image: "/images/categories/grappa.jpg",
    description: "สุราจากอิตาลีที่กลั่นจากกากองุ่น (pomace) ให้รสเข้มและกลิ่นเฉพาะตัว มักดื่มเป็น digestif หลังอาหาร",
    matchNames: ["แกรปป้า", "grappa"],
    matchSlugs: ["grappa"]
  },
  {
    slug: "aquavit",
    title: "อควาวิท",
    englishTitle: "Aquavit",
    badge: "Aquavit Selection",
    image: "/images/categories/aquavit.jpg",
    description: "สุราจากแถบสแกนดิเนเวีย ปรุงแต่งด้วยสมุนไพรโดยเฉพาะเมล็ดยี่หร่า (caraway) ให้กลิ่นเครื่องเทศโดดเด่น",
    matchNames: ["อควาวิท", "aquavit"],
    matchSlugs: ["aquavit"]
  },
  {
    slug: "cachaca",
    title: "คาชาซ่า",
    englishTitle: "Cachaca",
    badge: "Cachaca Selection",
    image: "/images/categories/cachaca.jpg",
    description: "สุราประจำชาติบราซิลที่ผลิตจากน้ำอ้อยสด ให้รสสดชื่นและมีกลิ่นพืชอ้อย นิยมใช้ในค็อกเทล Caipirinha",
    matchNames: ["คาชาซ่า", "cachaca"],
    matchSlugs: ["cachaca"]
  },
  {
    slug: "absinthe",
    title: "แอ๊บซินท์",
    englishTitle: "Absinthe",
    badge: "Absinthe Selection",
    image: "/images/categories/absinthe.webp",
    description: "สุราที่มีส่วนผสมของสมุนไพร เช่น วอร์มวูด ให้กลิ่นหอมเข้มและรสขมเล็กน้อย มักเสิร์ฟแบบเจือจางด้วยน้ำ",
    matchNames: ["แอ๊บซินท์", "absinthe"],
    matchSlugs: ["absinthe"]
  },
  {
    slug: "ouzo",
    title: "อูโซ",
    englishTitle: "Ouzo",
    badge: "Ouzo Selection",
    image: "/images/categories/aquavit.jpg",
    description: "สุรากลิ่นอโรมาติกรสเฉพาะตัวจากแถบเมดิเตอร์เรเนียน มีกลิ่นสมุนไพรและเครื่องเทศ นิยมดื่มแบบเจือจางหรือเสิร์ฟเย็น",
    matchNames: ["อูโซ", "ouzo"],
    matchSlugs: ["ouzo"]
  },
  {
    slug: "cocktail-ready-to-drink",
    title: "ค็อกเทลพร้อมดื่ม",
    englishTitle: "Cocktail Ready to Drink",
    badge: "Ready to Drink",
    image: "/images/categories/cocktail.webp",
    description: "เครื่องดื่มผสมสำเร็จรูป (Ready-to-Drink) ที่พร้อมดื่มทันที มีรสชาติหลากหลาย สะดวกและเหมาะสำหรับทุกโอกาส",
    matchNames: ["ค็อกเทลพร้อมดื่ม", "cocktail ready to drink", "ready to drink"],
    matchSlugs: ["cocktail-ready-to-drink", "ready-to-drink"]
  }
] as const;

type LiqueurTypePageProps = {
  params: {
    slug: string;
  };
};

export default async function LiqueurTypePage({ params }: LiqueurTypePageProps) {
  const currentPage = liqueurTypePages.find((item) => item.slug === params.slug);

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
        { label: "ลิเคียวร์", href: "/liqueur" },
        { label: currentPage.title }
      ]}
    />
  );
}
