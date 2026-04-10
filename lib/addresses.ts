import { db } from "@/lib/db";

export type SavedAddressLabel = "Home" | "Office" | "Warehouse" | "Other";
export type BillingType = "individual" | "company";
export type BranchType = "head_office" | "branch_number";

export type SavedAddress = {
  id: string;
  label: SavedAddressLabel;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  addressNote: string | null;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  deliveryNote: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefaultShipping: boolean;
};

export type BillingDetails = {
  id: string;
  billingType: BillingType;
  fullNameOrCompanyName: string;
  taxId: string | null;
  branchType: BranchType;
  branchNumber: string | null;
  billingPhoneNumber: string;
  billingEmail: string | null;
  addressLine1: string;
  addressLine2: string | null;
  addressNote: string | null;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  sameAsShipping: boolean;
  sourceAddressId: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AccountAddressData = {
  schemaReady: boolean;
  defaultShippingAddress: SavedAddress | null;
  savedAddresses: SavedAddress[];
  billingDetails: BillingDetails | null;
};

function isMissingAddressSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function mapSavedAddress(row: Record<string, unknown>): SavedAddress {
  return {
    id: String(row.id),
    label: (String(row.label ?? "Home") as SavedAddressLabel) ?? "Home",
    recipientName: String(row.recipient_name ?? ""),
    phoneNumber: String(row.phone_number ?? ""),
    addressLine1: String(row.address_line_1 ?? ""),
    addressLine2: row.address_line_2 ? String(row.address_line_2) : null,
    addressNote: row.address_note ? String(row.address_note) : null,
    subdistrict: String(row.subdistrict ?? ""),
    district: String(row.district ?? ""),
    province: String(row.province ?? ""),
    postalCode: String(row.postal_code ?? ""),
    deliveryNote: row.delivery_note ? String(row.delivery_note) : null,
    googleMapsUrl: row.google_maps_url ? String(row.google_maps_url) : null,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    isDefaultShipping: Boolean(row.is_default_shipping)
  };
}

function mapBillingDetails(row: Record<string, unknown>): BillingDetails {
  return {
    id: String(row.id),
    billingType: String(row.billing_type ?? "individual") as BillingType,
    fullNameOrCompanyName: String(row.full_name_or_company_name ?? ""),
    taxId: row.tax_id ? String(row.tax_id) : null,
    branchType: String(row.branch_type ?? "head_office") as BranchType,
    branchNumber: row.branch_number ? String(row.branch_number) : null,
    billingPhoneNumber: String(row.billing_phone_number ?? ""),
    billingEmail: row.billing_email ? String(row.billing_email) : null,
    addressLine1: String(row.address_line_1 ?? ""),
    addressLine2: row.address_line_2 ? String(row.address_line_2) : null,
    addressNote: row.address_note ? String(row.address_note) : null,
    subdistrict: String(row.subdistrict ?? ""),
    district: String(row.district ?? ""),
    province: String(row.province ?? ""),
    postalCode: String(row.postal_code ?? ""),
    sameAsShipping: Boolean(row.same_as_shipping),
    sourceAddressId: row.source_address_id ? String(row.source_address_id) : null,
    googleMapsUrl: row.google_maps_url ? String(row.google_maps_url) : null,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null
  };
}

export async function getAccountAddressData(userId: string): Promise<AccountAddressData> {
  try {
    const [shippingResult, billingResult] = await Promise.all([
      db.query(
        `
          select
            id,
            label,
            recipient_name,
            phone_number,
            address_line_1,
            address_line_2,
            address_note,
            subdistrict,
            district,
            province,
            postal_code,
            delivery_note,
            google_maps_url,
            latitude,
            longitude,
            is_default_shipping
          from public.customer_addresses
          where user_id = $1
          order by is_default_shipping desc, updated_at desc, created_at desc
        `,
        [userId]
      ),
      db.query(
        `
          select
            id,
            billing_type,
            full_name_or_company_name,
            tax_id,
            branch_type,
            branch_number,
            billing_phone_number,
            billing_email,
            address_line_1,
            address_line_2,
            address_note,
            subdistrict,
            district,
            province,
            postal_code,
            same_as_shipping,
            source_address_id,
            google_maps_url,
            latitude,
            longitude
          from public.billing_details
          where user_id = $1
          limit 1
        `,
        [userId]
      )
    ]);

    const savedAddresses = shippingResult.rows.map((row) => mapSavedAddress(row));

    return {
      schemaReady: true,
      defaultShippingAddress: savedAddresses.find((address) => address.isDefaultShipping) ?? savedAddresses[0] ?? null,
      savedAddresses,
      billingDetails: billingResult.rows[0] ? mapBillingDetails(billingResult.rows[0]) : null
    };
  } catch (error) {
    if (isMissingAddressSchema(error)) {
      return {
        schemaReady: false,
        defaultShippingAddress: null,
        savedAddresses: [],
        billingDetails: null
      };
    }

    throw error;
  }
}
