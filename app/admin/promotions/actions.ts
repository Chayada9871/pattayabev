"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export type PromotionFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniquePromotionSlug(baseValue: string) {
  const baseSlug = slugify(baseValue) || "promotion";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    let existing;

    try {
      existing = await db.query(`select id from public.promotions where slug = $1 limit 1`, [candidate]);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;

        if (code === "42P01" || code === "42703") {
          return candidate;
        }
      }

      throw error;
    }

    if (!existing.rowCount) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomUUID().slice(0, 8)}`;
}

async function saveUploadedPromotionImage(file: File, slug: string) {
  if (!file || file.size === 0) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name) || ".png";
  const fileName = `${slug || "promotion"}-${randomUUID()}${extension.toLowerCase()}`;
  const uploadDir = path.join(process.cwd(), "public", "images", "uploads", "promotions");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/images/uploads/promotions/${fileName}`;
}

export async function createPromotionAction(_: PromotionFormState, formData: FormData): Promise<PromotionFormState> {
  await requireRole("admin");

  const title = getTextValue(formData, "title");
  const promotionType = "DISCOUNT";
  const description = getTextValue(formData, "description");
  const productId = getTextValue(formData, "productId");
  const discountPercent = getNullableNumber(getTextValue(formData, "discountPercent"));
  const startDate = getTextValue(formData, "startDate");
  const endDate = getTextValue(formData, "endDate");
  const isActive = getTextValue(formData, "isActive") === "true";
  const imageFile = formData.get("promotionImage");

  if (!title) {
    return {
      status: "error",
      message: "กรุณากรอกชื่อโปรโมชั่น"
    };
  }

  if (!productId) {
    return {
      status: "error",
      message: "กรุณาเลือกสินค้าก่อน"
    };
  }

  if (promotionType === "DISCOUNT" && (!discountPercent || discountPercent <= 0 || discountPercent > 100)) {
    return {
      status: "error",
      message: "กรุณากรอกเปอร์เซ็นต์ส่วนลดให้ถูกต้อง"
    };
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return {
      status: "error",
      message: "วันสิ้นสุดโปรโมชั่นต้องอยู่หลังวันเริ่มต้น"
    };
  }

  const slug = await getUniquePromotionSlug(title);

  try {
    let resolvedLinkUrl = "";
    let resolvedProductId: string | null = null;

    if (productId) {
      const productResult = await db.query(
        `
          select id, slug
          from public.products
          where id = $1
          limit 1
        `,
        [productId]
      );

      if (productResult.rowCount) {
        resolvedProductId = String(productResult.rows[0].id);
        resolvedLinkUrl = `/products/${String(productResult.rows[0].slug)}`;
      }
    }

    const imageUrl = imageFile instanceof File && imageFile.size > 0 ? await saveUploadedPromotionImage(imageFile, slug) : null;

    await db.query(
      `
        insert into public.promotions (
          title,
          slug,
          promotion_type,
          description,
          image_url,
          link_url,
          product_id,
          discount_percent,
          start_at,
          end_at,
          min_quantity,
          bundle_price,
          fixed_price,
          is_active,
          sort_order
        )
        values ($1, $2, $3, nullif($4, ''), $5, nullif($6, ''), $7::uuid, $8, $9, $10, $11, $12, $13, $14, 1)
      `,
      [
        title,
        slug,
        promotionType,
        description,
        imageUrl,
        resolvedLinkUrl,
        resolvedProductId,
        discountPercent,
        startDate ? new Date(`${startDate}T00:00:00`) : null,
        endDate ? new Date(`${endDate}T23:59:59`) : null,
        null,
        null,
        null,
        isActive
      ]
    );

    revalidatePath("/admin/promotions");
    revalidatePath("/promotions");

    return {
      status: "success",
      message: "เพิ่มโปรโมชั่นเรียบร้อยแล้ว"
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code?: string }).code;

      if (code === "42P01" || code === "42703") {
        return {
          status: "error",
          message: "ตารางโปรโมชั่นยังไม่มีฟิลด์ที่จำเป็น กรุณารัน supabase/create-promotions.sql ก่อน"
        };
      }

      if (code === "23505") {
        return {
          status: "error",
          message: "ชื่อโปรโมชั่นนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น"
        };
      }
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถบันทึกโปรโมชั่นได้"
    };
  }
}
