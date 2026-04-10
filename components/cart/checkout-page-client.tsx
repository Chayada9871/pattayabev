"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { GoogleMapField } from "@/components/account/google-map-field";
import { ResponsiblePurchaseBanner } from "@/components/cart/responsible-purchase-banner";
import { useCart } from "@/components/cart/cart-provider";
import type { BillingDetails, SavedAddress } from "@/lib/addresses";
import {
  BUSINESS_LOCATION_NOTE,
  calculateEstimatedCartWeightKg,
  calculateShippingFee,
  deliveryMethodOptions,
  paymentMethodOptions,
  type DeliveryMethod,
  type PaymentMethod
} from "@/lib/checkout-config";
import { formatPrice } from "@/lib/currency";
import {
  extractGoogleMapCoordinates,
  getResolvedCoordinates,
  isValidGoogleMapsUrl,
  parseLatitude,
  parseLongitude
} from "@/lib/google-maps";
import {
  getDistrictOptionsForProvince,
  getPostalCodeForSubdistrict,
  getSubdistrictOptionsForDistrict,
  getThailandDropdownLabels,
  THAI_PROVINCES
} from "@/lib/thailand-locations";

type ShippingFormState = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
  deliveryNote: string;
};

type BillingFormState = {
  sameAsShipping: boolean;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  requiresTaxInvoice: boolean;
  companyName: string;
  taxId: string;
  branchInfo: string;
};

type CheckoutPageClientProps = {
  savedAddresses?: SavedAddress[];
  defaultShippingAddress?: SavedAddress | null;
  billingDetails?: BillingDetails | null;
  customerEmail?: string;
};

const emptyShippingState: ShippingFormState = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  googleMapsUrl: "",
  latitude: "",
  longitude: "",
  deliveryNote: ""
};

const emptyBillingState: BillingFormState = {
  sameAsShipping: true,
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  phone: "",
  email: "",
  requiresTaxInvoice: false,
  companyName: "",
  taxId: "",
  branchInfo: "สำนักงานใหญ่"
};

function mapSavedAddressToShippingState(address: SavedAddress, customerEmail = ""): ShippingFormState {
  return {
    fullName: address.recipientName,
    phone: address.phoneNumber,
    email: customerEmail,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    subdistrict: address.subdistrict,
    district: address.district,
    province: address.province,
    postalCode: address.postalCode,
    googleMapsUrl: address.googleMapsUrl ?? "",
    latitude: address.latitude != null ? String(address.latitude) : "",
    longitude: address.longitude != null ? String(address.longitude) : "",
    deliveryNote: address.deliveryNote ?? ""
  };
}

function mapBillingDetailsToBillingState(details: BillingDetails): BillingFormState {
  return {
    sameAsShipping: details.sameAsShipping,
    fullName: details.fullNameOrCompanyName,
    addressLine1: details.addressLine1,
    addressLine2: details.addressLine2 ?? "",
    subdistrict: details.subdistrict,
    district: details.district,
    province: details.province,
    postalCode: details.postalCode,
    phone: details.billingPhoneNumber,
    email: details.billingEmail ?? "",
    requiresTaxInvoice: details.billingType === "company" || Boolean(details.taxId),
    companyName: details.billingType === "company" ? details.fullNameOrCompanyName : "",
    taxId: details.taxId ?? "",
    branchInfo: details.branchType === "branch_number" ? details.branchNumber || "สาขา 00001" : "สำนักงานใหญ่"
  };
}

function normalizeDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidThaiPhone(value: string) {
  return /^0\d{8,9}$/.test(normalizeDigits(value));
}

function isValidPostalCode(value: string) {
  return /^\d{5}$/.test(value.trim());
}

function isValidTaxId(value: string) {
  return /^\d{13}$/.test(value.trim());
}

function inputClassName(hasError = false) {
  return [
    "h-11 w-full rounded-md border px-4 text-sm text-[#171212] outline-none transition",
    hasError ? "border-[#d02022] bg-[#fff8f8]" : "border-[#d7d1c7] bg-white",
    "focus:border-[#171212]"
  ].join(" ");
}

function textareaClassName(hasError = false) {
  return [
    "min-h-[92px] w-full border px-4 py-3 text-sm text-[#171212] outline-none transition",
    hasError ? "border-[#d02022] bg-[#fff8f8]" : "border-[#d7d1c7] bg-white",
    "focus:border-[#171212]"
  ].join(" ");
}

function sectionCardClassName() {
  return "border border-[#dcd6cb] bg-white";
}

function sectionTitleClassName() {
  return "border-b border-[#e5dfd5] px-5 py-4 text-[24px] font-extrabold text-[#171212]";
}

