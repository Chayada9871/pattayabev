"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  extractGoogleMapCoordinates,
  isValidGoogleMapsUrl,
  parseLatitude,
  parseLongitude
} from "@/lib/google-maps";

export type AddressFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function isMissingAddressSchema(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidThaiPhoneNumber(value: string) {
  return /^0\d{8,9}$/.test(normalizePhoneNumber(value));
}

function isValidPostalCode(value: string) {
  return /^\d{5}$/.test(value.trim());
}

function isValidTaxId(value: string) {
  return /^\d{13}$/.test(value.replace(/[^\d]/g, ""));
}

function getSchemaMessage() {
  return "กรุณารันไฟล์ supabase/create-account-addresses.sql และถ้าใช้ฐานข้อมูลเดิมให้รัน supabase/add-address-map-fields.sql กับ supabase/add-address-note-fields.sql เพิ่มเติม";
}

function refreshAccountRoutes() {
  revalidatePath("/account");
  revalidatePath("/home");
}

function resolveMapCoordinates({
  googleMapsUrl,
  latitude,
  longitude
}: {
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
}) {
  const parsedLatitude = parseLatitude(latitude);
  const parsedLongitude = parseLongitude(longitude);

  if (parsedLatitude != null && parsedLongitude != null) {
    return { latitude: parsedLatitude, longitude: parsedLongitude };
  }

  return extractGoogleMapCoordinates(googleMapsUrl);
}

function validateOptionalMapInputs({
  googleMapsUrl,
  latitude,
  longitude
}: {
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
}) {
  if (googleMapsUrl && !isValidGoogleMapsUrl(googleMapsUrl)) {
    return "กรุณาใส่ลิงก์ Google Maps ให้ถูกต้อง";
  }

  if (latitude.trim() && parseLatitude(latitude) == null) {
    return "กรุณาใส่ละติจูดให้ถูกต้อง";
  }

  if (longitude.trim() && parseLongitude(longitude) == null) {
    return "กรุณาใส่ลองจิจูดให้ถูกต้อง";
  }

  return "";
}

export async function saveShippingAddressAction(
  _: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await requireSession();
  const userId = String(session.user.id);

  const addressId = getTextValue(formData, "addressId");
  const label = getTextValue(formData, "label") || "Home";
  const recipientName = getTextValue(formData, "recipientName");
  const phoneNumber = normalizePhoneNumber(getTextValue(formData, "phoneNumber"));
  const addressLine1 = getTextValue(formData, "addressLine1");
  const addressLine2 = getTextValue(formData, "addressLine2");
  const addressNote = getTextValue(formData, "addressNote");
  const subdistrict = getTextValue(formData, "subdistrict");
  const district = getTextValue(formData, "district");
  const province = getTextValue(formData, "province");
  const postalCode = getTextValue(formData, "postalCode");
  const googleMapsUrl = getTextValue(formData, "googleMapsUrl");
  const latitude = getTextValue(formData, "latitude");
  const longitude = getTextValue(formData, "longitude");
  const deliveryNote = getTextValue(formData, "deliveryNote");
  const setDefault = formData.get("setDefaultShipping") === "on";

  if (!recipientName || !addressLine1 || !subdistrict || !district || !province || !postalCode) {
    return { status: "error", message: "กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน" };
  }

  if (!isValidThaiPhoneNumber(phoneNumber)) {
    return { status: "error", message: "กรุณาใส่เบอร์โทรศัพท์ให้ถูกต้อง" };
  }

  if (!isValidPostalCode(postalCode)) {
    return { status: "error", message: "กรุณาใส่รหัสไปรษณีย์ 5 หลัก" };
  }

  const mapError = validateOptionalMapInputs({ googleMapsUrl, latitude, longitude });
  if (mapError) {
    return { status: "error", message: mapError };
  }

  const coordinates = resolveMapCoordinates({ googleMapsUrl, latitude, longitude });

  try {
    const result = await db.query(
      `
        insert into public.customer_addresses (
          id,
          user_id,
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
        )
        values (
          coalesce(nullif($1, '')::uuid, gen_random_uuid()),
          $2,
          $3,
          $4,
          $5,
          $6,
          nullif($7, ''),
          nullif($8, ''),
          $9,
          $10,
          $11,
          $12,
          nullif($13, ''),
          nullif($14, ''),
          $15,
          $16,
          $17
        )
        on conflict (id)
        do update set
          label = excluded.label,
          recipient_name = excluded.recipient_name,
          phone_number = excluded.phone_number,
          address_line_1 = excluded.address_line_1,
          address_line_2 = excluded.address_line_2,
          address_note = excluded.address_note,
          subdistrict = excluded.subdistrict,
          district = excluded.district,
          province = excluded.province,
          postal_code = excluded.postal_code,
          delivery_note = excluded.delivery_note,
          google_maps_url = excluded.google_maps_url,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          is_default_shipping = excluded.is_default_shipping,
          updated_at = now()
        returning id
      `,
      [
        addressId,
        userId,
        label,
        recipientName,
        phoneNumber,
        addressLine1,
        addressLine2,
        addressNote,
        subdistrict,
        district,
        province,
        postalCode,
        deliveryNote,
        googleMapsUrl,
        coordinates.latitude,
        coordinates.longitude,
        setDefault
      ]
    );

    const savedAddressId = String(result.rows[0].id);

    if (setDefault) {
      await db.query(
        `
          update public.customer_addresses
          set is_default_shipping = case when id = $1::uuid then true else false end,
              updated_at = now()
          where user_id = $2
        `,
        [savedAddressId, userId]
      );
    }

    refreshAccountRoutes();

    return {
      status: "success",
      message: addressId ? "อัปเดตที่อยู่จัดส่งเรียบร้อยแล้ว" : "บันทึกที่อยู่จัดส่งเรียบร้อยแล้ว"
    };
  } catch (error) {
    if (isMissingAddressSchema(error)) {
      return { status: "error", message: getSchemaMessage() };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถบันทึกที่อยู่จัดส่งได้"
    };
  }
}

export async function saveBillingDetailsAction(
  _: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await requireSession();
  const userId = String(session.user.id);

  const billingType = getTextValue(formData, "billingType") || "individual";
  const fullNameOrCompanyName = getTextValue(formData, "fullNameOrCompanyName");
  const taxId = getTextValue(formData, "taxId");
  const branchType = getTextValue(formData, "branchType") || "head_office";
  const branchNumber = getTextValue(formData, "branchNumber");
  const billingPhoneNumber = normalizePhoneNumber(getTextValue(formData, "billingPhoneNumber"));
  const billingEmail = getTextValue(formData, "billingEmail");
  const addressLine1 = getTextValue(formData, "billingAddressLine1");
  const addressLine2 = getTextValue(formData, "billingAddressLine2");
  const addressNote = getTextValue(formData, "billingAddressNote");
  const subdistrict = getTextValue(formData, "billingSubdistrict");
  const district = getTextValue(formData, "billingDistrict");
  const province = getTextValue(formData, "billingProvince");
  const postalCode = getTextValue(formData, "billingPostalCode");
  const sameAsShipping = formData.get("sameAsShipping") === "on";
  const sourceAddressId = getTextValue(formData, "sourceAddressId");
  const billingGoogleMapsUrl = getTextValue(formData, "billingGoogleMapsUrl");
  const billingLatitude = getTextValue(formData, "billingLatitude");
  const billingLongitude = getTextValue(formData, "billingLongitude");

  let finalAddressLine1 = addressLine1;
  let finalAddressLine2 = addressLine2;
  let finalAddressNote = addressNote;
  let finalSubdistrict = subdistrict;
  let finalDistrict = district;
  let finalProvince = province;
  let finalPostalCode = postalCode;
  let finalPhoneNumber = billingPhoneNumber;
  let finalGoogleMapsUrl = billingGoogleMapsUrl;
  let finalLatitude = billingLatitude;
  let finalLongitude = billingLongitude;

  if (!fullNameOrCompanyName) {
    return {
      status: "error",
      message: billingType === "company" ? "กรุณากรอกชื่อบริษัท" : "กรุณากรอกชื่อผู้ขอใบเสร็จ"
    };
  }

  if (billingType === "company" && !isValidTaxId(taxId)) {
    return { status: "error", message: "กรุณากรอกเลขประจำตัวผู้เสียภาษี 13 หลัก" };
  }

  if (branchType === "branch_number" && !branchNumber) {
    return { status: "error", message: "กรุณากรอกเลขที่สาขา" };
  }

  if (sameAsShipping) {
    try {
      const sourceResult = await db.query(
        `
          select
            phone_number,
            address_line_1,
            address_line_2,
            address_note,
            subdistrict,
            district,
            province,
            postal_code,
            google_maps_url,
            latitude,
            longitude
          from public.customer_addresses
          where user_id = $1
            and (($2 <> '' and id = $2::uuid) or ($2 = '' and is_default_shipping = true))
          order by is_default_shipping desc, updated_at desc
          limit 1
        `,
        [userId, sourceAddressId]
      );

      const source = sourceResult.rows[0];

      if (!source) {
        return { status: "error", message: "กรุณาเพิ่มที่อยู่จัดส่งก่อน" };
      }

      finalAddressLine1 = String(source.address_line_1 ?? "");
      finalAddressLine2 = source.address_line_2 ? String(source.address_line_2) : "";
      finalAddressNote = source.address_note ? String(source.address_note) : "";
      finalSubdistrict = String(source.subdistrict ?? "");
      finalDistrict = String(source.district ?? "");
      finalProvince = String(source.province ?? "");
      finalPostalCode = String(source.postal_code ?? "");
      finalPhoneNumber = billingPhoneNumber || String(source.phone_number ?? "");
      finalGoogleMapsUrl = billingGoogleMapsUrl || (source.google_maps_url ? String(source.google_maps_url) : "");
      finalLatitude = billingLatitude || (source.latitude != null ? String(source.latitude) : "");
      finalLongitude = billingLongitude || (source.longitude != null ? String(source.longitude) : "");
    } catch (error) {
      if (isMissingAddressSchema(error)) {
        return { status: "error", message: getSchemaMessage() };
      }

      return {
        status: "error",
        message: error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลที่อยู่จัดส่งได้"
      };
    }
  }

  if (!finalAddressLine1 || !finalSubdistrict || !finalDistrict || !finalProvince || !finalPostalCode) {
    return { status: "error", message: "กรุณากรอกข้อมูลใบเสร็จและภาษีให้ครบถ้วน" };
  }

  if (!isValidThaiPhoneNumber(finalPhoneNumber)) {
    return { status: "error", message: "กรุณาใส่เบอร์โทรศัพท์ให้ถูกต้อง" };
  }

  if (!isValidPostalCode(finalPostalCode)) {
    return { status: "error", message: "กรุณาใส่รหัสไปรษณีย์ 5 หลัก" };
  }

  const mapError = validateOptionalMapInputs({
    googleMapsUrl: finalGoogleMapsUrl,
    latitude: finalLatitude,
    longitude: finalLongitude
  });
  if (mapError) {
    return { status: "error", message: mapError };
  }

  const coordinates = resolveMapCoordinates({
    googleMapsUrl: finalGoogleMapsUrl,
    latitude: finalLatitude,
    longitude: finalLongitude
  });

  try {
    await db.query(
      `
        insert into public.billing_details (
          user_id,
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
        )
        values (
          $1,
          $2,
          $3,
          nullif($4, ''),
          $5,
          case when $5 = 'branch_number' then nullif($6, '') else null end,
          $7,
          nullif($8, ''),
          $9,
          nullif($10, ''),
          nullif($11, ''),
          $12,
          $13,
          $14,
          $15,
          $16,
          nullif($17, '')::uuid,
          nullif($18, ''),
          $19,
          $20
        )
        on conflict (user_id)
        do update set
          billing_type = excluded.billing_type,
          full_name_or_company_name = excluded.full_name_or_company_name,
          tax_id = excluded.tax_id,
          branch_type = excluded.branch_type,
          branch_number = excluded.branch_number,
          billing_phone_number = excluded.billing_phone_number,
          billing_email = excluded.billing_email,
          address_line_1 = excluded.address_line_1,
          address_line_2 = excluded.address_line_2,
          address_note = excluded.address_note,
          subdistrict = excluded.subdistrict,
          district = excluded.district,
          province = excluded.province,
          postal_code = excluded.postal_code,
          same_as_shipping = excluded.same_as_shipping,
          source_address_id = excluded.source_address_id,
          google_maps_url = excluded.google_maps_url,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          updated_at = now()
      `,
      [
        userId,
        billingType,
        fullNameOrCompanyName,
        taxId.replace(/[^\d]/g, ""),
        branchType,
        branchNumber,
        finalPhoneNumber,
        billingEmail,
        finalAddressLine1,
        finalAddressLine2,
        finalAddressNote,
        finalSubdistrict,
        finalDistrict,
        finalProvince,
        finalPostalCode,
        sameAsShipping,
        sameAsShipping ? sourceAddressId : "",
        finalGoogleMapsUrl,
        coordinates.latitude,
        coordinates.longitude
      ]
    );

    refreshAccountRoutes();

    return {
      status: "success",
      message: "บันทึกข้อมูลใบเสร็จและภาษีเรียบร้อยแล้ว"
    };
  } catch (error) {
    if (isMissingAddressSchema(error)) {
      return { status: "error", message: getSchemaMessage() };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลใบเสร็จได้"
    };
  }
}

export async function deleteSavedAddressAction(formData: FormData) {
  const session = await requireSession();
  const userId = String(session.user.id);
  const addressId = getTextValue(formData, "addressId");

  if (!addressId) {
    return;
  }

  try {
    await db.query(`delete from public.customer_addresses where id = $1::uuid and user_id = $2`, [addressId, userId]);
  } catch (error) {
    if (isMissingAddressSchema(error)) {
      return;
    }
    throw error;
  }

  refreshAccountRoutes();
}

export async function setDefaultShippingAddressAction(formData: FormData) {
  const session = await requireSession();
  const userId = String(session.user.id);
  const addressId = getTextValue(formData, "addressId");

  if (!addressId) {
    return;
  }

  try {
    await db.query(
      `
        update public.customer_addresses
        set is_default_shipping = case when id = $1::uuid then true else false end,
            updated_at = now()
        where user_id = $2
      `,
      [addressId, userId]
    );
  } catch (error) {
    if (isMissingAddressSchema(error)) {
      return;
    }
    throw error;
  }

  refreshAccountRoutes();
}

export async function useSavedAddressForBillingAction(formData: FormData) {
  const session = await requireSession();
  const userId = String(session.user.id);
  const addressId = getTextValue(formData, "addressId");

  if (!addressId) {
    return;
  }

  try {
    const sourceResult = await db.query(
      `
        select
          recipient_name,
          phone_number,
          address_line_1,
          address_line_2,
          address_note,
          subdistrict,
          district,
          province,
          postal_code,
          google_maps_url,
          latitude,
          longitude
        from public.customer_addresses
        where id = $1::uuid
          and user_id = $2
        limit 1
      `,
      [addressId, userId]
    );

    const source = sourceResult.rows[0];

    if (!source) {
      return;
    }

    const googleMapsUrl = source.google_maps_url ? String(source.google_maps_url) : "";
    const coordinates = resolveMapCoordinates({
      googleMapsUrl,
      latitude: source.latitude != null ? String(source.latitude) : "",
      longitude: source.longitude != null ? String(source.longitude) : ""
    });

    await db.query(
      `
        insert into public.billing_details (
          user_id,
          billing_type,
          full_name_or_company_name,
          branch_type,
          billing_phone_number,
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
        )
        values (
          $1,
          'individual',
          $2,
          'head_office',
          $3,
          $4,
          nullif($5, ''),
          nullif($6, ''),
          $7,
          $8,
          $9,
          $10,
          true,
          $11::uuid,
          nullif($12, ''),
          $13,
          $14
        )
        on conflict (user_id)
        do update set
          full_name_or_company_name = excluded.full_name_or_company_name,
          billing_phone_number = excluded.billing_phone_number,
          address_line_1 = excluded.address_line_1,
          address_line_2 = excluded.address_line_2,
          address_note = excluded.address_note,
          subdistrict = excluded.subdistrict,
          district = excluded.district,
          province = excluded.province,
          postal_code = excluded.postal_code,
          same_as_shipping = true,
          source_address_id = excluded.source_address_id,
          google_maps_url = excluded.google_maps_url,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          updated_at = now()
      `,
      [
        userId,
        String(source.recipient_name ?? ""),
        String(source.phone_number ?? ""),
        String(source.address_line_1 ?? ""),
        source.address_line_2 ? String(source.address_line_2) : "",
        source.address_note ? String(source.address_note) : "",
        String(source.subdistrict ?? ""),
        String(source.district ?? ""),
        String(source.province ?? ""),
        String(source.postal_code ?? ""),
        addressId,
        googleMapsUrl,
        coordinates.latitude,
        coordinates.longitude
      ]
    );
  } catch (error) {
    if (isMissingAddressSchema(error)) {
      return;
    }
    throw error;
  }

  refreshAccountRoutes();
}
