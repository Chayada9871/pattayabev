import { calculateDistanceKm, parseLatitude, parseLongitude, SOPHON_STORE_LOCATION } from "@/lib/google-maps";

export const RESPONSIBLE_PURCHASE_NOTICE =
  "สินค้าบางประเภทมีข้อจำกัดตามกฎหมาย โปรดสั่งซื้ออย่างมีความรับผิดชอบ และไม่จำหน่ายให้ผู้มีอายุต่ำกว่า 20 ปี";

export const BUSINESS_LOCATION_NOTE =
  "จัดส่งจากพัทยา พร้อมทีมดูแลคำสั่งซื้อสำหรับลูกค้าทั่วไปและลูกค้าธุรกิจ";

export const deliveryMethodOptions = {
  standard: {
    id: "standard",
    label: "จัดส่งมาตรฐาน",
    description: "เหมาะสำหรับคำสั่งซื้อทั่วไป จัดส่งทั่วประเทศ",
    estimate: "1-3 วันทำการ",
    fee: 80
  },
  express: {
    id: "express",
    label: "จัดส่งด่วน",
    description: "เหมาะสำหรับงานเร่งด่วนในพัทยาและพื้นที่ใกล้เคียง",
    estimate: "ภายใน 1 วันทำการ",
    fee: 150
  }
} as const;

export const paymentMethodOptions = {
  promptpay: {
    id: "promptpay",
    label: "พร้อมเพย์ QR",
    description: "ชำระผ่าน QR PromptPay และรอระบบยืนยันจากผู้ให้บริการ",
    providerName: "stripe",
    enabled: true
  },
  card: {
    id: "card",
    label: "บัตรเครดิต / เดบิต",
    description: "รองรับการเชื่อม Stripe หรือ Opn Payments ภายหลัง",
    providerName: "stripe",
    enabled: true
  },
  cod: {
    id: "cod",
    label: "เก็บเงินปลายทาง",
    description: "เปิดใช้งานได้ตามนโยบายร้านค้าและพื้นที่จัดส่ง",
    providerName: "manual",
    enabled: true
  }
} as const;

const shippingFeeMatrix = {
  baseBands: [
    {
      maxWeightKg: 1,
      fees: {
        pattayaCore: 45,
        greaterChonburi: 55,
        eastern: 65,
        bangkokMetro: 75,
        nationwide: 85
      }
    },
    {
      maxWeightKg: 3,
      fees: {
        pattayaCore: 60,
        greaterChonburi: 75,
        eastern: 90,
        bangkokMetro: 105,
        nationwide: 120
      }
    },
    {
      maxWeightKg: 5,
      fees: {
        pattayaCore: 80,
        greaterChonburi: 100,
        eastern: 120,
        bangkokMetro: 135,
        nationwide: 155
      }
    },
    {
      maxWeightKg: 10,
      fees: {
        pattayaCore: 115,
        greaterChonburi: 145,
        eastern: 170,
        bangkokMetro: 195,
        nationwide: 225
      }
    },
    {
      maxWeightKg: 15,
      fees: {
        pattayaCore: 150,
        greaterChonburi: 185,
        eastern: 220,
        bangkokMetro: 250,
        nationwide: 290
      }
    },
    {
      maxWeightKg: 20,
      fees: {
        pattayaCore: 185,
        greaterChonburi: 225,
        eastern: 265,
        bangkokMetro: 305,
        nationwide: 350
      }
    }
  ],
  extraPerKg: {
    pattayaCore: 10,
    greaterChonburi: 12,
    eastern: 14,
    bangkokMetro: 16,
    nationwide: 18
  },
  expressSurcharge: {
    pattayaCore: 30,
    greaterChonburi: 40,
    eastern: 50,
    bangkokMetro: 60,
    nationwide: 70
  }
} as const;

