import { db } from "@/lib/db";

export type BusinessStatus = "pending" | "approved" | "rejected" | null;
export type BusinessDocumentType = "business_license" | "company_certificate" | "tax_document";

export type BusinessDocumentItem = {
  type: BusinessDocumentType;
  fieldName: string;
  existingFieldName: string;
  label: string;
  helperText: string;
  uploaded: boolean;
  fileUrl: string | null;
  originalName: string | null;
};

export type BusinessAccountSummary = {
  schemaReady: boolean;
  status: BusinessStatus;
  documents: BusinessDocumentItem[];
};

const baseDocuments: BusinessDocumentItem[] = [
  {
    type: "business_license",
    fieldName: "businessLicenseFile",
    existingFieldName: "hasExistingBusinessLicense",
    label: "ใบอนุญาตประกอบธุรกิจ",
    helperText: "ใช้ยืนยันสิทธิ์และประเภทของกิจการที่สมัครใช้งาน B2B",
    uploaded: false,
    fileUrl: null,
    originalName: null
  },
  {
    type: "company_certificate",
    fieldName: "companyCertificateFile",
    existingFieldName: "hasExistingCompanyCertificate",
    label: "หนังสือรับรองบริษัท / บัตรประชาชน",
    helperText: "ใช้ยืนยันตัวตนของผู้ประกอบการหรือผู้ติดต่อหลัก",
    uploaded: false,
    fileUrl: null,
    originalName: null
  },
  {
    type: "tax_document",
    fieldName: "taxDocumentFile",
    existingFieldName: "hasExistingTaxDocument",
    label: "เอกสารภาษี",
    helperText: "ใช้ประกอบการออกใบเสร็จหรือใบกำกับภาษีสำหรับลูกค้าธุรกิจ",
    uploaded: false,
    fileUrl: null,
    originalName: null
  }
];

function isMissingBusinessSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

export function getBusinessStatusLabel(status: BusinessStatus) {
  if (status === "approved") {
    return "อนุมัติแล้ว";
  }

  if (status === "pending") {
    return "รอตรวจสอบ";
  }

  if (status === "rejected") {
    return "ต้องอัปเดตข้อมูล";
  }

  return "ยังไม่ได้สมัคร";
}

export async function getBusinessAccountSummary(userId: string): Promise<BusinessAccountSummary> {
  try {
    const result = await db.query(
      `
        select
          bp.status,
          bd.document_type,
          bd.file_url,
          bd.original_name
        from public.business_profiles bp
        left join public.business_documents bd on bd.business_profile_id = bp.id
        where bp.user_id = $1
      `,
      [userId]
    );

    if (!result.rowCount) {
      return {
        schemaReady: true,
        status: null,
        documents: baseDocuments
      };
    }

    const status = (result.rows[0]?.status as BusinessStatus | undefined) ?? null;
    const documents = baseDocuments.map((document) => {
      const match = result.rows.find((row) => String(row.document_type ?? "") === document.type);

      return {
        ...document,
        uploaded: Boolean(match?.file_url),
        fileUrl: match?.file_url ? String(match.file_url) : null,
        originalName: match?.original_name ? String(match.original_name) : null
      };
    });

    return {
      schemaReady: true,
      status,
      documents
    };
  } catch (error) {
    if (isMissingBusinessSchema(error)) {
      return {
        schemaReady: false,
        status: null,
        documents: baseDocuments
      };
    }

    throw error;
  }
}
