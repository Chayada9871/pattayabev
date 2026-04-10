"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  deleteSavedAddressAction,
  saveBillingDetailsAction,
  saveShippingAddressAction,
  setDefaultShippingAddressAction,
  useSavedAddressForBillingAction,
  type AddressFormState
} from "@/app/account/address-actions";
import { GoogleMapField } from "@/components/account/google-map-field";
import type { BillingDetails, SavedAddress, SavedAddressLabel } from "@/lib/addresses";
import { extractGoogleMapCoordinates } from "@/lib/google-maps";
import {
  getDistrictOptionsForProvince,
  getPostalCodeForSubdistrict,
  getSubdistrictOptionsForDistrict,
  getThailandDropdownLabels,
  THAI_PROVINCES
} from "@/lib/thailand-locations";

const initialState: AddressFormState = { status: "idle", message: "" };
const cardClass =
  "border border-[#dcd6cb] bg-white p-6 lg:p-7";
const inputClass =
  "h-11 w-full rounded-md border border-[#d7d1c7] bg-white px-3 text-sm text-[#171212] outline-none transition focus:border-[#171212] disabled:cursor-not-allowed disabled:bg-[#f8f5ef] read-only:bg-[#f8f5ef]";

type ShippingFormValue = {
  addressId: string;
  label: SavedAddressLabel;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  addressNote: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
  deliveryNote: string;
  setDefaultShipping: boolean;
};

type BillingFormValue = {
  billingType: "individual" | "company";
  fullNameOrCompanyName: string;
  taxId: string;
  branchType: "head_office" | "branch_number";
  branchNumber: string;
  billingPhoneNumber: string;
  billingEmail: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingAddressNote: string;
  billingSubdistrict: string;
  billingDistrict: string;
  billingProvince: string;
  billingPostalCode: string;
  billingGoogleMapsUrl: string;
  billingLatitude: string;
  billingLongitude: string;
  sameAsShipping: boolean;
  sourceAddressId: string;
};

const addressLabels: SavedAddressLabel[] = ["Home", "Office", "Warehouse", "Other"];

function addressLabelText(label: SavedAddressLabel) {
  return { Home: "บ้าน", Office: "ออฟฟิศ", Warehouse: "คลังสินค้า", Other: "อื่น ๆ" }[label];
}

function toOptions(items: readonly string[]) {
  return items.map((value) => ({ label: value, value }));
}

function shippingValue(address?: SavedAddress | null): ShippingFormValue {
  return {
    addressId: address?.id ?? "",
    label: address?.label ?? "Home",
    recipientName: address?.recipientName ?? "",
    phoneNumber: address?.phoneNumber ?? "",
    addressLine1: address?.addressLine1 ?? "",
    addressLine2: address?.addressLine2 ?? "",
    addressNote: address?.addressNote ?? "",
    subdistrict: address?.subdistrict ?? "",
    district: address?.district ?? "",
    province: address?.province ?? "",
    postalCode: address?.postalCode ?? "",
    googleMapsUrl: address?.googleMapsUrl ?? "",
    latitude: address?.latitude != null ? String(address.latitude) : "",
    longitude: address?.longitude != null ? String(address.longitude) : "",
    deliveryNote: address?.deliveryNote ?? "",
    setDefaultShipping: address?.isDefaultShipping ?? false
  };
}

function billingValue(billing?: BillingDetails | null, shipping?: SavedAddress | null): BillingFormValue {
  return {
    billingType: billing?.billingType ?? "individual",
    fullNameOrCompanyName: billing?.fullNameOrCompanyName ?? "",
    taxId: billing?.taxId ?? "",
    branchType: billing?.branchType ?? "head_office",
    branchNumber: billing?.branchNumber ?? "",
    billingPhoneNumber: billing?.billingPhoneNumber ?? shipping?.phoneNumber ?? "",
    billingEmail: billing?.billingEmail ?? "",
    billingAddressLine1: billing?.addressLine1 ?? "",
    billingAddressLine2: billing?.addressLine2 ?? "",
    billingAddressNote: billing?.addressNote ?? "",
    billingSubdistrict: billing?.subdistrict ?? "",
    billingDistrict: billing?.district ?? "",
    billingProvince: billing?.province ?? "",
    billingPostalCode: billing?.postalCode ?? "",
    billingGoogleMapsUrl: billing?.googleMapsUrl ?? "",
    billingLatitude: billing?.latitude != null ? String(billing.latitude) : "",
    billingLongitude: billing?.longitude != null ? String(billing.longitude) : "",
    sameAsShipping: billing?.sameAsShipping ?? false,
    sourceAddressId: billing?.sourceAddressId ?? shipping?.id ?? ""
  };
}

