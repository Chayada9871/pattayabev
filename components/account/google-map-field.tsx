"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildGoogleMapsCoordinateUrl,
  calculateDistanceKm,
  getResolvedCoordinates,
  SOPHON_STORE_LOCATION
} from "@/lib/google-maps";

type GoogleMapFieldProps = {
  label: string;
  googleMapsUrlName: string;
  googleMapsUrlValue: string;
  latitudeName: string;
  latitudeValue: string;
  longitudeName: string;
  longitudeValue: string;
  addressQuery: string;
  helperText?: string;
  onGoogleMapsUrlChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onClear: () => void;
};

type StoredMapSelection = {
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  label?: string;
};

function isStoredMapSelection(value: unknown): value is StoredMapSelection {
  return Boolean(
    value &&
      typeof value === "object" &&
      "googleMapsUrl" in value &&
      "latitude" in value &&
      "longitude" in value
  );
}

export function GoogleMapField({
  label,
  googleMapsUrlName,
  googleMapsUrlValue,
  latitudeName,
  latitudeValue,
  longitudeName,
  longitudeValue,
  addressQuery,
  helperText = "กดปุ่มเพื่อเปิดหน้าเลือกตำแหน่ง ค้นหาชื่อสถานที่ ใช้ตำแหน่งปัจจุบัน หรือคลิกจุดส่งสินค้าบนแผนที่",
  onGoogleMapsUrlChange,
  onLatitudeChange,
  onLongitudeChange,
  onClear
}: GoogleMapFieldProps) {
  const [selectedLabel, setSelectedLabel] = useState("");
  const storageKey = useMemo(() => `map-picker:${googleMapsUrlName}`, [googleMapsUrlName]);
  const resolvedCoordinates = useMemo(
    () =>
      getResolvedCoordinates({
        googleMapsUrl: googleMapsUrlValue,
        latitude: latitudeValue,
        longitude: longitudeValue
      }),
    [googleMapsUrlValue, latitudeValue, longitudeValue]
  );
  const distanceFromStore = useMemo(() => {
    if (resolvedCoordinates.latitude == null || resolvedCoordinates.longitude == null) {
      return null;
    }

    return calculateDistanceKm(SOPHON_STORE_LOCATION, {
      latitude: resolvedCoordinates.latitude,
      longitude: resolvedCoordinates.longitude
    });
  }, [resolvedCoordinates.latitude, resolvedCoordinates.longitude]);

  const hasLocation = resolvedCoordinates.latitude != null && resolvedCoordinates.longitude != null;
  const pickerUrl = useMemo(() => {
    const params = new URLSearchParams({
      key: storageKey
    });

    if (addressQuery.trim()) {
      params.set("q", addressQuery.trim());
    }

    if (resolvedCoordinates.latitude != null && resolvedCoordinates.longitude != null) {
      params.set("lat", resolvedCoordinates.latitude.toString());
      params.set("lng", resolvedCoordinates.longitude.toString());
    }

    return `/map-picker?${params.toString()}`;
  }, [addressQuery, resolvedCoordinates.latitude, resolvedCoordinates.longitude, storageKey]);

  useEffect(() => {
    const applySelection = (selection: StoredMapSelection) => {
      onGoogleMapsUrlChange(selection.googleMapsUrl);
      onLatitudeChange(selection.latitude.toFixed(6));
      onLongitudeChange(selection.longitude.toFixed(6));
      setSelectedLabel(selection.label ?? "");
    };

    const consumeSelection = () => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }

      try {
        const parsed = JSON.parse(raw) as unknown;
        if (isStoredMapSelection(parsed)) {
          applySelection(parsed);
        }
      } catch {
        // Ignore malformed data from older sessions.
      } finally {
        window.localStorage.removeItem(storageKey);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) {
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as unknown;
        if (isStoredMapSelection(parsed)) {
          applySelection(parsed);
        }
      } catch {
        // Ignore malformed data from older sessions.
      } finally {
        window.localStorage.removeItem(storageKey);
      }
    };

    consumeSelection();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", consumeSelection);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", consumeSelection);
    };
  }, [onGoogleMapsUrlChange, onLatitudeChange, onLongitudeChange, storageKey]);

  useEffect(() => {
    if (!hasLocation) {
      setSelectedLabel("");
    }
  }, [hasLocation]);

  return (
    <div className="rounded-[26px] border border-[#e5dccf] bg-[#fcfaf6] p-4 sm:p-5">
      <div className="border-b border-[#ece3d7] pb-4">
        <p className="text-base font-extrabold text-[#171212]">{label}</p>
        <p className="mt-2 text-sm leading-7 text-[#5f5852]">{helperText}</p>
      </div>

      <div className="mt-4 grid gap-4">
        <input type="hidden" name={googleMapsUrlName} value={googleMapsUrlValue} readOnly />
        <input type="hidden" name={latitudeName} value={latitudeValue} readOnly />
        <input type="hidden" name={longitudeName} value={longitudeValue} readOnly />

        {!hasLocation ? (
          <div className="rounded-2xl border border-dashed border-[#ddd2c4] bg-white px-4 py-4">
            <p className="text-sm font-semibold text-[#171212]">ยังไม่ได้เลือกตำแหน่งปลายทาง</p>
            <p className="mt-1 text-sm leading-7 text-[#6f665d]">
              เปิดหน้าเลือกตำแหน่งเพื่อค้นหาชื่อสถานที่หรือกดเลือกจุดส่งสินค้าอย่างแม่นยำ
            </p>
            <a
              href={pickerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#171212] px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#2b2424]"
            >
              เลือกตำแหน่งบนแผนที่
            </a>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d9e8dc] bg-[#f1fbf3] px-4 py-4">
            <p className="text-sm font-semibold text-[#1d7a46]">ตำแหน่งถูกบันทึกแล้ว</p>
            <p className="mt-1 text-sm text-[#4a6d54]">
              {resolvedCoordinates.latitude?.toFixed(6)}, {resolvedCoordinates.longitude?.toFixed(6)}
            </p>
            {selectedLabel ? <p className="mt-2 text-xs leading-6 text-[#4a6d54]">{selectedLabel}</p> : null}
            {distanceFromStore != null ? (
              <p className="mt-2 text-xs font-semibold text-[#2e5d39]">
                ระยะทางโดยประมาณจาก{SOPHON_STORE_LOCATION.label} {distanceFromStore.toFixed(distanceFromStore < 10 ? 1 : 0)} กม.
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={pickerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#cfe3d4] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d7a46] transition hover:bg-[#f7fffa]"
              >
                เปลี่ยนตำแหน่ง
              </a>
              <a
                href={buildGoogleMapsCoordinateUrl(resolvedCoordinates.latitude!, resolvedCoordinates.longitude!)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#cfe3d4] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d7a46] transition hover:bg-[#f7fffa]"
              >
                เปิดใน Google Maps
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedLabel("");
                  onClear();
                }}
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a6d54] transition hover:bg-white hover:text-[#171212]"
              >
                ล้างตำแหน่ง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
