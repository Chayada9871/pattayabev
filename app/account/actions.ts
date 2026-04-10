"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export type BusinessDocumentsFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getBooleanValue(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function isMissingBusinessSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function sanitizeUserId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

async function saveBusinessDocument(file: File, userId: string, documentType: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name) || ".pdf";
  const fileName = `${sanitizeUserId(userId)}-${documentType}-${randomUUID()}${extension.toLowerCase()}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "business-documents");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/business-documents/${fileName}`;
}

async function upsertDocument(params: {
  profileId: string;
  documentType: "business_license" | "company_certificate" | "tax_document";
  file: File;
  userId: string;
}) {
  const fileUrl = await saveBusinessDocument(params.file, params.userId, params.documentType);

  await db.query(
    `
      insert into public.business_documents (
        business_profile_id,
        document_type,
        file_url,
        original_name,
        mime_type,
        size_bytes
      )
      values ($1, $2, $3, $4, $5, $6)
      on conflict (business_profile_id, document_type)
      do update set
        file_url = excluded.file_url,
        original_name = excluded.original_name,
        mime_type = excluded.mime_type,
        size_bytes = excluded.size_bytes,
        uploaded_at = now()
    `,
    [params.profileId, params.documentType, fileUrl, params.file.name, params.file.type || null, params.file.size]
  );
}

export async function saveBusinessDocumentsAction(
  _: BusinessDocumentsFormState,
  formData: FormData
): Promise<BusinessDocumentsFormState> {
  const session = await requireSession();
  const userId = String(session.user.id);

  const businessLicenseFile = getFileValue(formData, "businessLicenseFile");
  const companyCertificateFile = getFileValue(formData, "companyCertificateFile");
  const taxDocumentFile = getFileValue(formData, "taxDocumentFile");

  const hasExistingBusinessLicense = getBooleanValue(formData, "hasExistingBusinessLicense");
  const hasExistingCompanyCertificate = getBooleanValue(formData, "hasExistingCompanyCertificate");
  const hasExistingTaxDocument = getBooleanValue(formData, "hasExistingTaxDocument");

  if (!businessLicenseFile && !hasExistingBusinessLicense) {
    return {
      status: "error",
      message: "กรุณาอัปโหลดใบอนุญาตประกอบธุรกิจก่อนบันทึก"
    };
  }

  if (!companyCertificateFile && !hasExistingCompanyCertificate) {
    return {
      status: "error",
      message: "กรุณาอัปโหลดหนังสือรับรองบริษัทหรือบัตรประชาชนก่อนบันทึก"
    };
  }

  if (!taxDocumentFile && !hasExistingTaxDocument) {
    return {
      status: "error",
      message: "กรุณาอัปโหลดเอกสารภาษีก่อนบันทึก"
    };
  }

  try {
    const profileResult = await db.query(
      `
        insert into public.business_profiles (user_id, status)
        values ($1, 'pending')
        on conflict (user_id)
        do update set
          status = 'pending',
          updated_at = now()
        returning id
      `,
      [userId]
    );

    const profileId = String(profileResult.rows[0].id);

    if (businessLicenseFile) {
      await upsertDocument({
        profileId,
        documentType: "business_license",
        file: businessLicenseFile,
        userId
      });
    }

    if (companyCertificateFile) {
      await upsertDocument({
        profileId,
        documentType: "company_certificate",
        file: companyCertificateFile,
        userId
      });
    }

    if (taxDocumentFile) {
      await upsertDocument({
        profileId,
        documentType: "tax_document",
        file: taxDocumentFile,
        userId
      });
    }

    revalidatePath("/account");
    revalidatePath("/home");

    return {
      status: "success",
      message: "บันทึกเอกสารธุรกิจเรียบร้อยแล้ว"
    };
  } catch (error) {
    if (isMissingBusinessSchema(error)) {
      return {
        status: "error",
        message: "ต้องรันไฟล์ supabase/create-business-documents.sql ก่อนจึงจะบันทึกเอกสารได้"
      };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถบันทึกเอกสารได้"
    };
  }
}
