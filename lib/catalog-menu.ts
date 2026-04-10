export type CatalogMenuLink = {
  label: string;
  href: string;
};

export type CatalogMenuOption = {
  id: string;
  name: string;
  slug?: string;
};

type CatalogAliasOption = {
  option: CatalogMenuOption;
  aliases: string[];
};

type CatalogMenuGroup = {
  category: CatalogAliasOption;
  items: CatalogAliasOption[];
};

function normalizeMenuValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildAliasOption(option: CatalogMenuOption, aliases: string[]) {
  return {
    option,
    aliases: Array.from(new Set([option.name, option.slug ?? "", ...aliases])).map(normalizeMenuValue).filter(Boolean)
  };
}

const whiskyCategoryItems = [
  buildAliasOption(
    { id: "single-malt-whisky", name: "ซิงเกิลมอลต์ วิสกี้", slug: "single-malt-whisky" },
    ["single malt whisky", "single malt whiskey"]
  ),
  buildAliasOption({ id: "scotch-whisky", name: "สกอตช์ วิสกี้", slug: "scotch-whisky" }, ["scotch whisky", "scotch whiskey"]),
  buildAliasOption(
    { id: "american-whisky", name: "อเมริกัน วิสกี้", slug: "american-whisky" },
    ["american whisky", "american whiskey"]
  ),
  buildAliasOption({ id: "irish-whisky", name: "ไอริช วิสกี้", slug: "irish-whisky" }, ["irish whisky", "irish whiskey"]),
  buildAliasOption(
    { id: "japanese-whisky", name: "เจแปนนีส วิสกี้", slug: "japanese-whisky" },
    ["japanese whisky", "japanese whiskey"]
  )
] as const;

const whiskyRegionItems = [
  buildAliasOption({ id: "speyside", name: "เขต Speyside", slug: "speyside" }, ["speyside"]),
  buildAliasOption({ id: "highland", name: "เขต Highland", slug: "highland" }, ["highland"]),
  buildAliasOption({ id: "lowland", name: "เขต Lowland", slug: "lowland" }, ["lowland"]),
  buildAliasOption({ id: "islay", name: "เขต Islay", slug: "islay" }, ["islay"]),
  buildAliasOption({ id: "island", name: "เขต Island", slug: "island" }, ["island"])
] as const;

const liqueurCategoryItems = [
  buildAliasOption({ id: "gin", name: "จิน", slug: "gin" }, []),
  buildAliasOption({ id: "rum", name: "รัม", slug: "rum" }, []),
  buildAliasOption({ id: "vodka", name: "วอดก้า", slug: "vodka" }, []),
  buildAliasOption({ id: "tequila", name: "เตกีล่า", slug: "tequila" }, []),
  buildAliasOption({ id: "sake-shochu", name: "สาเก / โซจู", slug: "sake-shochu" }, ["sake", "shochu", "soju"]),
  buildAliasOption({ id: "plum-yuzu", name: "เหล้าบ๊วย / ยูซุ", slug: "plum-yuzu" }, ["plum", "yuzu"]),
  buildAliasOption({ id: "brandy", name: "แบรนดี้", slug: "brandy" }, []),
  buildAliasOption({ id: "grappa", name: "แกรปป้า", slug: "grappa" }, []),
  buildAliasOption({ id: "aquavit", name: "อควาวิท", slug: "aquavit" }, []),
  buildAliasOption({ id: "cachaca", name: "คาชาซ่า", slug: "cachaca" }, []),
  buildAliasOption({ id: "absinthe", name: "แอ๊บซินท์", slug: "absinthe" }, []),
  buildAliasOption({ id: "ouzo", name: "อูโซ", slug: "ouzo" }, []),
  buildAliasOption(
    { id: "cocktail-ready-to-drink", name: "ค็อกเทลพร้อมดื่ม", slug: "cocktail-ready-to-drink" },
    ["cocktail ready to drink", "ready to drink", "cocktail (ready to drink)"]
  )
] as const;

