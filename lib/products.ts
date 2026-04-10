import { notFound } from "next/navigation";

import { db } from "@/lib/db";

type QueryRow = Record<string, unknown>;

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  categoryName: string | null;
  brandName: string | null;
  bottleSizeMl: number | null;
  alcoholPercent: number | null;
  inStock: boolean;
  promotionType: string | null;
  activeDiscountPercent: number | null;
  discountedPrice: number | null;
};

export type ProductSection = {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
};

export type ProductSpec = {
  id: string;
  key: string;
  label: string;
  value: string;
  sortOrder: number;
};

export type ProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isMain: boolean;
};

export type ProductAward = {
  id: string;
  title: string;
  year: number | null;
  organization: string | null;
  sortOrder: number;
};

export type ProductRecipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  instructions: string | null;
  items: string[];
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  price: number;
  currency: string;
  stockQty: number;
  inStock: boolean;
  sku: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  ratingAvg: number | null;
  reviewCount: number;
  bottleSizeMl: number | null;
  alcoholPercent: number | null;
  promotionType: string | null;
  activeDiscountPercent: number | null;
  discountedPrice: number | null;
  categoryName: string | null;
  brandName: string | null;
  countryName: string | null;
  regionName: string | null;
  productTypeName: string | null;
  images: ProductImage[];
  specs: ProductSpec[];
  sections: ProductSection[];
  awards: ProductAward[];
  recipes: ProductRecipe[];
};

export type CategoryLink = {
  id: string;
  name: string;
  slug: string;
};

export type OptionItem = {
  id: string;
  name: string;
  slug?: string;
};

export type ProductFormOptions = {
  brands: OptionItem[];
  categories: OptionItem[];
  countries: OptionItem[];
  productTypes: OptionItem[];
  regions: OptionItem[];
  whiskySubcategories: OptionItem[];
  promotionTypes: OptionItem[];
  recommendedCategories: OptionItem[];
};

export type AdminProductListItem = ProductCard & {
  createdAt: string | null;
  stockQty: number;
  sku: string | null;
};

export type EditableProduct = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  sku: string;
  mainCategoryName: string;
  brandName: string;
  categoryName: string;
  subcategoryName: string;
  productTypeName: string;
  promotionType: string;
  recommendedCategory: string;
  countryName: string;
  regionName: string;
  price: string;
  stockQty: string;
  bottleSizeMl: string;
  alcoholPercent: string;
  shortDescription: string;
  fullDescription: string;
  inStock: boolean;
  isFeatured: boolean;
  imageUrls: string[];
};

const defaultWhiskySubcategories: OptionItem[] = [
  { id: "single-malt-whisky", name: "ซิงเกิลมอลต์ วิสกี้", slug: "single-malt-whisky" },
  { id: "scotch-whisky", name: "สกอตช์ วิสกี้", slug: "scotch-whisky" },
  { id: "american-whisky", name: "อเมริกัน วิสกี้", slug: "american-whisky" },
  { id: "irish-whisky", name: "ไอริช วิสกี้", slug: "irish-whisky" },
  { id: "japanese-whisky", name: "เจแปนนีส วิสกี้", slug: "japanese-whisky" }
];

const defaultPromotionTypes: OptionItem[] = [
  { id: "discount", name: "DISCOUNT", slug: "discount" },
  { id: "buy-1-get-1", name: "BUY 1 GET 1", slug: "buy-1-get-1" },
  { id: "buy-more-save-more", name: "BUY MORE SAVE MORE", slug: "buy-more-save-more" },
  { id: "flash-sale", name: "FLASH SALE", slug: "flash-sale" }
];