export type DeliveryMethod = keyof typeof deliveryMethodOptions;
export type PaymentMethod = keyof typeof paymentMethodOptions;
export type ShippingZone = "pattayaCore" | "greaterChonburi" | "eastern" | "bangkokMetro" | "nationwide";

export type ShippingDestinationInput = {
  province?: string;
  district?: string;
  subdistrict?: string;
  postalCode?: string;
};

export type ShippingFeeResult = {
  fee: number;
  zone: ShippingZone;
  zoneLabel: string;
  hasDestination: boolean;
  estimatedWeightKg: number;
  distanceKm: number | null;
  pricingNote: string;
};

function normalizeWeightKg(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return Number(value.toFixed(2));
}

export function estimateProductWeightKg(bottleSizeMl: number | null | undefined) {
  const normalizedBottleSize = typeof bottleSizeMl === "number" && bottleSizeMl > 0 ? bottleSizeMl : 750;
  const estimatedWeightKg = 0.55 + normalizedBottleSize / 1000;
  return Number(Math.max(0.5, estimatedWeightKg).toFixed(2));
}

export function calculateEstimatedCartWeightKg(
  items: Array<{ quantity: number; estimatedWeightKg?: number | null }>
) {
  const total = items.reduce((sum, item) => {
    const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? Math.floor(item.quantity) : 1;
    const unitWeight = normalizeWeightKg(item.estimatedWeightKg);
    return sum + unitWeight * quantity;
  }, 0);

  return Number(total.toFixed(2));
}

function normalizeLocationKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.\-_/(),]/g, "")
    .replace(/\s+/g, "");
}

export function getDeliveryMethodOption(method: string) {
  return deliveryMethodOptions[method as DeliveryMethod] ?? deliveryMethodOptions.standard;
}

export function getPaymentMethodOption(method: string) {
  return paymentMethodOptions[method as PaymentMethod] ?? paymentMethodOptions.promptpay;
}

const pattayaCoreSubdistrictKeys = new Set([
  "นาเกลือ",
  "หนองปรือ",
  "nakluea",
  "nongprue"
]);

const bangkokMetroProvinceKeys = new Set([
  "กรุงเทพมหานคร",
  "กรุงเทพ",
  "bangkok",
  "นนทบุรี",
  "nonthaburi",
  "ปทุมธานี",
  "pathumthani",
  "สมุทรปราการ",
  "samutprakan",
  "สมุทรสาคร",
  "samutsakhon",
  "นครปฐม",
  "nakhonpathom"
]);

const easternProvinceKeys = new Set([
  "ชลบุรี",
  "chonburi",
  "ระยอง",
  "rayong",
  "ฉะเชิงเทรา",
  "chachoengsao",
  "จันทบุรี",
  "chanthaburi",
  "ตราด",
  "trat",
  "ปราจีนบุรี",
  "prachinburi",
  "สระแก้ว",
  "sakaeo"
]);

export function getShippingZoneByAddress(destination: ShippingDestinationInput): ShippingZone {
  const province = normalizeLocationKey(destination.province ?? "");
  const district = normalizeLocationKey(destination.district ?? "");
  const subdistrict = normalizeLocationKey(destination.subdistrict ?? "");

  if (!province) {
    return "nationwide";
  }

  if (province === "ชลบุรี" || province === "chonburi" || province === "chonburiprovince") {
    if (district === "บางละมุง" || district === "banglamung") {
      if (!subdistrict || pattayaCoreSubdistrictKeys.has(subdistrict)) {
        return "pattayaCore";
      }

      return "greaterChonburi";
    }

    return "greaterChonburi";
  }

  if (bangkokMetroProvinceKeys.has(province)) {
    return "bangkokMetro";
  }

  if (easternProvinceKeys.has(province)) {
    return "eastern";
  }

  return "nationwide";
}