const otherProductCategoryItems = [
  buildAliasOption({ id: "mineral-water", name: "น้ำแร่", slug: "mineral-water" }, ["mineral water"]),
  buildAliasOption({ id: "syrup", name: "ไซรัป (น้ำเชื่อม)", slug: "syrup" }, ["ไซรัป", "น้ำเชื่อม"]),
  buildAliasOption({ id: "bitters", name: "บิทเทอร์", slug: "bitters" }, ["bitter"]),
  buildAliasOption({ id: "cigar", name: "ซิการ์", slug: "cigar" }, ["cigars"])
] as const;

const productMenuGroups: CatalogMenuGroup[] = [
  {
    category: buildAliasOption({ id: "whisky", name: "วิสกี้", slug: "whisky" }, ["whiskey"]),
    items: [...whiskyCategoryItems]
  },
  {
    category: buildAliasOption({ id: "liqueur", name: "ลิเคียวร์", slug: "liqueur" }, ["liquor"]),
    items: [...liqueurCategoryItems]
  },
  {
    category: buildAliasOption({ id: "other-products", name: "สินค้าอื่นๆ", slug: "other-products" }, ["other products", "other product"]),
    items: [...otherProductCategoryItems]
  },
  {
    category: buildAliasOption({ id: "thai-spirits", name: "สุราไทย", slug: "thai-spirits" }, ["thai spirits", "thai spirit"]),
    items: []
  },
  {
    category: buildAliasOption({ id: "bar-tools", name: "อุปกรณ์บาร์", slug: "bar-tools" }, ["bar tools", "bar tool"]),
    items: []
  }
];

const nestedProductMenuItems: Record<string, CatalogAliasOption[]> = {
  "whisky:single-malt-whisky": [...whiskyRegionItems]
};

function findMenuGroup(value: string) {
  const normalized = normalizeMenuValue(value);
  return productMenuGroups.find((group) => group.category.aliases.includes(normalized));
}

function findSubcategoryOption(group: CatalogMenuGroup | undefined, value: string) {
  const normalized = normalizeMenuValue(value);
  return group?.items.find((item) => item.aliases.includes(normalized));
}

function buildNestedSubcategoryKey(mainCategoryValue: string, subcategoryValue: string) {
  const group = findMenuGroup(mainCategoryValue);
  const subcategory = findSubcategoryOption(group, subcategoryValue);

  if (!group || !subcategory) {
    return "";
  }

  return `${group.category.option.id}:${subcategory.option.id}`;
}

function findNestedSubcategoryOption(mainCategoryValue: string, subcategoryValue: string, value: string) {
  const normalized = normalizeMenuValue(value);
  const key = buildNestedSubcategoryKey(mainCategoryValue, subcategoryValue);

  return nestedProductMenuItems[key]?.find((item) => item.aliases.includes(normalized));
}

export const productLinks: CatalogMenuLink[] = [
  { label: "สินค้าอื่นๆ", href: "/other-products" },
  { label: "สุราไทย", href: "/thai-spirits" },
  { label: "อุปกรณ์บาร์", href: "/bar-tools" }
];

export const liqueurTypeLinks: CatalogMenuLink[] = [
  { label: "จิน", href: "/liqueur/type/gin" },
  { label: "รัม", href: "/liqueur/type/rum" },
  { label: "วอดก้า", href: "/liqueur/type/vodka" },
  { label: "เตกีล่า", href: "/liqueur/type/tequila" },
  { label: "สาเก / โซจู", href: "/liqueur/type/sake-shochu" }
];

export const liqueurOtherLinks: CatalogMenuLink[] = [
  { label: "เหล้าบ๊วย / ยูซุ", href: "/liqueur/type/plum-yuzu" },
  { label: "แบรนดี้", href: "/liqueur/type/brandy" },
  { label: "แกรปป้า", href: "/liqueur/type/grappa" },
  { label: "อควาวิท", href: "/liqueur/type/aquavit" },
  { label: "คาชาซ่า", href: "/liqueur/type/cachaca" },
  { label: "แอ๊บซินท์", href: "/liqueur/type/absinthe" },
  { label: "อูโซ", href: "/liqueur/type/ouzo" },
  { label: "COCKTAIL (READY TO DRINK)", href: "/liqueur/type/cocktail-ready-to-drink" }
];