function SubmitButton({ children, disabled = false }: { children: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex h-11 items-center justify-center bg-[#171212] px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#2d2521] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "กำลังบันทึก..." : children}
    </button>
  );
}

function ActionButton({ children, onClick, variant = "secondary" }: { children: string; onClick: () => void; variant?: "secondary" | "ghost" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center px-5 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
        variant === "ghost"
          ? "border border-transparent text-[#7a7064] hover:bg-[#faf7f1] hover:text-[#171212]"
          : "border border-[#d8cec0] bg-white text-[#171212] hover:bg-[#faf7f1]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, name, value, onChange, placeholder, helperText, required = false, readOnly = false, type = "text" }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder?: string; helperText?: string; required?: boolean; readOnly?: boolean; type?: string; }) {
  return (
    <label className="grid gap-2 text-sm text-[#4f4943]">
      <span className="font-semibold text-[#171212]">{label}{required ? <span className="ml-1 text-[#c04f38]">*</span> : null}</span>
      <input type={type} name={name} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} readOnly={readOnly} className={inputClass} />
      {helperText ? <span className="text-xs leading-6 text-[#7a7064]">{helperText}</span> : null}
    </label>
  );
}

function TextArea({ label, name, value, onChange, placeholder }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder?: string; }) {
  return (
    <label className="grid gap-2 text-sm text-[#4f4943]">
      <span className="font-semibold text-[#171212]">{label}</span>
      <textarea name={name} value={value} rows={3} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-[#ded5c8] bg-white px-4 py-3 text-sm text-[#171212] outline-none transition focus:border-[#c79c62] focus:ring-2 focus:ring-[#f1dfc0]" />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder, helperText, required = false, disabled = false }: { label: string; name: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; placeholder: string; helperText?: string; required?: boolean; disabled?: boolean; }) {
  return (
    <label className="grid gap-2 text-sm text-[#4f4943]">
      <span className="font-semibold text-[#171212]">{label}{required ? <span className="ml-1 text-[#c04f38]">*</span> : null}</span>
      <select name={name} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={inputClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {helperText ? <span className="text-xs leading-6 text-[#7a7064]">{helperText}</span> : null}
    </label>
  );
}

function Block({ eyebrow, title, description: _description, children }: { eyebrow: string; title: string; description: string; children: ReactNode; }) {
  return (
    <div className="grid gap-4 border-t border-[#ece5db] pt-5 first:border-t-0 first:pt-0">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8b6a2b]">{eyebrow}</p>
        <h4 className="mt-2 text-lg font-extrabold text-[#171212]">{title}</h4>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Status({ state }: { state: AddressFormState }) {
  if (!state.message) return null;
  return <p className={`text-sm ${state.status === "error" ? "text-[#c04f38]" : "text-[#217148]"}`}>{state.message}</p>;
}

function AddressSummary({ address }: { address: SavedAddress }) {
  return (
    <div className="grid gap-2 text-sm leading-6 text-[#4f4943]">
      <p className="font-semibold text-[#171212]">{address.recipientName}</p>
      <p>{address.phoneNumber}</p>
      <p>{address.addressLine1}</p>
      {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
      {address.addressNote ? <p>จุดสังเกต: {address.addressNote}</p> : null}
      <p>{address.subdistrict} / {address.district}</p>
      <p>{address.province} {address.postalCode}</p>
      {address.deliveryNote ? <p>หมายเหตุจัดส่ง: {address.deliveryNote}</p> : null}
      {address.googleMapsUrl || (address.latitude != null && address.longitude != null) ? (
        <span className="inline-flex w-fit rounded-full bg-[#edf7ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#217148]">มีตำแหน่งบนแผนที่</span>
      ) : null}
    </div>
  );
}

function BillingSummary({ billingDetails }: { billingDetails: BillingDetails }) {
  return (
    <div className="grid gap-2 text-sm leading-6 text-[#4f4943]">
      <p className="font-semibold text-[#171212]">{billingDetails.fullNameOrCompanyName}</p>
      <p>ประเภท: {billingDetails.billingType === "company" ? "บริษัท / ธุรกิจ" : "บุคคลทั่วไป"}</p>
      {billingDetails.taxId ? <p>เลขผู้เสียภาษี: {billingDetails.taxId}</p> : null}
      <p>สาขา: {billingDetails.branchType === "head_office" ? "สำนักงานใหญ่" : `สาขา ${billingDetails.branchNumber ?? "-"}`}</p>
      <p>{billingDetails.billingPhoneNumber}</p>
      {billingDetails.billingEmail ? <p>{billingDetails.billingEmail}</p> : null}
      <p>{billingDetails.addressLine1}</p>
      {billingDetails.addressLine2 ? <p>{billingDetails.addressLine2}</p> : null}
      {billingDetails.addressNote ? <p>จุดสังเกต: {billingDetails.addressNote}</p> : null}
      <p>{billingDetails.subdistrict} / {billingDetails.district}</p>
      <p>{billingDetails.province} {billingDetails.postalCode}</p>
      {billingDetails.googleMapsUrl || (billingDetails.latitude != null && billingDetails.longitude != null) ? (
        <span className="inline-flex w-fit rounded-full bg-[#edf7ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#217148]">มีตำแหน่งบนแผนที่</span>
      ) : null}
    </div>
  );
}

export function AddressSection(props: {
  schemaReady: boolean;
  defaultShippingAddress: SavedAddress | null;
  savedAddresses: SavedAddress[];
  billingDetails: BillingDetails | null;
}) {
  const { schemaReady, defaultShippingAddress, savedAddresses, billingDetails } = props;
  const [shippingState, shippingAction] = useFormState(saveShippingAddressAction, initialState);
  const [billingState, billingAction] = useFormState(saveBillingDetailsAction, initialState);
  const [showShippingForm, setShowShippingForm] = useState(savedAddresses.length === 0);
  const [showBillingForm, setShowBillingForm] = useState(!billingDetails);
  const [shipping, setShipping] = useState(() => shippingValue(defaultShippingAddress));
  const [billing, setBilling] = useState(() => billingValue(billingDetails, defaultShippingAddress));

  useEffect(() => {
    if (shippingState.status === "success") setShowShippingForm(false);
  }, [shippingState.status]);

  useEffect(() => {
    if (billingState.status === "success") setShowBillingForm(false);
  }, [billingState.status]);

  useEffect(() => {
    setShipping(shippingValue(defaultShippingAddress));
  }, [defaultShippingAddress?.id]);

  useEffect(() => {
    setBilling(billingValue(billingDetails, defaultShippingAddress));
  }, [billingDetails?.id, defaultShippingAddress?.id]);

  const provinces = useMemo(() => toOptions(THAI_PROVINCES), []);
  const shippingLabels = useMemo(() => getThailandDropdownLabels(shipping.province), [shipping.province]);
  const billingLabels = useMemo(() => getThailandDropdownLabels(billing.billingProvince), [billing.billingProvince]);
  const shippingDistricts = useMemo(() => toOptions(getDistrictOptionsForProvince(shipping.province)), [shipping.province]);
  const shippingSubdistricts = useMemo(() => toOptions(getSubdistrictOptionsForDistrict(shipping.province, shipping.district)), [shipping.province, shipping.district]);
  const billingDistricts = useMemo(() => toOptions(getDistrictOptionsForProvince(billing.billingProvince)), [billing.billingProvince]);
  const billingSubdistricts = useMemo(() => toOptions(getSubdistrictOptionsForDistrict(billing.billingProvince, billing.billingDistrict)), [billing.billingProvince, billing.billingDistrict]);
  const savedAddressOptions = useMemo(() => savedAddresses.map((address) => ({ label: `${addressLabelText(address.label)} - ${address.recipientName}`, value: address.id })), [savedAddresses]);

  useEffect(() => {
    const postal = getPostalCodeForSubdistrict(shipping.province, shipping.district, shipping.subdistrict);
    if (shipping.subdistrict && postal && postal !== shipping.postalCode) {
      setShipping((current) => ({ ...current, postalCode: postal }));
    }
  }, [shipping.province, shipping.district, shipping.subdistrict, shipping.postalCode]);

  useEffect(() => {
    const postal = getPostalCodeForSubdistrict(billing.billingProvince, billing.billingDistrict, billing.billingSubdistrict);
    if (billing.billingSubdistrict && postal && postal !== billing.billingPostalCode) {
      setBilling((current) => ({ ...current, billingPostalCode: postal }));
    }
  }, [billing.billingProvince, billing.billingDistrict, billing.billingSubdistrict, billing.billingPostalCode]);

  const shippingAddressQuery = useMemo(() => [shipping.addressLine1, shipping.addressLine2, shipping.addressNote, shipping.subdistrict, shipping.district, shipping.province, shipping.postalCode, "Thailand"].filter(Boolean).join(", "), [shipping.addressLine1, shipping.addressLine2, shipping.addressNote, shipping.subdistrict, shipping.district, shipping.province, shipping.postalCode]);
  const updateShippingMap = (value: string) => {
    const coords = extractGoogleMapCoordinates(value);
    setShipping((current) => ({ ...current, googleMapsUrl: value, latitude: coords.latitude != null ? String(coords.latitude) : current.latitude, longitude: coords.longitude != null ? String(coords.longitude) : current.longitude }));
  };

  const shippingDistrictHint = !shipping.province ? "กรุณาเลือกจังหวัดก่อน" : !shippingDistricts.length ? "จังหวัดนี้ยังไม่มีข้อมูลอำเภอในชุดข้อมูลปัจจุบัน" : undefined;
  const shippingSubdistrictHint = !shipping.district ? `กรุณาเลือก${shippingLabels.districtLabel}ก่อน` : !shippingSubdistricts.length ? "อำเภอหรือเขตนี้ยังไม่มีข้อมูลตำบลในชุดข้อมูลปัจจุบัน" : undefined;
  const billingDistrictHint = !billing.billingProvince ? "กรุณาเลือกจังหวัดก่อน" : !billingDistricts.length ? "จังหวัดนี้ยังไม่มีข้อมูลอำเภอในชุดข้อมูลปัจจุบัน" : undefined;
  const billingSubdistrictHint = !billing.billingDistrict ? `กรุณาเลือก${billingLabels.districtLabel}ก่อน` : !billingSubdistricts.length ? "อำเภอหรือเขตนี้ยังไม่มีข้อมูลตำบลในชุดข้อมูลปัจจุบัน" : undefined;

  return (
    <section id="addresses" className="overflow-hidden border border-[#dcd6cb] bg-white">
      <div className="border-b border-[#e5dfd5] bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_100%)] px-6 py-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8b6a2b]">Address Center</p>
        <h2 className="mt-2 text-[30px] font-extrabold leading-tight text-[#171212]">ที่อยู่ของฉัน</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5f5852]">จัดการที่อยู่จัดส่ง ข้อมูลใบเสร็จ และจุดรับสินค้าในหน้าเดียว</p>
      </div>

      <div className="px-6 py-6">

      {!schemaReady ? (
        <div className="mb-5 flex items-start gap-3 border border-[#d98a2c] bg-[linear-gradient(135deg,#fff6ea_0%,#fffdfa_100%)] px-4 py-4 text-sm leading-7 text-[#6b5a45]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#d98a2c]">!</span>
          <div>
            <p className="font-bold text-[#7b5524]">ต้องอัปเดตฐานข้อมูลก่อนใช้งานส่วนที่อยู่</p>
            <p>กรุณารัน <code className="rounded bg-white px-1 py-0.5">supabase/create-account-addresses.sql</code> และถ้าใช้ฐานข้อมูลเดิมให้รัน <code className="rounded bg-white px-1 py-0.5">supabase/add-address-map-fields.sql</code> กับ <code className="rounded bg-white px-1 py-0.5">supabase/add-address-note-fields.sql</code></p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6">
        <article className={cardClass}>
          <div className="flex items-start justify-between gap-4 border-b border-[#ece5db] pb-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Shipping Address</p>
              <h3 className="mt-2 text-2xl font-extrabold text-[#171212]">ที่อยู่จัดส่ง</h3>
              <p className="mt-2 text-sm leading-6 text-[#5f5852]">ใช้สำหรับจัดส่งสินค้า</p>
            </div>
            <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[#eadfce] bg-[#fff8ef] text-xl">🚚</div>
          </div>

          {defaultShippingAddress && !showShippingForm ? (
            <div className="mt-5 border border-[#dcd6cb] bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#f4efe7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7d5930]">{addressLabelText(defaultShippingAddress.label)}</span>
                {defaultShippingAddress.isDefaultShipping ? <span className="rounded-full bg-[#edf7ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#217148]">ค่าเริ่มต้น</span> : null}
              </div>
              <AddressSummary address={defaultShippingAddress} />
              <div className="mt-4 flex flex-wrap gap-3">
                <ActionButton onClick={() => { setShipping(shippingValue(defaultShippingAddress)); setShowShippingForm(true); }}>แก้ไขที่อยู่</ActionButton>
                {!defaultShippingAddress.isDefaultShipping ? <form action={setDefaultShippingAddressAction}><input type="hidden" name="addressId" value={defaultShippingAddress.id} /><SubmitButton>ตั้งเป็นค่าเริ่มต้น</SubmitButton></form> : null}
              </div>
            </div>
          ) : (
            <div className="mt-5">
              {!defaultShippingAddress ? <><p className="text-base font-bold text-[#171212]">ยังไม่มีที่อยู่จัดส่ง</p><p className="mt-2 text-sm leading-7 text-[#5f5852]">เพิ่มข้อมูลผู้รับและตำแหน่งปลายทางเพื่อให้ใช้งานได้สะดวกขึ้นในครั้งถัดไป</p></> : null}
              <form action={shippingAction} className="mt-4 grid gap-5">
                <Block eyebrow="Recipient" title="ข้อมูลผู้รับ" description="กรอกข้อมูลผู้รับและเลือกประเภทที่อยู่เพื่อจัดเก็บในสมุดที่อยู่">
                  <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                    <SelectField label="ประเภทที่อยู่" name="label" value={shipping.label} onChange={(value) => setShipping((current) => ({ ...current, label: value as SavedAddressLabel }))} options={addressLabels.map((label) => ({ label: addressLabelText(label), value: label }))} placeholder="เลือกประเภทที่อยู่" />
                    <Field label="ชื่อผู้รับ" name="recipientName" value={shipping.recipientName} onChange={(value) => setShipping((current) => ({ ...current, recipientName: value }))} required />
                  </div>
                  <Field label="เบอร์โทรศัพท์" name="phoneNumber" value={shipping.phoneNumber} onChange={(value) => setShipping((current) => ({ ...current, phoneNumber: value }))} placeholder="08x-xxx-xxxx" required />
                </Block>

                <Block eyebrow="Address" title="รายละเอียดที่อยู่" description="เลือก จังหวัด อำเภอ/เขต และตำบล/แขวง ทีละขั้นตอน จากนั้นระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ">
                  <Field label="บ้านเลขที่ / หมู่ / อาคาร / ชั้น / ห้อง / ซอย / ถนน" name="addressLine1" value={shipping.addressLine1} onChange={(value) => setShipping((current) => ({ ...current, addressLine1: value }))} required />
                  <Field label="ที่อยู่เพิ่มเติม (ถ้ามี)" name="addressLine2" value={shipping.addressLine2} onChange={(value) => setShipping((current) => ({ ...current, addressLine2: value }))} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="จังหวัด" name="province" value={shipping.province} onChange={(value) => setShipping((current) => ({ ...current, province: value, district: "", subdistrict: "", postalCode: "" }))} options={provinces} placeholder="เลือกจังหวัด" required />
                    <SelectField label={shippingLabels.districtLabel} name="district" value={shipping.district} onChange={(value) => setShipping((current) => ({ ...current, district: value, subdistrict: "", postalCode: "" }))} options={shippingDistricts} placeholder={shippingLabels.districtPlaceholder} helperText={shippingDistrictHint} disabled={!shipping.province || !shippingDistricts.length} required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                    <SelectField label={shippingLabels.subdistrictLabel} name="subdistrict" value={shipping.subdistrict} onChange={(value) => setShipping((current) => ({ ...current, subdistrict: value }))} options={shippingSubdistricts} placeholder={shippingLabels.subdistrictPlaceholder} helperText={shippingSubdistrictHint} disabled={!shipping.district || !shippingSubdistricts.length} required />
                    <Field label="รหัสไปรษณีย์" name="postalCode" value={shipping.postalCode} onChange={(value) => setShipping((current) => ({ ...current, postalCode: value }))} placeholder="10110" helperText={shipping.subdistrict ? "ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ" : undefined} readOnly={Boolean(shipping.subdistrict)} required />
                  </div>
                  <Field label="จุดสังเกตเพิ่มเติม" name="addressNote" value={shipping.addressNote} onChange={(value) => setShipping((current) => ({ ...current, addressNote: value }))} placeholder="เช่น ใกล้ป้อมยาม หรืออยู่ตรงข้ามร้านสะดวกซื้อ" />
                </Block>

                <Block eyebrow="Map" title="ตำแหน่งปลายทางบนแผนที่" description="เพิ่มตำแหน่ง Google Maps เพื่อช่วยให้พนักงานจัดส่งค้นหาปลายทางได้ง่ายและแม่นยำมากขึ้น">
                  <GoogleMapField label="เลือกตำแหน่งปลายทางบนแผนที่" googleMapsUrlName="googleMapsUrl" googleMapsUrlValue={shipping.googleMapsUrl} latitudeName="latitude" latitudeValue={shipping.latitude} longitudeName="longitude" longitudeValue={shipping.longitude} addressQuery={shippingAddressQuery} helperText="เปิดหน้าเลือกตำแหน่งเพื่อค้นหาสถานที่ ใช้ตำแหน่งปัจจุบัน หรือคลิกเลือกจุดบนแผนที่" onGoogleMapsUrlChange={updateShippingMap} onLatitudeChange={(value) => setShipping((current) => ({ ...current, latitude: value }))} onLongitudeChange={(value) => setShipping((current) => ({ ...current, longitude: value }))} onClear={() => setShipping((current) => ({ ...current, googleMapsUrl: "", latitude: "", longitude: "" }))} />
                  <TextArea label="หมายเหตุสำหรับจัดส่ง" name="deliveryNote" value={shipping.deliveryNote} onChange={(value) => setShipping((current) => ({ ...current, deliveryNote: value }))} placeholder="เช่น ติดต่อ รปภ. ก่อนเข้าหมู่บ้าน หรือสะดวกรับสินค้าช่วงบ่าย" />
                </Block>

                <label className="flex items-start gap-3 border border-[#e5dccf] bg-[#faf7f1] px-4 py-4 text-sm leading-7 text-[#4f4943]"><input type="checkbox" name="setDefaultShipping" checked={shipping.setDefaultShipping} onChange={(event) => setShipping((current) => ({ ...current, setDefaultShipping: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-[#d6cec3]" /><span>ตั้งเป็นที่อยู่จัดส่งค่าเริ่มต้น</span></label>
                {shipping.addressId ? <input type="hidden" name="addressId" value={shipping.addressId} /> : null}
                <div className="flex flex-wrap items-center gap-3">
                  <SubmitButton>บันทึกที่อยู่จัดส่ง</SubmitButton>
                  {savedAddresses.length > 0 ? <ActionButton variant="ghost" onClick={() => { setShipping(shippingValue(defaultShippingAddress)); setShowShippingForm(false); }}>ยกเลิก</ActionButton> : null}
                </div>
                <Status state={shippingState} />
              </form>
            </div>
          )}
        </article>

        <article className={cardClass}>
          <div className="flex items-start justify-between gap-4 border-b border-[#ece5db] pb-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Billing & Tax</p>
              <h3 className="mt-2 text-2xl font-extrabold text-[#171212]">ข้อมูลใบเสร็จและภาษี</h3>
              <p className="mt-2 text-sm leading-6 text-[#5f5852]">ใช้สำหรับออกใบเสร็จหรือใบกำกับภาษี</p>
            </div>
            <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[#eadfce] bg-[#fff8ef] text-xl">🧾</div>
          </div>

          {billingDetails && !showBillingForm ? (
            <div className="mt-5 border border-[#dcd6cb] bg-white p-4">
              <BillingSummary billingDetails={billingDetails} />
              <div className="mt-4 flex flex-wrap gap-3">
                <ActionButton onClick={() => { setBilling(billingValue(billingDetails, defaultShippingAddress)); setShowBillingForm(true); }}>แก้ไขข้อมูลใบเสร็จ</ActionButton>
                {savedAddresses.length > 0 ? <form action={useSavedAddressForBillingAction}><input type="hidden" name="addressId" value={defaultShippingAddress?.id ?? savedAddresses[0]?.id ?? ""} /><SubmitButton>ใช้ที่อยู่จัดส่ง</SubmitButton></form> : null}
              </div>
            </div>
          ) : (
            <div className="mt-5">
              {!billingDetails ? <><p className="text-base font-bold text-[#171212]">ยังไม่มีข้อมูลใบเสร็จและภาษี</p><p className="mt-2 text-sm leading-7 text-[#5f5852]">เพิ่มข้อมูลไว้ล่วงหน้าเพื่อใช้งานได้เร็วขึ้นในขั้นตอนชำระเงิน</p></> : null}
              <form action={billingAction} className="mt-4 grid gap-5">
                <Block eyebrow="Profile" title="ข้อมูลผู้ขอเอกสาร" description="เลือกประเภทผู้ขอเอกสารและกรอกข้อมูลติดต่อสำหรับใบเสร็จหรือใบกำกับภาษี">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="ประเภทผู้ขอใบเสร็จ" name="billingType" value={billing.billingType} onChange={(value) => setBilling((current) => ({ ...current, billingType: value as "individual" | "company" }))} options={[{ label: "บุคคลทั่วไป", value: "individual" }, { label: "บริษัท / ธุรกิจ", value: "company" }]} placeholder="เลือกประเภท" />
                    <Field label={billing.billingType === "company" ? "ชื่อบริษัท" : "ชื่อ-นามสกุล"} name="fullNameOrCompanyName" value={billing.fullNameOrCompanyName} onChange={(value) => setBilling((current) => ({ ...current, fullNameOrCompanyName: value }))} required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="เบอร์โทรศัพท์" name="billingPhoneNumber" value={billing.billingPhoneNumber} onChange={(value) => setBilling((current) => ({ ...current, billingPhoneNumber: value }))} required />
                    <Field label="อีเมลสำหรับเอกสาร (ถ้ามี)" name="billingEmail" value={billing.billingEmail} onChange={(value) => setBilling((current) => ({ ...current, billingEmail: value }))} type="email" />
                  </div>
                  {billing.billingType === "company" ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="เลขประจำตัวผู้เสียภาษี" name="taxId" value={billing.taxId} onChange={(value) => setBilling((current) => ({ ...current, taxId: value }))} required />
                      <SelectField label="ประเภทสาขา" name="branchType" value={billing.branchType} onChange={(value) => setBilling((current) => ({ ...current, branchType: value as "head_office" | "branch_number", branchNumber: value === "branch_number" ? current.branchNumber : "" }))} options={[{ label: "สำนักงานใหญ่", value: "head_office" }, { label: "เลขที่สาขา", value: "branch_number" }]} placeholder="เลือกประเภทสาขา" />
                      {billing.branchType === "branch_number" ? <Field label="เลขที่สาขา" name="branchNumber" value={billing.branchNumber} onChange={(value) => setBilling((current) => ({ ...current, branchNumber: value }))} required /> : <input type="hidden" name="branchNumber" value="" />}
                    </div>
                  ) : null}
                </Block>

                <Block eyebrow="Billing Address" title="ที่อยู่สำหรับออกเอกสาร" description="สามารถใช้ที่อยู่เดียวกับจัดส่ง หรือบันทึกที่อยู่ออกเอกสารแยกต่างหาก">
                  <label className="flex items-start gap-3 border border-[#e5dccf] bg-[#faf7f1] px-4 py-4 text-sm leading-7 text-[#4f4943]"><input type="checkbox" name="sameAsShipping" checked={billing.sameAsShipping} onChange={(event) => setBilling((current) => ({ ...current, sameAsShipping: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-[#d6cec3]" /><span>ใช้ที่อยู่เดียวกับที่อยู่จัดส่ง</span></label>

                  {billing.sameAsShipping ? (
                    <SelectField label="เลือกที่อยู่จัดส่ง" name="sourceAddressId" value={billing.sourceAddressId} onChange={(value) => setBilling((current) => ({ ...current, sourceAddressId: value }))} options={savedAddressOptions} placeholder={savedAddressOptions.length ? "เลือกที่อยู่จัดส่ง" : "ยังไม่มีที่อยู่จัดส่ง"} helperText={!savedAddressOptions.length ? "กรุณาบันทึกที่อยู่จัดส่งก่อน" : undefined} disabled={!savedAddressOptions.length} />
                  ) : (
                    <>
                      <Field label="บ้านเลขที่ / หมู่ / อาคาร / ชั้น / ห้อง / ซอย / ถนน" name="billingAddressLine1" value={billing.billingAddressLine1} onChange={(value) => setBilling((current) => ({ ...current, billingAddressLine1: value }))} required />
                      <Field label="ที่อยู่เพิ่มเติม (ถ้ามี)" name="billingAddressLine2" value={billing.billingAddressLine2} onChange={(value) => setBilling((current) => ({ ...current, billingAddressLine2: value }))} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField label="จังหวัด" name="billingProvince" value={billing.billingProvince} onChange={(value) => setBilling((current) => ({ ...current, billingProvince: value, billingDistrict: "", billingSubdistrict: "", billingPostalCode: "" }))} options={provinces} placeholder="เลือกจังหวัด" required />
                        <SelectField label={billingLabels.districtLabel} name="billingDistrict" value={billing.billingDistrict} onChange={(value) => setBilling((current) => ({ ...current, billingDistrict: value, billingSubdistrict: "", billingPostalCode: "" }))} options={billingDistricts} placeholder={billingLabels.districtPlaceholder} helperText={billingDistrictHint} disabled={!billing.billingProvince || !billingDistricts.length} required />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                        <SelectField label={billingLabels.subdistrictLabel} name="billingSubdistrict" value={billing.billingSubdistrict} onChange={(value) => setBilling((current) => ({ ...current, billingSubdistrict: value }))} options={billingSubdistricts} placeholder={billingLabels.subdistrictPlaceholder} helperText={billingSubdistrictHint} disabled={!billing.billingDistrict || !billingSubdistricts.length} required />
                        <Field label="รหัสไปรษณีย์" name="billingPostalCode" value={billing.billingPostalCode} onChange={(value) => setBilling((current) => ({ ...current, billingPostalCode: value }))} placeholder="10110" helperText={billing.billingSubdistrict ? "ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ" : undefined} readOnly={Boolean(billing.billingSubdistrict)} required />
                      </div>
                      <Field label="จุดสังเกตเพิ่มเติม" name="billingAddressNote" value={billing.billingAddressNote} onChange={(value) => setBilling((current) => ({ ...current, billingAddressNote: value }))} />
                    </>
                  )}
                </Block>

                <input type="hidden" name="billingGoogleMapsUrl" value={billing.billingGoogleMapsUrl} />
                <input type="hidden" name="billingLatitude" value={billing.billingLatitude} />
                <input type="hidden" name="billingLongitude" value={billing.billingLongitude} />
                <input type="hidden" name="sourceAddressId" value={billing.sourceAddressId} />
                <div className="flex flex-wrap items-center gap-3">
                  <SubmitButton>บันทึกข้อมูลใบเสร็จ</SubmitButton>
                  {billingDetails ? <ActionButton variant="ghost" onClick={() => { setBilling(billingValue(billingDetails, defaultShippingAddress)); setShowBillingForm(false); }}>ยกเลิก</ActionButton> : null}
                </div>
                <Status state={billingState} />
              </form>
            </div>
          )}
        </article>
      </div>

      <article className={`${cardClass} mt-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Saved Addresses</p>
            <h3 className="mt-2 text-xl font-extrabold text-[#171212]">สมุดที่อยู่</h3>
            <p className="mt-2 text-sm leading-7 text-[#5f5852]">บันทึกหลายที่อยู่ไว้ใช้งานได้ ทั้งบ้าน ออฟฟิศ และคลังสินค้า</p>
          </div>
          <div className="text-2xl">📍</div>
        </div>

        {!savedAddresses.length ? (
          <div className="mt-5 border border-dashed border-[#ddd2c4] bg-white px-5 py-6">
            <p className="text-base font-bold text-[#171212]">ยังไม่มีที่อยู่ที่บันทึกไว้</p>
            <p className="mt-2 text-sm leading-7 text-[#5f5852]">เริ่มจากเพิ่มที่อยู่จัดส่งรายการแรกของคุณ แล้วระบบจะเก็บไว้ให้ใช้ในครั้งถัดไป</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {savedAddresses.map((address) => (
              <div key={address.id} className="border border-[#dcd6cb] bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f4efe7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7d5930]">{addressLabelText(address.label)}</span>
                  {address.isDefaultShipping ? <span className="rounded-full bg-[#edf7ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#217148]">ที่อยู่จัดส่งเริ่มต้น</span> : null}
                </div>

                <div className="mt-3">
                  <AddressSummary address={address} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <ActionButton onClick={() => { setShipping(shippingValue(address)); setShowShippingForm(true); window.location.hash = "addresses"; }}>แก้ไข</ActionButton>
                  <form action={deleteSavedAddressAction}><input type="hidden" name="addressId" value={address.id} /><SubmitButton>ลบ</SubmitButton></form>
                  {!address.isDefaultShipping ? <form action={setDefaultShippingAddressAction}><input type="hidden" name="addressId" value={address.id} /><SubmitButton>ตั้งเป็นค่าเริ่มต้น</SubmitButton></form> : null}
                  <form action={useSavedAddressForBillingAction}><input type="hidden" name="addressId" value={address.id} /><SubmitButton>ใช้กับใบเสร็จ</SubmitButton></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
      </div>
    </section>
  );
}