export function getShippingZoneLabel(zone: ShippingZone) {
  switch (zone) {
    case "pattayaCore":
      return "พัทยาโซนหลัก";
    case "greaterChonburi":
      return "ชลบุรีและพื้นที่ใกล้เคียง";
    case "eastern":
      return "ภาคตะวันออก";
    case "bangkokMetro":
      return "กรุงเทพและปริมณฑล";
    default:
      return "ต่างจังหวัด";
  }
}

function getBaseShippingFee(zone: ShippingZone, totalWeightKg: number) {
  const normalizedWeight = normalizeWeightKg(totalWeightKg);
  const matchedBand = shippingFeeMatrix.baseBands.find((band) => normalizedWeight <= band.maxWeightKg);

  if (matchedBand) {
    return matchedBand.fees[zone];
  }

  const lastBand = shippingFeeMatrix.baseBands[shippingFeeMatrix.baseBands.length - 1];
  const extraWeightKg = Math.ceil(normalizedWeight - lastBand.maxWeightKg);
  return lastBand.fees[zone] + extraWeightKg * shippingFeeMatrix.extraPerKg[zone];
}

function getDistanceAdjustment(distanceKm: number | null) {
  if (distanceKm == null) {
    return 0;
  }

  if (distanceKm > 120) {
    return 45;
  }

  if (distanceKm > 60) {
    return 25;
  }

  if (distanceKm > 25) {
    return 10;
  }

  return 0;
}

function resolveDistanceKm(latitude?: string | number, longitude?: string | number) {
  const parsedLatitude =
    typeof latitude === "number" ? latitude : typeof latitude === "string" ? parseLatitude(latitude) : null;
  const parsedLongitude =
    typeof longitude === "number" ? longitude : typeof longitude === "string" ? parseLongitude(longitude) : null;

  if (parsedLatitude == null || parsedLongitude == null) {
    return null;
  }

  return calculateDistanceKm(SOPHON_STORE_LOCATION, {
    latitude: parsedLatitude,
    longitude: parsedLongitude
  });
}

export function calculateShippingFee(args: {
  deliveryMethod: DeliveryMethod;
  province?: string;
  district?: string;
  subdistrict?: string;
  postalCode?: string;
  totalWeightKg?: number;
  latitude?: string | number;
  longitude?: string | number;
}): ShippingFeeResult {
  const estimatedWeightKg = normalizeWeightKg(args.totalWeightKg);
  const distanceKm = resolveDistanceKm(args.latitude, args.longitude);

  if (!args.province?.trim()) {
    const zone: ShippingZone = "bangkokMetro";
    const baseFee = getBaseShippingFee(zone, estimatedWeightKg);
    const fee =
      baseFee + (args.deliveryMethod === "express" ? shippingFeeMatrix.expressSurcharge[zone] : 0);

    return {
      fee,
      zone,
      zoneLabel: "รอระบุที่อยู่ปลายทาง",
      hasDestination: false,
      estimatedWeightKg,
      distanceKm,
      pricingNote: "เรทประมาณอิงปลายทางและน้ำหนักรวมแบบขนส่งเอกชน"
    };
  }

  const zone = getShippingZoneByAddress(args);
  const baseFee = getBaseShippingFee(zone, estimatedWeightKg);
  const deliveryMethodSurcharge = args.deliveryMethod === "express" ? shippingFeeMatrix.expressSurcharge[zone] : 0;
  const distanceAdjustment = getDistanceAdjustment(distanceKm);
  const fee = baseFee + deliveryMethodSurcharge + distanceAdjustment;

  return {
    fee,
    zone,
    zoneLabel: getShippingZoneLabel(zone),
    hasDestination: Boolean(args.province?.trim()),
    estimatedWeightKg,
    distanceKm,
    pricingNote:
      distanceAdjustment > 0
        ? "เรทประมาณอิงปลายทาง น้ำหนักรวม และระยะทางจากจุดจัดส่ง"
        : "เรทประมาณอิงปลายทางและน้ำหนักรวมแบบขนส่งเอกชน"
  };
}