export const recommendedCategoryPages = [
  {
    slug: "best-sellers",
    name: "สินค้าขายดี",
    title: "สินค้าขายดี",
    description: "รวมสินค้าที่ลูกค้าเลือกซื้ออย่างต่อเนื่อง เหมาะสำหรับเริ่มต้นค้นหาสินค้ายอดนิยมของร้าน"
  },
  {
    slug: "new-arrivals",
    name: "สินค้าเข้าใหม่",
    title: "สินค้าเข้าใหม่",
    description: "อัปเดตสินค้าล่าสุดที่เพิ่งเข้าสู่ระบบ เหมาะสำหรับการค้นหาตัวเลือกใหม่และคอลเลกชันที่เพิ่งเปิดตัว"
  },
  {
    slug: "monthly-picks",
    name: "คัดสรรประจำเดือน",
    title: "คัดสรรประจำเดือน",
    description: "คัดเลือกสินค้าที่น่าสนใจประจำเดือน เพื่อช่วยให้ลูกค้าเจอตัวเลือกที่เหมาะกับโอกาสพิเศษได้ง่ายขึ้น"
  },
  {
    slug: "premium-selection",
    name: "พรีเมียมคัดสรร",
    title: "พรีเมียมคัดสรร",
    description: "รวมสินค้ากลุ่มพรีเมียมที่เน้นคุณภาพ ความโดดเด่น และภาพลักษณ์ที่เหมาะกับการเลือกสรรเป็นพิเศษ"
  },
  {
    slug: "gift-selection",
    name: "ชุดของขวัญ",
    title: "ชุดของขวัญ",
    description: "คัดสรรสินค้าที่เหมาะสำหรับมอบเป็นของขวัญ ช่วยให้เลือกได้ง่ายและดูพรีเมียมในทุกโอกาส"
  }
] as const;

const defaultRecommendedCategories: OptionItem[] = recommendedCategoryPages.map((item) => ({
  id: item.slug,
  name: item.name,
  slug: item.slug
}));

export const whiskySubcategoryPages = [
  {
    slug: "single-malt-whisky",
    name: "ซิงเกิลมอลต์ วิสกี้",
    description: "รวมวิสกี้ที่ผลิตจากโรงกลั่นเดียวโดยใช้มอลต์เป็นวัตถุดิบหลัก ให้รสชาติซับซ้อนและสะท้อนเอกลักษณ์เฉพาะของแต่ละโรงกลั่นอย่างชัดเจน"
  },
  {
    slug: "scotch-whisky",
    name: "สกอตช์ วิสกี้",
    description: "วิสกี้ที่ผลิตในสกอตแลนด์และผ่านการบ่มตามมาตรฐานของภูมิภาค มีสไตล์รสชาติหลากหลายตั้งแต่โทนเบา สดชื่น ไปจนถึงควันเข้มและซับซ้อน"
  },
  {
    slug: "american-whisky",
    name: "อเมริกัน วิสกี้",
    description: "วิสกี้จากสหรัฐอเมริกา เช่น Bourbon และ Tennessee ที่มักมีโทนหวานนุ่มจากข้าวโพด พร้อมกลิ่นวานิลลา คาราเมล และไม้จากการบ่ม"
  },
  {
    slug: "irish-whisky",
    name: "ไอริช วิสกี้",
    description: "วิสกี้จากไอร์แลนด์ที่มักให้สัมผัสนุ่ม ดื่มง่าย และมีกลิ่นผลไม้หรือธัญพืชแบบเบา เหมาะกับผู้ที่ชอบสไตล์กลมกล่อม"
  },
  {
    slug: "japanese-whisky",
    name: "เจแปนนีส วิสกี้",
    description: "วิสกี้จากญี่ปุ่นที่เน้นความสมดุล ความละเอียดอ่อน และรสชาติที่กลมกล่อม เหมาะกับผู้ที่ชอบโทนหอมสุภาพและดื่มง่าย"
  }
] as const;

export const whiskyRegionPages = [
  {
    slug: "speyside",
    name: "เขต Speyside",
    description: "แหล่งผลิตวิสกี้สำคัญของสกอตแลนด์ที่โดดเด่นด้วยกลิ่นผลไม้ โทนหวานนุ่ม และความสมดุล เหมาะสำหรับผู้ที่ชอบสไตล์ดื่มง่าย"
  },
  {
    slug: "highland",
    name: "เขต Highland",
    description: "ภูมิภาคขนาดใหญ่ของสกอตแลนด์ที่ให้วิสกี้หลากหลายสไตล์ ตั้งแต่โทนเบา สดชื่น ไปจนถึงเข้มข้นและซับซ้อนตามพื้นที่ย่อย"
  },
  {
    slug: "lowland",
    name: "เขต Lowland",
    description: "วิสกี้จาก Lowland มักมีบุคลิกเบา นุ่ม และมีกลิ่นหอมแบบดอกไม้หรือหญ้า เหมาะสำหรับผู้เริ่มต้นหรือผู้ที่ชอบสไตล์ดื่มง่าย"
  },
  {
    slug: "islay",
    name: "เขต Islay",
    description: "ขึ้นชื่อเรื่องวิสกี้กลิ่นควันพีทเข้มและกลิ่นทะเล ให้รสชาติชัดเจนและโดดเด่น เป็นเอกลักษณ์ของภูมิภาคนี้อย่างแท้จริง"
  },
  {
    slug: "island",
    name: "เขต Island",
    description: "กลุ่มเกาะรอบสกอตแลนด์ที่ให้วิสกี้หลายสไตล์ มักมีกลิ่นทะเล เครื่องเทศ หรือควันอ่อนๆ แตกต่างกันไปตามแต่ละเกาะ"
  }
] as const;

function isMissingCatalogSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }

  return 0;
}

function mapCard(row: QueryRow): ProductCard {
  const price = toNumber(row.price);
  const activeDiscountPercent = row.active_discount_percent ? Number(row.active_discount_percent) : null;

  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    price,
    currency: row.currency ? String(row.currency) : "THB",
    imageUrl: row.image_url ? String(row.image_url) : null,
    categoryName: row.category_name ? String(row.category_name) : null,
    brandName: row.brand_name ? String(row.brand_name) : null,
    bottleSizeMl: row.bottle_size_ml ? Number(row.bottle_size_ml) : null,
    alcoholPercent: row.alcohol_percent ? Number(row.alcohol_percent) : null,
    inStock: Boolean(row.in_stock),
    promotionType: row.promotion_type ? String(row.promotion_type) : null,
    activeDiscountPercent,
    discountedPrice: activeDiscountPercent != null ? Math.max(0, price - price * (activeDiscountPercent / 100)) : null
  };
}

export async function getWhiskyCategoryLinks() {
  try {
    const [stylesResult, regionsResult] = await Promise.all([
      db.query(
        `
          select id, name, slug
          from public.categories
          where parent_id in (
            select id
            from public.categories
            where slug like 'whisky%'
               or lower(name) in ('whisky', 'วิสกี้')
          )
          order by name asc
        `
      ),
      db.query(
        `
          select r.id, r.name, r.slug
          from public.regions r
          join public.countries c on c.id = r.country_id
          where c.name = 'Scotland'
          order by r.name asc
        `
      )
    ]);

    return {
      styles: stylesResult.rows.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        slug: String(row.slug)
      })),
      regions: regionsResult.rows.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        slug: String(row.slug)
      }))
    };
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return { styles: [], regions: [] };
    }

    throw error;
  }
}