export const otherProductLinks: CatalogMenuLink[] = [
  { label: "น้ำแร่", href: "/other-products/mineral-water" },
  { label: "ไซรัป (น้ำเชื่อม)", href: "/other-products/syrup" },
  { label: "บิทเทอร์", href: "/other-products/bitters" },
  { label: "ซิการ์", href: "/other-products/cigar" }
];

export const whiskyTypeLinks: CatalogMenuLink[] = [
  { label: "ซิงเกิลมอลต์ วิสกี้", href: "/whisky/type/single-malt-whisky" },
  { label: "สกอตช์ วิสกี้", href: "/whisky/type/scotch-whisky" },
  { label: "อเมริกัน วิสกี้", href: "/whisky/type/american-whisky" },
  { label: "ไอริช วิสกี้", href: "/whisky/type/irish-whisky" },
  { label: "เจแปนนีส วิสกี้", href: "/whisky/type/japanese-whisky" }
];

export const whiskyRegionLinks: CatalogMenuLink[] = [
  { label: "เขต Speyside", href: "/whisky/region/speyside" },
  { label: "เขต Highland", href: "/whisky/region/highland" },
  { label: "เขต Lowland", href: "/whisky/region/lowland" },
  { label: "เขต Islay", href: "/whisky/region/islay" },
  { label: "เขต Island", href: "/whisky/region/island" }
];

export const brandLinks: CatalogMenuLink[] = [
  { label: "Macallan", href: "/brands#macallan" },
  { label: "Johnnie Walker", href: "/brands#johnnie-walker" },
  { label: "Jack Daniel's", href: "/brands#jack-daniels" },
  { label: "Hennessy", href: "/brands#hennessy" }
];

export const recommendedLinks: CatalogMenuLink[] = [
  { label: "สินค้าขายดี", href: "/recommended/best-sellers" },
  { label: "สินค้าเข้าใหม่", href: "/recommended/new-arrivals" },
  { label: "คัดสรรประจำเดือน", href: "/recommended/monthly-picks" },
  { label: "พรีเมียมคัดสรร", href: "/recommended/premium-selection" },
  { label: "ชุดของขวัญ", href: "/recommended/gift-selection" }
];

export const productMenuCategoryOptions: CatalogMenuOption[] = productMenuGroups.map((group) => group.category.option);

export function resolveProductMenuCategoryName(value: string) {
  if (!value.trim()) {
    return "";
  }

  return findMenuGroup(value)?.category.option.name ?? value.trim();
}

export function getProductMenuSubcategoryOptions(value: string) {
  return findMenuGroup(value)?.items.map((item) => item.option) ?? [];
}

export function resolveProductMenuSubcategoryName(mainCategoryValue: string, subcategoryValue: string) {
  if (!subcategoryValue.trim()) {
    return "";
  }

  return findSubcategoryOption(findMenuGroup(mainCategoryValue), subcategoryValue)?.option.name ?? subcategoryValue.trim();
}

export function getProductMenuNestedSubcategoryOptions(mainCategoryValue: string, subcategoryValue: string) {
  const key = buildNestedSubcategoryKey(mainCategoryValue, subcategoryValue);
  return key ? nestedProductMenuItems[key]?.map((item) => item.option) ?? [] : [];
}

export function resolveProductMenuNestedSubcategoryName(mainCategoryValue: string, subcategoryValue: string, nestedValue: string) {
  if (!nestedValue.trim()) {
    return "";
  }

  return findNestedSubcategoryOption(mainCategoryValue, subcategoryValue, nestedValue)?.option.name ?? nestedValue.trim();
}
