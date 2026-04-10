import { db } from "@/lib/db";
import { getBusinessStatusLabel, type BusinessDocumentType, type BusinessStatus } from "@/lib/business";

type QueryRow = Record<string, unknown>;

export type AdminBusinessSummary = {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  uploadedDocuments: number;
};

export type AdminBusinessListItem = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: BusinessStatus;
  statusLabel: string;
  uploadedDocuments: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminBusinessDocument = {
  id: string;
  type: BusinessDocumentType;
  label: string;
  fileUrl: string;
  originalName: string;
  uploadedAt: string;
};

export type AdminBusinessDetail = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: BusinessStatus;
  statusLabel: string;
  uploadedDocuments: number;
  createdAt: string;
  updatedAt: string;
  documents: AdminBusinessDocument[];
};

const documentLabels: Record<BusinessDocumentType, string> = {
  business_license: "ใบอนุญาตประกอบธุรกิจ",
  company_certificate: "หนังสือรับรองบริษัท / บัตรประชาชน",
  tax_document: "เอกสารภาษี"
};

export function getBusinessSchemaMessage() {
  return "กรุณารันไฟล์ supabase/create-business-documents.sql ก่อนใช้งานหน้าจัดการ B2B";
}

function isMissingBusinessSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function mapBusinessListItem(row: QueryRow): AdminBusinessListItem {
  const status = (row.status as BusinessStatus | undefined) ?? null;

  return {
    id: String(row.id),
    userId: String(row.user_id),
    customerName: String(row.customer_name ?? "สมาชิก PattayaBev"),
    customerEmail: String(row.customer_email ?? "-"),
    status,
    statusLabel: getBusinessStatusLabel(status),
    uploadedDocuments: Number(row.uploaded_documents ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function getAdminBusinessSummary(): Promise<AdminBusinessSummary> {
  try {
    const result = await db.query(
      `
        select
          count(*)::int as total_applications,
          count(*) filter (where status = 'pending')::int as pending_applications,
          count(*) filter (where status = 'approved')::int as approved_applications,
          count(*) filter (where status = 'rejected')::int as rejected_applications,
          (
            select count(*)::int
            from public.business_documents
          ) as uploaded_documents
        from public.business_profiles
      `
    );

    const row = result.rows[0] ?? {};

    return {
      totalApplications: Number(row.total_applications ?? 0),
      pendingApplications: Number(row.pending_applications ?? 0),
      approvedApplications: Number(row.approved_applications ?? 0),
      rejectedApplications: Number(row.rejected_applications ?? 0),
      uploadedDocuments: Number(row.uploaded_documents ?? 0)
    };
  } catch (error) {
    if (isMissingBusinessSchema(error)) {
      throw new Error(getBusinessSchemaMessage());
    }

    throw error;
  }
}

export async function getAdminBusinessProfiles(limit = 100): Promise<AdminBusinessListItem[]> {
  try {
    const result = await db.query(
      `
        select
          bp.id,
          bp.user_id,
          coalesce(nullif(trim(u.name), ''), 'สมาชิก PattayaBev') as customer_name,
          u.email as customer_email,
          bp.status,
          bp.created_at,
          bp.updated_at,
          count(bd.id)::int as uploaded_documents
        from public.business_profiles bp
        left join public."user" u on u.id = bp.user_id
        left join public.business_documents bd on bd.business_profile_id = bp.id
        group by bp.id, bp.user_id, u.name, u.email, bp.status, bp.created_at, bp.updated_at
        order by bp.updated_at desc, bp.created_at desc
        limit $1
      `,
      [limit]
    );

    return result.rows.map(mapBusinessListItem);
  } catch (error) {
    if (isMissingBusinessSchema(error)) {
      throw new Error(getBusinessSchemaMessage());
    }

    throw error;
  }
}

export async function getAdminBusinessDetail(profileId: string): Promise<AdminBusinessDetail | null> {
  try {
    const profileResult = await db.query(
      `
        select
          bp.id,
          bp.user_id,
          coalesce(nullif(trim(u.name), ''), 'สมาชิก PattayaBev') as customer_name,
          u.email as customer_email,
          bp.status,
          bp.created_at,
          bp.updated_at,
          (
            select count(*)::int
            from public.business_documents
            where business_profile_id = bp.id
          ) as uploaded_documents
        from public.business_profiles bp
        left join public."user" u on u.id = bp.user_id
        where bp.id = $1::uuid
        limit 1
      `,
      [profileId]
    );

    if (!profileResult.rowCount) {
      return null;
    }

    const profile = profileResult.rows[0];
    const status = (profile.status as BusinessStatus | undefined) ?? null;

    const documentsResult = await db.query(
      `
        select
          id,
          document_type,
          file_url,
          original_name,
          uploaded_at
        from public.business_documents
        where business_profile_id = $1::uuid
        order by uploaded_at desc
      `,
      [profileId]
    );

    return {
      id: String(profile.id),
      userId: String(profile.user_id),
      customerName: String(profile.customer_name ?? "สมาชิก PattayaBev"),
      customerEmail: String(profile.customer_email ?? "-"),
      status,
      statusLabel: getBusinessStatusLabel(status),
      uploadedDocuments: Number(profile.uploaded_documents ?? 0),
      createdAt: String(profile.created_at),
      updatedAt: String(profile.updated_at),
      documents: documentsResult.rows.map((row) => {
        const type = String(row.document_type) as BusinessDocumentType;

        return {
          id: String(row.id),
          type,
          label: documentLabels[type] ?? String(row.document_type),
          fileUrl: String(row.file_url),
          originalName: String(row.original_name ?? "-"),
          uploadedAt: String(row.uploaded_at)
        };
      })
    };
  } catch (error) {
    if (isMissingBusinessSchema(error)) {
      throw new Error(getBusinessSchemaMessage());
    }

    throw error;
  }
}

export async function adminUpdateBusinessStatus(profileId: string, status: Exclude<BusinessStatus, null>) {
  try {
    const result = await db.query(
      `
        update public.business_profiles
        set
          status = $2,
          updated_at = now()
        where id = $1::uuid
        returning user_id
      `,
      [profileId, status]
    );

    if (!result.rowCount) {
      throw new Error("ไม่พบคำขอ B2B ที่ต้องการอัปเดต");
    }

    return {
      userId: String(result.rows[0].user_id)
    };
  } catch (error) {
    if (isMissingBusinessSchema(error)) {
      throw new Error(getBusinessSchemaMessage());
    }

    throw error;
  }
}