function sectionBodyClassName() {
  return "px-5 py-5";
}

export function CheckoutPageClient({
  savedAddresses = [],
  defaultShippingAddress = null,
  billingDetails = null,
  customerEmail = ""
}: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, subtotal, discountAmount, totalPrice, guestId, isReady, clearCart } = useCart();
  const [shipping, setShipping] = useState<ShippingFormState>(emptyShippingState);
  const [billing, setBilling] = useState<BillingFormState>(emptyBillingState);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>(defaultShippingAddress?.id ?? "");
  const [hasInitializedSavedData, setHasInitializedSavedData] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("promptpay");
  const [notes, setNotes] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const estimatedCartWeightKg = useMemo(() => calculateEstimatedCartWeightKg(items), [items]);

  const shippingPricing = useMemo(
    () =>
      calculateShippingFee({
        deliveryMethod,
        province: shipping.province,
        district: shipping.district,
        subdistrict: shipping.subdistrict,
        postalCode: shipping.postalCode,
        totalWeightKg: estimatedCartWeightKg,
        latitude: shipping.latitude,
        longitude: shipping.longitude
      }),
    [
      deliveryMethod,
      estimatedCartWeightKg,
      shipping.district,
      shipping.latitude,
      shipping.longitude,
      shipping.postalCode,
      shipping.province,
      shipping.subdistrict
    ]
  );
  const shippingFee = shippingPricing.fee;
  const grandTotal = totalPrice + shippingFee;
  const provinceOptions = useMemo(() => [...THAI_PROVINCES], []);
  const shippingDistrictOptions = useMemo(() => getDistrictOptionsForProvince(shipping.province), [shipping.province]);
  const shippingSubdistrictOptions = useMemo(
    () => getSubdistrictOptionsForDistrict(shipping.province, shipping.district),
    [shipping.province, shipping.district]
  );
  const billingDistrictOptions = useMemo(() => getDistrictOptionsForProvince(billing.province), [billing.province]);
  const billingSubdistrictOptions = useMemo(
    () => getSubdistrictOptionsForDistrict(billing.province, billing.district),
    [billing.province, billing.district]
  );
  const shippingAreaLabels = useMemo(() => getThailandDropdownLabels(shipping.province), [shipping.province]);
  const billingAreaLabels = useMemo(() => getThailandDropdownLabels(billing.province), [billing.province]);
  const shippingAddressQuery = useMemo(
    () =>
      [
        shipping.addressLine1,
        shipping.addressLine2,
        shipping.subdistrict,
        shipping.district,
        shipping.province,
        shipping.postalCode,
        "Thailand"
      ]
        .filter(Boolean)
        .join(", "),
    [
      shipping.addressLine1,
      shipping.addressLine2,
      shipping.subdistrict,
      shipping.district,
      shipping.province,
      shipping.postalCode
    ]
  );
  const shippingMapCoordinates = useMemo(
    () =>
      getResolvedCoordinates({
        googleMapsUrl: shipping.googleMapsUrl,
        latitude: shipping.latitude,
        longitude: shipping.longitude
      }),
    [shipping.googleMapsUrl, shipping.latitude, shipping.longitude]
  );
  const hasConfirmedShippingLocation =
    shippingMapCoordinates.latitude != null && shippingMapCoordinates.longitude != null;

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
    [items]
  );

  useEffect(() => {
    if (hasInitializedSavedData) {
      return;
    }

    if (defaultShippingAddress) {
      setShipping(mapSavedAddressToShippingState(defaultShippingAddress, customerEmail));
      setSelectedSavedAddressId(defaultShippingAddress.id);
    } else if (customerEmail) {
      setShipping((current) => ({ ...current, email: current.email || customerEmail }));
    }

    if (billingDetails) {
      setBilling(mapBillingDetailsToBillingState(billingDetails));
    }

    setHasInitializedSavedData(true);
  }, [billingDetails, customerEmail, defaultShippingAddress, hasInitializedSavedData]);

  useEffect(() => {
    const postalCode = getPostalCodeForSubdistrict(shipping.province, shipping.district, shipping.subdistrict);
    if (shipping.subdistrict && postalCode && postalCode !== shipping.postalCode) {
      setShipping((current) => ({ ...current, postalCode }));
    }
  }, [shipping.province, shipping.district, shipping.subdistrict, shipping.postalCode]);

  useEffect(() => {
    const postalCode = getPostalCodeForSubdistrict(billing.province, billing.district, billing.subdistrict);
    if (!billing.sameAsShipping && billing.subdistrict && postalCode && postalCode !== billing.postalCode) {
      setBilling((current) => ({ ...current, postalCode }));
    }
  }, [billing.province, billing.district, billing.subdistrict, billing.postalCode, billing.sameAsShipping]);

  const updateShippingMap = (value: string) => {
    const coordinates = extractGoogleMapCoordinates(value);
    setShipping((current) => ({
      ...current,
      googleMapsUrl: value,
      latitude: coordinates.latitude != null ? String(coordinates.latitude) : current.latitude,
      longitude: coordinates.longitude != null ? String(coordinates.longitude) : current.longitude
    }));
  };

  const handleApplySavedAddress = (addressId: string) => {
    const targetAddress = savedAddresses.find((address) => address.id === addressId);

    if (!targetAddress) {
      return;
    }

    setSelectedSavedAddressId(addressId);
    setShipping(mapSavedAddressToShippingState(targetAddress, customerEmail || shipping.email));
  };

  const handleApplySavedBilling = () => {
    if (!billingDetails) {
      return;
    }

    setBilling(mapBillingDetailsToBillingState(billingDetails));
  };

  if (!isReady) {
    return <div className="border border-[#dcd6cb] bg-white p-8 text-sm text-[#6d655d]">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>;
  }

  if (!items.length) {
    return (
      <section className="border border-[#dcd6cb] bg-white p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b6a2b]">Checkout</p>
        <h1 className="mt-3 text-4xl font-extrabold text-[#171212]">ยังไม่มีสินค้าในตะกร้า</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5f5852]">
          กรุณาเลือกสินค้าก่อนเข้าสู่ขั้นตอนจัดส่งและชำระเงิน
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center bg-[#171212] px-8 text-sm font-bold text-white transition hover:bg-[#2b2424]"
          >
            กลับไปเลือกสินค้า
          </Link>
        </div>
      </section>
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!shipping.fullName.trim()) nextErrors.shippingFullName = "กรุณากรอกชื่อผู้รับ";
    if (!shipping.phone.trim() || !isValidThaiPhone(shipping.phone)) nextErrors.shippingPhone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง";
    if (!shipping.email.trim()) nextErrors.shippingEmail = "กรุณากรอกอีเมล";
    if (!shipping.addressLine1.trim()) nextErrors.shippingAddress1 = "กรุณากรอกที่อยู่บรรทัดที่ 1";
    if (!shipping.subdistrict.trim()) nextErrors.shippingSubdistrict = "กรุณาเลือกตำบล / แขวง";
    if (!shipping.district.trim()) nextErrors.shippingDistrict = "กรุณาเลือกอำเภอ / เขต";
    if (!shipping.province.trim()) nextErrors.shippingProvince = "กรุณาเลือกจังหวัด";
    if (!isValidPostalCode(shipping.postalCode)) nextErrors.shippingPostalCode = "กรุณากรอกรหัสไปรษณีย์ 5 หลัก";
    if (shipping.googleMapsUrl.trim() && !isValidGoogleMapsUrl(shipping.googleMapsUrl)) {
      nextErrors.shippingGoogleMapsUrl = "กรุณาวางลิงก์ Google Maps ที่ถูกต้อง";
    }
    if (shipping.latitude.trim() && parseLatitude(shipping.latitude) == null) {
      nextErrors.shippingLatitude = "กรุณากรอกละติจูดให้ถูกต้อง";
    }
    if (shipping.longitude.trim() && parseLongitude(shipping.longitude) == null) {
      nextErrors.shippingLongitude = "กรุณากรอกลองจิจูดให้ถูกต้อง";
    }
    if (!hasConfirmedShippingLocation) {
      nextErrors.shippingLocation = "กรุณาเลือกและยืนยันตำแหน่งปลายทางบนแผนที่ก่อนสั่งซื้อ";
    }

    const billingState = billing.sameAsShipping
      ? {
          fullName: shipping.fullName,
          addressLine1: shipping.addressLine1,
          addressLine2: shipping.addressLine2,
          subdistrict: shipping.subdistrict,
          district: shipping.district,
          province: shipping.province,
          postalCode: shipping.postalCode
        }
      : billing;

    if (!billingState.fullName.trim()) nextErrors.billingFullName = "กรุณากรอกชื่อสำหรับออกเอกสาร";
    if (!billingState.addressLine1.trim()) nextErrors.billingAddress1 = "กรุณากรอกที่อยู่สำหรับออกเอกสาร";
    if (!billingState.subdistrict.trim()) nextErrors.billingSubdistrict = "กรุณาเลือกตำบล / แขวง";
    if (!billingState.district.trim()) nextErrors.billingDistrict = "กรุณาเลือกอำเภอ / เขต";
    if (!billingState.province.trim()) nextErrors.billingProvince = "กรุณาเลือกจังหวัด";
    if (!isValidPostalCode(billingState.postalCode)) nextErrors.billingPostalCode = "กรุณากรอกรหัสไปรษณีย์ 5 หลัก";

    if (billing.requiresTaxInvoice) {
      if (!billing.companyName.trim()) nextErrors.companyName = "กรุณากรอกชื่อบริษัท";
      if (!billing.taxId.trim()) nextErrors.taxId = "กรุณากรอกเลขประจำตัวผู้เสียภาษี";
      else if (!isValidTaxId(billing.taxId)) nextErrors.taxId = "กรุณากรอกเลขประจำตัวผู้เสียภาษี 13 หลัก";
    }

    if (!ageConfirmed) {
      nextErrors.ageConfirmed = "กรุณายืนยันอายุและการสั่งซื้ออย่างมีความรับผิดชอบ";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setErrorMessage("กรุณาตรวจสอบข้อมูลที่กรอกให้ครบถ้วนก่อนสั่งซื้อ");
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setCreatedOrderNumber("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const billingPayload = billing.sameAsShipping
        ? {
            useSameAsShipping: true,
            fullName: shipping.fullName,
            addressLine1: shipping.addressLine1,
            addressLine2: shipping.addressLine2,
            subdistrict: shipping.subdistrict,
            district: shipping.district,
            province: shipping.province,
            postalCode: shipping.postalCode,
            phone: shipping.phone,
            email: shipping.email,
            companyName: billing.companyName,
            taxId: billing.taxId,
            branchInfo: billing.branchInfo,
            requiresTaxInvoice: billing.requiresTaxInvoice
          }
        : {
            useSameAsShipping: false,
            fullName: billing.fullName,
            addressLine1: billing.addressLine1,
            addressLine2: billing.addressLine2,
            subdistrict: billing.subdistrict,
            district: billing.district,
            province: billing.province,
            postalCode: billing.postalCode,
            phone: billing.phone,
            email: billing.email,
            companyName: billing.companyName,
            taxId: billing.taxId,
            branchInfo: billing.branchInfo,
            requiresTaxInvoice: billing.requiresTaxInvoice
          };

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          guestId,
          cartItems: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          })),
          shippingAddress: shipping,
          billingAddress: billingPayload,
          deliveryMethod,
          paymentMethod,
          notes,
          ageConfirmed
        })
      });

      const payload = (await response.json()) as { error?: string; orderNumber?: string };

      if (!response.ok || !payload.orderNumber) {
        throw new Error(payload.error || "ไม่สามารถสร้างคำสั่งซื้อได้");
      }

      setCreatedOrderNumber(payload.orderNumber);
      clearCart();

      const paymentResponse = await fetch("/api/checkout/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderNumber: payload.orderNumber
        })
      });

      const paymentPayload = (await paymentResponse.json()) as {
        error?: string;
        session?: {
          redirectUrl?: string | null;
          redirectPath?: string;
        };
      };

      if (!paymentResponse.ok || !paymentPayload.session) {
        throw new Error(paymentPayload.error || "ไม่สามารถเริ่มขั้นตอนชำระเงินจริงได้");
      }

      if (paymentPayload.session.redirectUrl) {
        window.location.assign(paymentPayload.session.redirectUrl);
        return;
      }

      router.push(paymentPayload.session.redirectPath || `/payment?order=${encodeURIComponent(payload.orderNumber)}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถสร้างคำสั่งซื้อได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 text-[11px] uppercase tracking-[0.12em] text-[#8b6a2b]">หน้าแรก / ชำระเงิน</div>

      <ResponsiblePurchaseBanner />

      {errorMessage ? (
        <div className="mt-5 border border-[#efb8b8] bg-[#fff3f3] px-5 py-4 text-sm text-[#a32024]">
          <p>{errorMessage}</p>
          {createdOrderNumber ? (
            <div className="mt-3">
              <Link
                href={`/payment?order=${encodeURIComponent(createdOrderNumber)}`}
                className="inline-flex h-10 items-center justify-center border border-[#d7b0b0] bg-white px-4 text-xs font-bold text-[#a32024] transition hover:bg-[#fff8f8]"
              >
                ไปหน้าชำระเงินของคำสั่งซื้อนี้
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.95fr_0.95fr]">
        <div className="space-y-4">
          <div className={sectionCardClassName()}>
            <div className={sectionTitleClassName()}>ที่อยู่จัดส่ง</div>
            <div className={sectionBodyClassName()}>
              {savedAddresses.length ? (
                <div className="mb-5 border border-[#e5dfd5] bg-[#faf8f4] px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Saved Address</p>
                      <p className="mt-1 text-sm text-[#5f5852]">เลือกที่อยู่ที่คุณบันทึกไว้จากหน้า account เพื่อเติมฟอร์มอัตโนมัติ</p>
                    </div>
                    {defaultShippingAddress ? (
                      <button
                        type="button"
                        onClick={() => handleApplySavedAddress(defaultShippingAddress.id)}
                        className="inline-flex h-10 items-center justify-center border border-[#d7d1c7] bg-white px-4 text-xs font-bold text-[#171212] transition hover:bg-[#fffdfa]"
                      >
                        ใช้ค่าเริ่มต้น
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3">
                    <select
                      value={selectedSavedAddressId}
                      onChange={(event) => handleApplySavedAddress(event.target.value)}
                      className={inputClassName()}
                    >
                      <option value="">เลือกที่อยู่ที่บันทึกไว้</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {`${address.label} - ${address.recipientName} - ${address.addressLine1}`}
                        </option>
                      ))}
                    </select>

                    {selectedSavedAddressId ? (
                      <p className="text-sm leading-7 text-[#5f5852]">
                        ระบบเติมชื่อผู้รับ ที่อยู่ และตำแหน่งปลายทางให้จากรายการที่บันทึกไว้แล้ว
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <p className="mb-5 text-sm leading-7 text-[#5f5852]">{BUSINESS_LOCATION_NOTE}</p>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  ชื่อผู้รับ *
                  <input
                    value={shipping.fullName}
                    onChange={(event) => setShipping((current) => ({ ...current, fullName: event.target.value }))}
                    className={inputClassName(Boolean(fieldErrors.shippingFullName))}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  เบอร์โทรศัพท์ *
                  <input
                    value={shipping.phone}
                    onChange={(event) => setShipping((current) => ({ ...current, phone: event.target.value }))}
                    className={inputClassName(Boolean(fieldErrors.shippingPhone))}
                    placeholder="08x-xxx-xxxx"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  อีเมล *
                  <input
                    value={shipping.email}
                    onChange={(event) => setShipping((current) => ({ ...current, email: event.target.value }))}
                    className={inputClassName(Boolean(fieldErrors.shippingEmail))}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  ที่อยู่บรรทัดที่ 1 *
                  <input
                    value={shipping.addressLine1}
                    onChange={(event) => setShipping((current) => ({ ...current, addressLine1: event.target.value }))}
                    className={inputClassName(Boolean(fieldErrors.shippingAddress1))}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  ที่อยู่บรรทัดที่ 2
                  <input
                    value={shipping.addressLine2}
                    onChange={(event) => setShipping((current) => ({ ...current, addressLine2: event.target.value }))}
                    className={inputClassName()}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    จังหวัด *
                    <select
                      value={shipping.province}
                      onChange={(event) =>
                        setShipping((current) => ({
                          ...current,
                          province: event.target.value,
                          district: "",
                          subdistrict: "",
                          postalCode: ""
                        }))
                      }
                      className={inputClassName(Boolean(fieldErrors.shippingProvince))}
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinceOptions.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    {shippingAreaLabels.districtLabel} *
                    <select
                      value={shipping.district}
                      onChange={(event) =>
                        setShipping((current) => ({
                          ...current,
                          district: event.target.value,
                          subdistrict: "",
                          postalCode: ""
                        }))
                      }
                      disabled={!shipping.province || shippingDistrictOptions.length === 0}
                      className={inputClassName(Boolean(fieldErrors.shippingDistrict))}
                    >
                      <option value="">{shippingAreaLabels.districtPlaceholder}</option>
                      {shippingDistrictOptions.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    {shippingAreaLabels.subdistrictLabel} *
                    <select
                      value={shipping.subdistrict}
                      onChange={(event) => setShipping((current) => ({ ...current, subdistrict: event.target.value }))}
                      disabled={!shipping.district || shippingSubdistrictOptions.length === 0}
                      className={inputClassName(Boolean(fieldErrors.shippingSubdistrict))}
                    >
                      <option value="">{shippingAreaLabels.subdistrictPlaceholder}</option>
                      {shippingSubdistrictOptions.map((subdistrict) => (
                        <option key={subdistrict} value={subdistrict}>
                          {subdistrict}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    รหัสไปรษณีย์ *
                    <input
                      value={shipping.postalCode}
                      onChange={(event) => setShipping((current) => ({ ...current, postalCode: event.target.value }))}
                      className={inputClassName(Boolean(fieldErrors.shippingPostalCode))}
                      readOnly={Boolean(shipping.subdistrict)}
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  หมายเหตุจัดส่ง
                  <textarea
                    value={shipping.deliveryNote}
                    onChange={(event) => setShipping((current) => ({ ...current, deliveryNote: event.target.value }))}
                    className={textareaClassName()}
                  />
                </label>

                <div className="pt-2">
                  <GoogleMapField
                    label="ยืนยันตำแหน่งปลายทางบนแผนที่ *"
                    googleMapsUrlName="shippingGoogleMapsUrl"
                    googleMapsUrlValue={shipping.googleMapsUrl}
                    latitudeName="shippingLatitude"
                    latitudeValue={shipping.latitude}
                    longitudeName="shippingLongitude"
                    longitudeValue={shipping.longitude}
                    addressQuery={shippingAddressQuery}
                    helperText="เปิดหน้าเลือกตำแหน่งเพื่อค้นหาสถานที่ ใช้ตำแหน่งปัจจุบัน หรือคลิกเลือกจุดส่งสินค้าบนแผนที่"
                    onGoogleMapsUrlChange={updateShippingMap}
                    onLatitudeChange={(value) => setShipping((current) => ({ ...current, latitude: value }))}
                    onLongitudeChange={(value) => setShipping((current) => ({ ...current, longitude: value }))}
                    onClear={() => setShipping((current) => ({ ...current, googleMapsUrl: "", latitude: "", longitude: "" }))}
                  />
                  {fieldErrors.shippingLocation ? <p className="mt-2 text-sm text-[#d02022]">{fieldErrors.shippingLocation}</p> : null}
                  {fieldErrors.shippingGoogleMapsUrl ? (
                    <p className="mt-2 text-sm text-[#d02022]">{fieldErrors.shippingGoogleMapsUrl}</p>
                  ) : null}
                  {fieldErrors.shippingLatitude ? <p className="mt-2 text-sm text-[#d02022]">{fieldErrors.shippingLatitude}</p> : null}
                  {fieldErrors.shippingLongitude ? <p className="mt-2 text-sm text-[#d02022]">{fieldErrors.shippingLongitude}</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <div className={sectionTitleClassName()}>ข้อมูลออกใบกำกับภาษี</div>
            <div className={sectionBodyClassName()}>
              {billingDetails ? (
                <div className="mb-5 border border-[#e5dfd5] bg-[#faf8f4] px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Saved Billing Details</p>
                      <p className="mt-1 text-sm text-[#5f5852]">ใช้ข้อมูลใบกำกับภาษีที่บันทึกไว้ในหน้า account ได้ทันที</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplySavedBilling}
                      className="inline-flex h-10 items-center justify-center border border-[#d7d1c7] bg-white px-4 text-xs font-bold text-[#171212] transition hover:bg-[#fffdfa]"
                    >
                      ใช้ข้อมูลที่บันทึกไว้
                    </button>
                  </div>
                </div>
              ) : null}

              <label className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#171212]">
                <input
                  type="checkbox"
                  checked={billing.sameAsShipping}
                  onChange={(event) => setBilling((current) => ({ ...current, sameAsShipping: event.target.checked }))}
                />
                ใช้ที่อยู่เดียวกับที่อยู่จัดส่ง
              </label>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  ชื่อสำหรับออกเอกสาร *
                  <input
                    value={billing.fullName}
                    onChange={(event) => setBilling((current) => ({ ...current, fullName: event.target.value }))}
                    className={inputClassName(Boolean(fieldErrors.billingFullName))}
                    disabled={billing.sameAsShipping}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  ที่อยู่บรรทัดที่ 1 *
                  <input
                    value={billing.addressLine1}
                    onChange={(event) => setBilling((current) => ({ ...current, addressLine1: event.target.value }))}
                    className={inputClassName(Boolean(fieldErrors.billingAddress1))}
                    disabled={billing.sameAsShipping}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  ที่อยู่บรรทัดที่ 2
                  <input
                    value={billing.addressLine2}
                    onChange={(event) => setBilling((current) => ({ ...current, addressLine2: event.target.value }))}
                    className={inputClassName()}
                    disabled={billing.sameAsShipping}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    จังหวัด *
                    <select
                      value={billing.province}
                      onChange={(event) =>
                        setBilling((current) => ({
                          ...current,
                          province: event.target.value,
                          district: "",
                          subdistrict: "",
                          postalCode: ""
                        }))
                      }
                      disabled={billing.sameAsShipping}
                      className={inputClassName(Boolean(fieldErrors.billingProvince))}
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinceOptions.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    {billingAreaLabels.districtLabel} *
                    <select
                      value={billing.district}
                      onChange={(event) =>
                        setBilling((current) => ({
                          ...current,
                          district: event.target.value,
                          subdistrict: "",
                          postalCode: ""
                        }))
                      }
                      disabled={billing.sameAsShipping || !billing.province || billingDistrictOptions.length === 0}
                      className={inputClassName(Boolean(fieldErrors.billingDistrict))}
                    >
                      <option value="">{billingAreaLabels.districtPlaceholder}</option>
                      {billingDistrictOptions.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    {billingAreaLabels.subdistrictLabel} *
                    <select
                      value={billing.subdistrict}
                      onChange={(event) => setBilling((current) => ({ ...current, subdistrict: event.target.value }))}
                      disabled={billing.sameAsShipping || !billing.district || billingSubdistrictOptions.length === 0}
                      className={inputClassName(Boolean(fieldErrors.billingSubdistrict))}
                    >
                      <option value="">{billingAreaLabels.subdistrictPlaceholder}</option>
                      {billingSubdistrictOptions.map((subdistrict) => (
                        <option key={subdistrict} value={subdistrict}>
                          {subdistrict}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                    รหัสไปรษณีย์ *
                    <input
                      value={billing.postalCode}
                      onChange={(event) => setBilling((current) => ({ ...current, postalCode: event.target.value }))}
                      className={inputClassName(Boolean(fieldErrors.billingPostalCode))}
                      disabled={billing.sameAsShipping}
                      readOnly={Boolean(billing.subdistrict)}
                    />
                  </label>
                </div>

                <label className="flex items-center gap-3 border border-[#e5dfd5] bg-[#faf8f4] px-4 py-3 text-sm font-semibold text-[#171212]">
                  <input
                    type="checkbox"
                    checked={billing.requiresTaxInvoice}
                    onChange={(event) => setBilling((current) => ({ ...current, requiresTaxInvoice: event.target.checked }))}
                  />
                  ต้องการออกใบกำกับภาษี
                </label>

                {billing.requiresTaxInvoice ? (
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                      ชื่อบริษัท *
                      <input
                        value={billing.companyName}
                        onChange={(event) => setBilling((current) => ({ ...current, companyName: event.target.value }))}
                        className={inputClassName(Boolean(fieldErrors.companyName))}
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                        เลขประจำตัวผู้เสียภาษี *
                        <input
                          value={billing.taxId}
                          onChange={(event) => setBilling((current) => ({ ...current, taxId: event.target.value }))}
                          className={inputClassName(Boolean(fieldErrors.taxId))}
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                        สาขา
                        <select
                          value={billing.branchInfo}
                          onChange={(event) => setBilling((current) => ({ ...current, branchInfo: event.target.value }))}
                          className={inputClassName()}
                        >
                          <option value="สำนักงานใหญ่">สำนักงานใหญ่</option>
                          <option value="สาขา 00001">สาขา 00001</option>
                          <option value="สาขา 00002">สาขา 00002</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={sectionCardClassName()}>
            <div className={sectionTitleClassName()}>ช่องทางการจัดส่ง</div>
            <div className={sectionBodyClassName()}>
              <div className="grid gap-3">
                {(Object.keys(deliveryMethodOptions) as DeliveryMethod[]).map((method) => {
                  const option = deliveryMethodOptions[method];
                  const selected = deliveryMethod === method;
                  const optionPricing = calculateShippingFee({
                    deliveryMethod: method,
                    province: shipping.province,
                    district: shipping.district,
                    subdistrict: shipping.subdistrict,
                    postalCode: shipping.postalCode,
                    totalWeightKg: estimatedCartWeightKg,
                    latitude: shipping.latitude,
                    longitude: shipping.longitude
                  });

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDeliveryMethod(method)}
                      className={`border px-4 py-4 text-left transition ${
                        selected
                          ? "border-black bg-black text-white"
                          : "border-[#d7d1c7] bg-white text-[#171212] hover:border-black"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold uppercase tracking-[0.05em]">{option.label}</p>
                          <p className={`mt-1 text-xs leading-6 ${selected ? "text-white/80" : "text-[#5f5852]"}`}>{option.estimate}</p>
                        </div>
                        <p className="text-sm font-extrabold">{formatPrice(optionPricing.fee)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-[#e5dfd5] pt-4 text-sm text-[#5f5852]">
                {shippingPricing.hasDestination ? (
                  <div className="space-y-1">
                    <p>คำนวณค่าจัดส่งตามปลายทาง: {shippingPricing.zoneLabel}</p>
                    <p>น้ำหนักรวมโดยประมาณ: {shippingPricing.estimatedWeightKg.toFixed(2)} กก.</p>
                    {shippingPricing.distanceKm != null ? (
                      <p>ระยะทางโดยประมาณจากจุดจัดส่งพัทยา: {shippingPricing.distanceKm.toFixed(1)} กม.</p>
                    ) : null}
                    <p>{shippingPricing.pricingNote}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p>เลือกจังหวัด อำเภอ และตำบล เพื่อคำนวณค่าจัดส่งอัตโนมัติ</p>
                    <p>น้ำหนักรวมโดยประมาณ: {estimatedCartWeightKg.toFixed(2)} กก.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <div className={sectionTitleClassName()}>ช่องทางการชำระเงิน</div>
            <div className={sectionBodyClassName()}>
              <div className="grid gap-3">
                {(Object.keys(paymentMethodOptions) as PaymentMethod[])
                  .filter((method) => paymentMethodOptions[method].enabled)
                  .map((method) => {
                    const option = paymentMethodOptions[method];
                    const selected = paymentMethod === method;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`border px-4 py-4 text-left transition ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-[#d7d1c7] bg-white text-[#171212] hover:border-black"
                        }`}
                      >
                        <p className="text-sm font-extrabold uppercase tracking-[0.05em]">{option.label}</p>
                        <p className={`mt-1 text-xs leading-6 ${selected ? "text-white/80" : "text-[#5f5852]"}`}>{option.description}</p>
                      </button>
                    );
                  })}
              </div>

              <div className="mt-5 border-t border-[#e5dfd5] pt-5">
                <label className="grid gap-2 text-sm font-semibold text-[#171212]">
                  หมายเหตุคำสั่งซื้อ
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className={textareaClassName()} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <aside className="border border-[#dcd6cb] bg-[#f8f8f8] shadow-[0_10px_24px_rgba(0,0,0,0.04)] xl:sticky xl:top-6 xl:h-fit">
          <div className="border-b border-[#e1ddd5] px-5 py-4">
            <h2 className="text-[24px] font-extrabold text-[#171212]">รายการสินค้าของคุณ</h2>
            <p className="mt-2 text-sm text-[#5f5852]">{summaryItems.length} รายการสั่งซื้อ</p>
          </div>

          <div className="divide-y divide-[#e1ddd5]">
            {summaryItems.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold uppercase tracking-[0.03em] text-[#171212]">{item.name}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#5f5852]">QTY: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold text-[#171212]">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-[#e1ddd5] px-5 py-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">ราคาสินค้า</span>
              <span className="font-semibold text-[#171212]">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">ส่วนลด</span>
              <span className="font-semibold text-[#b3171f]">
                {discountAmount > 0 ? `- ${formatPrice(discountAmount)}` : formatPrice(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">น้ำหนักรวมโดยประมาณ</span>
              <span className="font-semibold text-[#171212]">{estimatedCartWeightKg.toFixed(2)} กก.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5f5852]">
                ค่าจัดส่ง{shippingPricing.hasDestination ? ` (${shippingPricing.zoneLabel})` : ""}
              </span>
              <span className="font-semibold text-[#171212]">{formatPrice(shippingFee)}</span>
            </div>
            {shippingPricing.distanceKm != null ? (
              <div className="flex items-center justify-between">
                <span className="text-[#5f5852]">ระยะทางโดยประมาณ</span>
                <span className="font-semibold text-[#171212]">{shippingPricing.distanceKm.toFixed(1)} กม.</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-[#e1ddd5] pt-4">
              <span className="text-base font-extrabold text-[#171212]">รวมทั้งหมด</span>
              <span className="text-2xl font-extrabold text-[#171212]">{formatPrice(grandTotal)}</span>
            </div>

            <label className="flex items-start gap-3 border-t border-[#e1ddd5] pt-4 text-sm leading-7 text-[#171212]">
              <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} className="mt-1" />
              <span>
                ฉันยืนยันว่ามีอายุ 20 ปีขึ้นไป และเข้าใจข้อกำหนดในการสั่งซื้อสินค้าประเภทควบคุม
                {fieldErrors.ageConfirmed ? <span className="mt-1 block text-[#d02022]">{fieldErrors.ageConfirmed}</span> : null}
              </span>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`inline-flex h-12 w-full items-center justify-center text-sm font-bold text-white transition ${
                isSubmitting ? "cursor-not-allowed bg-[#b9b0a6]" : "bg-[#a61b1f] hover:bg-[#8c171b]"
              }`}
            >
              {isSubmitting ? "กำลังสร้างคำสั่งซื้อ..." : "สั่งซื้อสินค้า"}
            </button>

            <Link
              href="/cart"
              className="inline-flex h-11 w-full items-center justify-center border border-[#d7d1c7] bg-white text-sm font-bold text-[#171212] transition hover:bg-[#faf7f1]"
            >
              กลับไปแก้ไขตะกร้า
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