export async function getWhiskyProducts(limit = 12) {
  try {
    const result = await db.query(
      `
        select
          p.id,
          p.name,
          p.slug,
          p.subtitle,
          p.sku,
          p.price,
          p.currency,
          p.bottle_size_ml,
          p.alcohol_percent,
          p.in_stock,
          p.promotion_type,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = p.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent,
          c.name as category_name,
          b.name as brand_name,
          (
            select pi.image_url
            from public.product_images pi
            where pi.product_id = p.id
            order by pi.is_main desc, pi.sort_order asc
            limit 1
          ) as image_url
        from public.products p
        left join public.categories c on c.id = p.category_id
        left join public.categories parent_category on parent_category.id = c.parent_id
        left join public.brands b on b.id = p.brand_id
        where p.is_active = true
          and (
            c.slug like 'whisky%'
            or parent_category.slug like 'whisky%'
            or lower(c.name) in ('whisky', 'วิสกี้')
            or lower(parent_category.name) in ('whisky', 'วิสกี้')
          )
        order by p.is_featured desc, p.created_at desc
        limit $1
      `,
      [limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function getWhiskyProductsBySubcategory(subcategoryName: string, limit = 24) {
  try {
    const result = await db.query(
      `
        select
          p.id,
          p.name,
          p.slug,
          p.subtitle,
          p.price,
          p.currency,
          p.bottle_size_ml,
          p.alcohol_percent,
          p.in_stock,
          p.promotion_type,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = p.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent,
          c.name as category_name,
          b.name as brand_name,
          (
            select pi.image_url
            from public.product_images pi
            where pi.product_id = p.id
            order by pi.is_main desc, pi.sort_order asc
            limit 1
          ) as image_url
        from public.products p
        left join public.categories c on c.id = p.category_id
        left join public.categories parent_category on parent_category.id = c.parent_id
        left join public.brands b on b.id = p.brand_id
        where p.is_active = true
          and lower(c.name) = lower($1)
          and (
            lower(parent_category.name) in ('whisky', 'วิสกี้')
            or parent_category.slug like 'whisky%'
          )
        order by p.is_featured desc, p.created_at desc
        limit $2
      `,
      [subcategoryName, limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function getWhiskyProductsByRegion(regionName: string, limit = 24) {
  try {
    const result = await db.query(
      `
        select
          p.id,
          p.name,
          p.slug,
          p.subtitle,
          p.price,
          p.currency,
          p.bottle_size_ml,
          p.alcohol_percent,
          p.in_stock,
          p.promotion_type,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = p.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent,
          c.name as category_name,
          b.name as brand_name,
          (
            select pi.image_url
            from public.product_images pi
            where pi.product_id = p.id
            order by pi.is_main desc, pi.sort_order asc
            limit 1
          ) as image_url
        from public.products p
        left join public.categories c on c.id = p.category_id
        left join public.categories parent_category on parent_category.id = c.parent_id
        left join public.brands b on b.id = p.brand_id
        left join public.regions r on r.id = p.region_id
        where p.is_active = true
          and lower(r.name) = lower($1)
          and (
            c.slug like 'whisky%'
            or parent_category.slug like 'whisky%'
            or lower(c.name) in ('whisky', 'วิสกี้')
            or lower(parent_category.name) in ('whisky', 'วิสกี้')
          )
        order by p.is_featured desc, p.created_at desc
        limit $2
      `,
      [regionName, limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function getProductsByCategory(categoryNames: string[], categorySlugs: string[], limit = 24) {
  try {
    const normalizedNames = categoryNames.map((item) => item.trim().toLowerCase()).filter(Boolean);
    const normalizedSlugs = categorySlugs.map((item) => item.trim().toLowerCase()).filter(Boolean);

    const result = await db.query(
      `
        select
          p.id,
          p.name,
          p.slug,
          p.subtitle,
          p.price,
          p.currency,
          p.bottle_size_ml,
          p.alcohol_percent,
          p.in_stock,
          p.promotion_type,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = p.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent,
          c.name as category_name,
          b.name as brand_name,
          (
            select pi.image_url
            from public.product_images pi
            where pi.product_id = p.id
            order by pi.is_main desc, pi.sort_order asc
            limit 1
          ) as image_url
        from public.products p
        left join public.categories c on c.id = p.category_id
        left join public.categories parent_category on parent_category.id = c.parent_id
        left join public.brands b on b.id = p.brand_id
        where p.is_active = true
          and (
            lower(c.name) = any($1)
            or lower(parent_category.name) = any($1)
            or lower(c.slug) = any($2)
            or lower(parent_category.slug) = any($2)
          )
        order by p.is_featured desc, p.created_at desc
        limit $3
      `,
      [normalizedNames, normalizedSlugs, limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    console.error("Failed to load category products", error);
    return [];
  }
}

export async function getProductsByCategoryOrType(matchNames: string[], matchSlugs: string[], limit = 24) {
  try {
    const normalizedNames = matchNames.map((item) => item.trim().toLowerCase()).filter(Boolean);
    const normalizedSlugs = matchSlugs.map((item) => item.trim().toLowerCase()).filter(Boolean);

    const result = await db.query(
      `
        select
          p.id,
          p.name,
          p.slug,
          p.subtitle,
          p.price,
          p.currency,
          p.bottle_size_ml,
          p.alcohol_percent,
          p.in_stock,
          p.promotion_type,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = p.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent,
          c.name as category_name,
          b.name as brand_name,
          (
            select pi.image_url
            from public.product_images pi
            where pi.product_id = p.id
            order by pi.is_main desc, pi.sort_order asc
            limit 1
          ) as image_url
        from public.products p
        left join public.categories c on c.id = p.category_id
        left join public.categories parent_category on parent_category.id = c.parent_id
        left join public.product_types pt on pt.id = p.product_type_id
        left join public.brands b on b.id = p.brand_id
        where p.is_active = true
          and (
            lower(c.name) = any($1)
            or lower(parent_category.name) = any($1)
            or lower(coalesce(pt.name, '')) = any($1)
            or lower(c.slug) = any($2)
            or lower(coalesce(pt.slug, '')) = any($2)
            or lower(parent_category.slug) = any($2)
          )
        order by p.is_featured desc, p.created_at desc
        limit $3
      `,
      [normalizedNames, normalizedSlugs, limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    console.error("Failed to load category/type products", error);
    return [];
  }
}

export async function getLatestProducts(limit = 8) {
  const baseQuery = `
    select
      p.id,
      p.name,
      p.slug,
      p.subtitle,
      p.price,
      p.currency,
      p.bottle_size_ml,
      p.alcohol_percent,
      p.in_stock,
      c.name as category_name,
      b.name as brand_name,
      (
        select pi.image_url
        from public.product_images pi
        where pi.product_id = p.id
        order by pi.is_main desc, pi.sort_order asc
        limit 1
      ) as image_url
    from public.products p
    left join public.categories c on c.id = p.category_id
    left join public.brands b on b.id = p.brand_id
    where p.is_active = true
    order by p.is_featured desc, p.created_at desc
    limit $1
  `;

  try {
    const result = await db.query(
      `
        select latest_products.*,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = latest_products.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent
        from (${baseQuery}) latest_products
      `,
      [limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && ["42P01", "42703"].includes((error as { code?: string }).code ?? "")) {
      const fallbackResult = await db.query(baseQuery, [limit]);
      return fallbackResult.rows.map(mapCard);
    }

    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function searchProductsByName(searchTerm: string, limit = 24) {
  const keyword = searchTerm.trim();

  if (!keyword) {
    return [];
  }

  const baseQuery = `
    select
      p.id,
      p.name,
      p.slug,
      p.subtitle,
      p.price,
      p.currency,
      p.bottle_size_ml,
      p.alcohol_percent,
      p.in_stock,
      c.name as category_name,
      b.name as brand_name,
      (
        select pi.image_url
        from public.product_images pi
        where pi.product_id = p.id
        order by pi.is_main desc, pi.sort_order asc
        limit 1
      ) as image_url
    from public.products p
    left join public.categories c on c.id = p.category_id
    left join public.brands b on b.id = p.brand_id
    where p.is_active = true
      and lower(p.name) like $1
    order by p.is_featured desc, p.created_at desc
    limit $2
  `;

  try {
    const result = await db.query(
      `
        select searched_products.*,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = searched_products.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent
        from (${baseQuery}) searched_products
      `,
      [`%${keyword.toLowerCase()}%`, limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && ["42P01", "42703"].includes((error as { code?: string }).code ?? "")) {
      const fallbackResult = await db.query(baseQuery, [`%${keyword.toLowerCase()}%`, limit]);
      return fallbackResult.rows.map(mapCard);
    }

    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function getProductsByRecommendedCategory(recommendedCategory: string, limit = 24) {
  const baseQuery = `
    select
      p.id,
      p.name,
      p.slug,
      p.subtitle,
      p.price,
      p.currency,
      p.bottle_size_ml,
      p.alcohol_percent,
      p.in_stock,
      p.promotion_type,
      c.name as category_name,
      b.name as brand_name,
      (
        select pi.image_url
        from public.product_images pi
        where pi.product_id = p.id
        order by pi.is_main desc, pi.sort_order asc
        limit 1
      ) as image_url
    from public.products p
    left join public.categories c on c.id = p.category_id
    left join public.brands b on b.id = p.brand_id
    where p.is_active = true
      and p.recommended_category = $1
    order by p.is_featured desc, p.created_at desc
    limit $2
  `;

  try {
    const result = await db.query(
      `
        select recommended_products.*,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = recommended_products.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent
        from (${baseQuery}) recommended_products
      `,
      [recommendedCategory, limit]
    );

    return result.rows.map(mapCard);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && ["42P01", "42703"].includes((error as { code?: string }).code ?? "")) {
      const fallbackResult = await db.query(baseQuery, [recommendedCategory, limit]);
      return fallbackResult.rows.map(mapCard);
    }

    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function getAdminProducts(limit = 50): Promise<AdminProductListItem[]> {
  const baseQuery = `
    select
      p.id,
      p.name,
      p.slug,
      p.subtitle,
      p.sku,
      p.price,
      p.currency,
      p.bottle_size_ml,
      p.alcohol_percent,
      p.stock_qty,
      p.in_stock,
      p.created_at,
      c.name as category_name,
      b.name as brand_name,
      (
        select pi.image_url
        from public.product_images pi
        where pi.product_id = p.id
        order by pi.is_main desc, pi.sort_order asc
        limit 1
      ) as image_url
    from public.products p
    left join public.categories c on c.id = p.category_id
    left join public.brands b on b.id = p.brand_id
    order by p.created_at desc
    limit $1
  `;

  try {
    const result = await db.query(
      `
        select admin_products.*,
          (
            select pr.discount_percent
            from public.promotions pr
            where pr.product_id = admin_products.id
              and pr.is_active = true
              and upper(pr.promotion_type) = 'DISCOUNT'
              and (pr.start_at is null or pr.start_at <= now())
              and (pr.end_at is null or pr.end_at >= now())
            order by pr.sort_order asc, pr.created_at desc
            limit 1
          ) as active_discount_percent
        from (${baseQuery}) admin_products
      `,
      [limit]
    );

    return result.rows.map((row) => ({
      ...mapCard(row),
      createdAt: row.created_at ? String(row.created_at) : null,
      stockQty: Number(row.stock_qty ?? 0),
      sku: row.sku ? String(row.sku) : null
    }));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && ["42P01", "42703"].includes((error as { code?: string }).code ?? "")) {
      const fallbackResult = await db.query(baseQuery, [limit]);
      return fallbackResult.rows.map((row) => ({
        ...mapCard(row),
        createdAt: row.created_at ? String(row.created_at) : null,
        stockQty: Number(row.stock_qty ?? 0),
        sku: row.sku ? String(row.sku) : null
      }));
    }

    if (isMissingCatalogSchema(error)) {
      return [];
    }

    throw error;
  }
}

export async function getEditableProductById(id: string): Promise<EditableProduct | null> {
  try {
    const result = await db.query(
      `
        select
          p.id,
          p.name,
          p.slug,
          p.subtitle,
          p.sku,
          p.price,
          p.stock_qty,
          p.bottle_size_ml,
          p.alcohol_percent,
          p.short_description,
          p.full_description,
          p.promotion_type,
          p.recommended_category,
          p.in_stock,
          p.is_featured,
          b.name as brand_name,
          c.name as category_name,
          parent_category.name as parent_category_name,
          pt.name as product_type_name,
          co.name as country_name,
          r.name as region_name
        from public.products p
        left join public.brands b on b.id = p.brand_id
        left join public.categories c on c.id = p.category_id
        left join public.categories parent_category on parent_category.id = c.parent_id
        left join public.product_types pt on pt.id = p.product_type_id
        left join public.countries co on co.id = p.country_id
        left join public.regions r on r.id = p.region_id
        where p.id = $1
        limit 1
      `,
      [id]
    );

    if (!result.rowCount) {
      return null;
    }

    const imagesResult = await db.query(
      `
        select image_url
        from public.product_images
        where product_id = $1
        order by is_main desc, sort_order asc
      `,
      [id]
    );

    const row = result.rows[0];

    return {
      id: String(row.id),
      name: String(row.name ?? ""),
      slug: String(row.slug ?? ""),
      subtitle: String(row.subtitle ?? ""),
      sku: String(row.sku ?? ""),
      mainCategoryName: String(row.parent_category_name ?? row.category_name ?? ""),
      brandName: String(row.brand_name ?? ""),
      categoryName: String(row.category_name ?? ""),
      subcategoryName: row.parent_category_name ? String(row.category_name ?? "") : "",
      productTypeName: String(row.product_type_name ?? ""),
      promotionType: String(row.promotion_type ?? ""),
      recommendedCategory: String(row.recommended_category ?? ""),
      countryName: String(row.country_name ?? ""),
      regionName: String(row.region_name ?? ""),
      price: row.price != null ? String(row.price) : "",
      stockQty: row.stock_qty != null ? String(row.stock_qty) : "",
      bottleSizeMl: row.bottle_size_ml != null ? String(row.bottle_size_ml) : "",
      alcoholPercent: row.alcohol_percent != null ? String(row.alcohol_percent) : "",
      shortDescription: String(row.short_description ?? ""),
      fullDescription: String(row.full_description ?? ""),
      inStock: Boolean(row.in_stock),
      isFeatured: Boolean(row.is_featured),
      imageUrls: imagesResult.rows.map((imageRow) => String(imageRow.image_url))
    };
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return null;
    }

    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    let productResult;

    try {
      productResult = await db.query(
        `
          select
            p.id,
            p.name,
            p.slug,
            p.subtitle,
            p.price,
            p.currency,
            p.stock_qty,
            p.in_stock,
            p.sku,
            p.short_description,
            p.full_description,
            p.rating_avg,
            p.review_count,
            p.bottle_size_ml,
            p.alcohol_percent,
            p.promotion_type,
            (
              select pr.discount_percent
              from public.promotions pr
              where pr.product_id = p.id
                and pr.is_active = true
                and upper(pr.promotion_type) = 'DISCOUNT'
                and (pr.start_at is null or pr.start_at <= now())
                and (pr.end_at is null or pr.end_at >= now())
              order by pr.sort_order asc, pr.created_at desc
              limit 1
            ) as active_discount_percent,
            c.name as category_name,
            b.name as brand_name,
            co.name as country_name,
            r.name as region_name,
            pt.name as product_type_name
          from public.products p
          left join public.categories c on c.id = p.category_id
          left join public.brands b on b.id = p.brand_id
          left join public.countries co on co.id = p.country_id
          left join public.regions r on r.id = p.region_id
          left join public.product_types pt on pt.id = p.product_type_id
          where p.slug = $1
            and p.is_active = true
          limit 1
        `,
        [slug]
      );
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && ["42P01", "42703"].includes((error as { code?: string }).code ?? "")) {
        productResult = await db.query(
          `
            select
              p.id,
              p.name,
              p.slug,
              p.subtitle,
              p.price,
              p.currency,
              p.stock_qty,
              p.in_stock,
              p.sku,
              p.short_description,
              p.full_description,
              p.rating_avg,
              p.review_count,
              p.bottle_size_ml,
              p.alcohol_percent,
              p.promotion_type,
              null::numeric as active_discount_percent,
              c.name as category_name,
              b.name as brand_name,
              co.name as country_name,
              r.name as region_name,
              pt.name as product_type_name
            from public.products p
            left join public.categories c on c.id = p.category_id
            left join public.brands b on b.id = p.brand_id
            left join public.countries co on co.id = p.country_id
            left join public.regions r on r.id = p.region_id
            left join public.product_types pt on pt.id = p.product_type_id
            where p.slug = $1
              and p.is_active = true
            limit 1
          `,
          [slug]
        );
      } else {
        throw error;
      }
    }

    if (!productResult.rowCount) {
      return null;
    }

    const product = productResult.rows[0];
    const productId = String(product.id);
    const activeDiscountPercent = product.active_discount_percent ? Number(product.active_discount_percent) : null;

    const [imagesResult, specsResult, sectionsResult, awardsResult, recipesResult, recipeItemsResult] = await Promise.all([
      db.query(
        `
          select id, image_url, alt_text, sort_order, is_main
          from public.product_images
          where product_id = $1
          order by is_main desc, sort_order asc
        `,
        [productId]
      ),
      db.query(
        `
          select id, spec_key, spec_label, spec_value, sort_order
          from public.product_specs
          where product_id = $1
          order by sort_order asc
        `,
        [productId]
      ),
      db.query(
        `
          select id, title, content, sort_order
          from public.product_content_sections
          where product_id = $1
          order by sort_order asc
        `,
        [productId]
      ),
      db.query(
        `
          select id, award_title, award_year, award_org, sort_order
          from public.product_awards
          where product_id = $1
          order by sort_order asc
        `,
        [productId]
      ),
      db.query(
        `
          select id, title, image_url, instructions, sort_order
          from public.product_recipes
          where product_id = $1
          order by sort_order asc
        `,
        [productId]
      ),
      db.query(
        `
          select recipe_id, item_text, sort_order
          from public.product_recipe_items
          where recipe_id in (
            select id from public.product_recipes where product_id = $1
          )
          order by sort_order asc
        `,
        [productId]
      )
    ]);

    const recipeItemsMap = new Map<string, string[]>();

    for (const row of recipeItemsResult.rows) {
      const key = String(row.recipe_id);
      const items = recipeItemsMap.get(key) ?? [];
      items.push(String(row.item_text));
      recipeItemsMap.set(key, items);
    }

    return {
      id: productId,
      name: String(product.name),
      slug: String(product.slug),
      subtitle: product.subtitle ? String(product.subtitle) : null,
      price: toNumber(product.price),
      currency: product.currency ? String(product.currency) : "THB",
      stockQty: Number(product.stock_qty ?? 0),
      inStock: Boolean(product.in_stock),
      sku: product.sku ? String(product.sku) : null,
      shortDescription: product.short_description ? String(product.short_description) : null,
      fullDescription: product.full_description ? String(product.full_description) : null,
      ratingAvg: product.rating_avg ? Number(product.rating_avg) : null,
      reviewCount: Number(product.review_count ?? 0),
      bottleSizeMl: product.bottle_size_ml ? Number(product.bottle_size_ml) : null,
      alcoholPercent: product.alcohol_percent ? Number(product.alcohol_percent) : null,
      promotionType: product.promotion_type ? String(product.promotion_type) : null,
      activeDiscountPercent,
      discountedPrice:
        activeDiscountPercent != null
          ? Math.max(0, toNumber(product.price) - toNumber(product.price) * (activeDiscountPercent / 100))
          : null,
      categoryName: product.category_name ? String(product.category_name) : null,
      brandName: product.brand_name ? String(product.brand_name) : null,
      countryName: product.country_name ? String(product.country_name) : null,
      regionName: product.region_name ? String(product.region_name) : null,
      productTypeName: product.product_type_name ? String(product.product_type_name) : null,
      images: imagesResult.rows.map((row) => ({
        id: String(row.id),
        imageUrl: String(row.image_url),
        altText: row.alt_text ? String(row.alt_text) : null,
        sortOrder: Number(row.sort_order ?? 1),
        isMain: Boolean(row.is_main)
      })),
      specs: specsResult.rows.map((row) => ({
        id: String(row.id),
        key: String(row.spec_key),
        label: String(row.spec_label),
        value: String(row.spec_value),
        sortOrder: Number(row.sort_order ?? 1)
      })),
      sections: sectionsResult.rows.map((row) => ({
        id: String(row.id),
        title: String(row.title),
        content: String(row.content),
        sortOrder: Number(row.sort_order ?? 1)
      })),
      awards: awardsResult.rows.map((row) => ({
        id: String(row.id),
        title: String(row.award_title),
        year: row.award_year ? Number(row.award_year) : null,
        organization: row.award_org ? String(row.award_org) : null,
        sortOrder: Number(row.sort_order ?? 1)
      })),
      recipes: recipesResult.rows.map((row) => ({
        id: String(row.id),
        title: String(row.title),
        imageUrl: row.image_url ? String(row.image_url) : null,
        instructions: row.instructions ? String(row.instructions) : null,
        items: recipeItemsMap.get(String(row.id)) ?? []
      }))
    };
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return null;
    }

    throw error;
  }
}

export async function getRequiredProductBySlug(slug: string) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return product;
}

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  try {
    const [brandsResult, categoriesResult, countriesResult, productTypesResult, regionsResult, whiskySubcategoriesResult, promotionTypesResult] = await Promise.all([
      db.query(`select id, name, slug from public.brands order by name asc`),
      db.query(`select id, name, slug from public.categories where parent_id is null order by name asc`),
      db.query(`select id, name from public.countries order by name asc`),
      db.query(`select id, name, slug from public.product_types order by name asc`),
      db.query(`select id, name, slug from public.regions order by name asc`),
      db.query(`
        select id, name, slug
        from public.categories
        where parent_id in (
          select id from public.categories where slug like 'whisky%' or lower(name) in ('whisky', 'วิสกี้')
        )
        order by name asc
      `),
      db.query(`
        select distinct promotion_type
        from public.products
        where promotion_type is not null
          and trim(promotion_type) <> ''
        order by promotion_type asc
      `)
    ]);

    return {
      brands: brandsResult.rows.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug) })),
      categories: categoriesResult.rows.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug) })),
      countries: countriesResult.rows.map((row) => ({ id: String(row.id), name: String(row.name) })),
      productTypes: productTypesResult.rows.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug) })),
      regions: regionsResult.rows.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug) })),
      whiskySubcategories: whiskySubcategoriesResult.rows.length
        ? whiskySubcategoriesResult.rows.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug) }))
        : defaultWhiskySubcategories,
      promotionTypes: promotionTypesResult.rows.length
        ? promotionTypesResult.rows.map((row, index) => ({ id: `promotion-${index}`, name: String(row.promotion_type) }))
        : defaultPromotionTypes,
      recommendedCategories: defaultRecommendedCategories
    };
  } catch (error) {
    if (isMissingCatalogSchema(error)) {
      return {
        brands: [],
        categories: [],
        countries: [],
        productTypes: [],
        regions: [],
        whiskySubcategories: defaultWhiskySubcategories,
        promotionTypes: defaultPromotionTypes,
        recommendedCategories: defaultRecommendedCategories
      };
    }

    throw error;
  }
}
