import { db } from "@/lib/db";
import { getBusinessStatusLabel, type BusinessStatus } from "@/lib/business";
import type { AppRole } from "@/lib/auth-utils";

type QueryRow = Record<string, unknown>;

export type AdminAccountFilters = {
  query?: string;
  role?: string;
};

export type AdminAccountSummary = {
  totalAccounts: number;
  adminAccounts: number;
  managerAccounts: number;
  customerAccounts: number;
  verifiedAccounts: number;
};

export type AdminAccountListItem = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  emailVerified: boolean;
  businessStatus: BusinessStatus;
  businessStatusLabel: string;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

function sanitizeText(value: string | undefined | null) {
  return (value ?? "").trim();
}

function isMissingOptionalSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function mapRole(value: unknown): AppRole {
  if (value === "admin" || value === "manager" || value === "user") {
    return value;
  }

  return "user";
}

function mapAccount(row: QueryRow): AdminAccountListItem {
  const businessStatus = (row.business_status as BusinessStatus | undefined) ?? null;

  return {
    id: String(row.id),
    name: String(row.name ?? "สมาชิก PattayaBev"),
    email: String(row.email ?? "-"),
    role: mapRole(row.role),
    emailVerified: Boolean(row.email_verified),
    businessStatus,
    businessStatusLabel: getBusinessStatusLabel(businessStatus),
    orderCount: Number(row.order_count ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function getAdminAccountSummary(): Promise<AdminAccountSummary> {
  const baseQuery = `
    select
      count(*)::int as total_accounts,
      count(*) filter (where role = 'admin')::int as admin_accounts,
      count(*) filter (where role = 'manager')::int as manager_accounts,
      count(*) filter (where coalesce(role, 'user') = 'user')::int as customer_accounts,
      count(*) filter (where "emailVerified" = true)::int as verified_accounts
    from public."user"
  `;

  const result = await db.query(baseQuery);
  const row = result.rows[0] ?? {};

  return {
    totalAccounts: Number(row.total_accounts ?? 0),
    adminAccounts: Number(row.admin_accounts ?? 0),
    managerAccounts: Number(row.manager_accounts ?? 0),
    customerAccounts: Number(row.customer_accounts ?? 0),
    verifiedAccounts: Number(row.verified_accounts ?? 0)
  };
}

export async function getAdminAccounts(
  filters: AdminAccountFilters = {},
  limit = 150
): Promise<AdminAccountListItem[]> {
  const query = sanitizeText(filters.query);
  const role = sanitizeText(filters.role);

  try {
    const result = await db.query(
      `
        select
          u.id,
          u.name,
          u.email,
          coalesce(u.role, 'user') as role,
          u."emailVerified" as email_verified,
          u."createdAt" as created_at,
          u."updatedAt" as updated_at,
          bp.status as business_status,
          count(distinct o.id)::int as order_count
        from public."user" u
        left join public.business_profiles bp on bp.user_id = u.id
        left join public.orders o on o.user_id = u.id
        where (
          $1 = ''
          or u.name ilike '%' || $1 || '%'
          or u.email ilike '%' || $1 || '%'
          or u.id ilike '%' || $1 || '%'
        )
          and ($2 = '' or coalesce(u.role, 'user') = $2)
        group by
          u.id,
          u.name,
          u.email,
          u.role,
          u."emailVerified",
          u."createdAt",
          u."updatedAt",
          bp.status
        order by u."createdAt" desc
        limit $3
      `,
      [query, role, limit]
    );

    return result.rows.map(mapAccount);
  } catch (error) {
    if (!isMissingOptionalSchema(error)) {
      throw error;
    }

    const fallbackResult = await db.query(
      `
        select
          u.id,
          u.name,
          u.email,
          coalesce(u.role, 'user') as role,
          u."emailVerified" as email_verified,
          u."createdAt" as created_at,
          u."updatedAt" as updated_at,
          null::text as business_status,
          0::int as order_count
        from public."user" u
        where (
          $1 = ''
          or u.name ilike '%' || $1 || '%'
          or u.email ilike '%' || $1 || '%'
          or u.id ilike '%' || $1 || '%'
        )
          and ($2 = '' or coalesce(u.role, 'user') = $2)
        order by u."createdAt" desc
        limit $3
      `,
      [query, role, limit]
    );

    return fallbackResult.rows.map(mapAccount);
  }
}

export async function adminUpdateAccountRole(userId: string, role: AppRole) {
  const result = await db.query(
    `
      update public."user"
      set
        role = $2,
        "updatedAt" = now()
      where id = $1
      returning id
    `,
    [userId, role]
  );

  if (!result.rowCount) {
    throw new Error("ไม่พบบัญชีผู้ใช้ที่ต้องการอัปเดต");
  }
}
