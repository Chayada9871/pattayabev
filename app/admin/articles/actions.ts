"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createArticle, type ArticleSection } from "@/lib/articles";

export type ArticleFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

type ParsedSection = {
  id: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
};

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function splitParagraphs(value: string) {
  return value
    .split(/\r?\n\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMixedContent(value: string) {
  const lines = value.split(/\r?\n/g);
  const paragraphs: string[] = [];
  const bullets: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    const paragraph = paragraphBuffer.join(" ").trim();

    if (paragraph) {
      paragraphs.push(paragraph);
    }

    paragraphBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      flushParagraph();
      bullets.push(trimmed.replace(/^[-*•]\s+/, "").trim());
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();

  return {
    paragraphs: paragraphs.length ? paragraphs : undefined,
    bullets: bullets.length ? bullets : undefined
  };
}

function parseSections(value: string) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((section): ParsedSection | null => {
        if (!section || typeof section !== "object") {
          return null;
        }

        const id = typeof section.id === "string" ? section.id.trim() : "";
        const title = typeof section.title === "string" ? section.title.trim() : "";

        if (!id || !title) {
          return null;
        }

        const intro = typeof section.intro === "string" ? section.intro.trim() : "";
        const content = typeof section.content === "string" ? section.content : "";
        const { paragraphs, bullets } = parseMixedContent(content);

        return {
          id,
          title,
          intro: intro || undefined,
          paragraphs,
          bullets
        };
      })
      .filter((section): section is ParsedSection => Boolean(section));
  } catch {
    return [];
  }
}

function formatPublishedDate(value: string) {
  if (!value) {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Bangkok"
    }).format(new Date());
  }

  const parsedDate = new Date(`${value}T12:00:00+07:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(parsedDate);
}

async function saveUploadedImage(file: File, slugOrTitle: string, prefix = "cover") {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const safeBase =
    slugOrTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "article";
  const extension = path.extname(file.name) || ".png";
  const fileName = `${safeBase}-${prefix}-${randomUUID()}${extension.toLowerCase()}`;
  const uploadDir = path.join(process.cwd(), "public", "images", "uploads", "articles");
  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  return `/images/uploads/articles/${fileName}`;
}

function validationError(message: string): ArticleFormState {
  return {
    status: "error",
    message
  };
}

export async function createArticleAction(_: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireRole("admin");

  const title = getTextValue(formData, "title");
  const category = getTextValue(formData, "category");
  const excerpt = getTextValue(formData, "excerpt");
  const readTime = getTextValue(formData, "readTime");
  const publishedDate = getTextValue(formData, "publishedDate");
  const introduction = splitParagraphs(getTextValue(formData, "introduction"));
  const parsedSections = parseSections(getTextValue(formData, "sectionsJson"));
  const coverImageFile = formData.get("coverImageFile");

  if (!title || !category || !excerpt) {
    return validationError("กรุณากรอกชื่อบทความ หมวดหมู่ และคำเกริ่นสั้น");
  }

  if (!introduction.length) {
    return validationError("กรุณาเพิ่มบทนำอย่างน้อย 1 ย่อหน้า");
  }

  if (!parsedSections.length) {
    return validationError("กรุณาเพิ่ม section ของบทความอย่างน้อย 1 ส่วน");
  }

  const sections: ArticleSection[] = [];

  for (const section of parsedSections) {
    const imageField = formData.get(`sectionImage-${section.id}`);
    const sectionImage =
      imageField instanceof File && imageField.size > 0
        ? await saveUploadedImage(imageField, title, `section-${section.id}`)
        : null;

    sections.push({
      title: section.title,
      image: sectionImage ?? undefined,
      intro: section.intro,
      paragraphs: section.paragraphs,
      bullets: section.bullets
    });
  }

  const imagePath =
    coverImageFile instanceof File && coverImageFile.size > 0
      ? await saveUploadedImage(coverImageFile, title)
      : "/images/categories/recommended.jpg";

  try {
    const article = await createArticle({
      category,
      title,
      excerpt,
      image: imagePath ?? "/images/categories/recommended.jpg",
      publishedAt: formatPublishedDate(publishedDate),
      readTime: readTime || "อ่าน 5 นาที",
      introduction,
      sections
    });

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath("/catalog");
    revalidatePath(`/articles/${article.slug}`);

    return {
      status: "success",
      message: "เพิ่มบทความเรียบร้อยแล้ว"
    };
  } catch (error) {
    return validationError(error instanceof Error ? error.message : "ไม่สามารถบันทึกบทความได้");
  }
}
