"use client";

import { useEffect, useMemo, useState } from "react";

import { MapLocationPicker } from "@/components/account/map-location-picker";
import {
  buildGoogleMapsCoordinateUrl,
  calculateDistanceKm,
  SOPHON_STORE_LOCATION
} from "@/lib/google-maps";

type SearchResult = {
  displayName: string;
  latitude: number;
  longitude: number;
};

type MapPickerPageClientProps = {
  selectionKey: string;
  initialQuery: string;
  initialLatitude: number | null;
  initialLongitude: number | null;
};

export function MapPickerPageClient({
  selectionKey,
  initialQuery,
  initialLatitude,
  initialLongitude
}: MapPickerPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLatitude, setSelectedLatitude] = useState<number | null>(initialLatitude);
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(initialLongitude);
  const [selectedLabel, setSelectedLabel] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [saved, setSaved] = useState(false);

  const canConfirm = selectedLatitude != null && selectedLongitude != null;

  const selectedGoogleMapsUrl = useMemo(() => {
    if (selectedLatitude == null || selectedLongitude == null) {
      return "";
    }

    return buildGoogleMapsCoordinateUrl(selectedLatitude, selectedLongitude);
  }, [selectedLatitude, selectedLongitude]);
  const distanceFromStore = useMemo(() => {
    if (selectedLatitude == null || selectedLongitude == null) {
      return null;
    }

    return calculateDistanceKm(SOPHON_STORE_LOCATION, {
      latitude: selectedLatitude,
      longitude: selectedLongitude
    });
  }, [selectedLatitude, selectedLongitude]);

  useEffect(() => {
    if (!initialQuery.trim()) {
      return;
    }

    void searchByText(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchByText(searchText: string) {
    const trimmed = searchText.trim();

    if (!trimmed) {
      setResults([]);
      setSearchMessage("กรอกชื่อสถานที่ ถนน หรืออาคารที่ต้องการค้นหา");
      return;
    }

    setIsSearching(true);
    setSearchMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=th&q=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            "Accept-Language": "th"
          }
        }
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถค้นหาสถานที่ได้");
      }

      const payload = (await response.json()) as Array<{
        display_name?: string;
        lat?: string;
        lon?: string;
      }>;

      const nextResults = payload
        .map((item) => ({
          displayName: item.display_name ?? "ตำแหน่งที่ค้นหา",
          latitude: Number(item.lat),
          longitude: Number(item.lon)
        }))
        .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

      setResults(nextResults);
      setSearchMessage(nextResults.length ? "" : "ไม่พบผลลัพธ์ ลองพิมพ์ชื่อสถานที่ให้ละเอียดขึ้นหรือคลิกเลือกจากแผนที่");
    } catch {
      setResults([]);
      setSearchMessage("ค้นหาสถานที่ไม่สำเร็จ ลองใหม่อีกครั้งหรือเลือกจากแผนที่โดยตรง");
    } finally {
      setIsSearching(false);
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setSelectedLatitude(result.latitude);
    setSelectedLongitude(result.longitude);
    setSelectedLabel(result.displayName);
    setSearchMessage("");
    setSaved(false);
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setSearchMessage("อุปกรณ์นี้ไม่รองรับการใช้ตำแหน่งปัจจุบัน");
      return;
    }

    setIsLocating(true);
    setSearchMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLatitude(position.coords.latitude);
        setSelectedLongitude(position.coords.longitude);
        setSelectedLabel("ตำแหน่งปัจจุบันของคุณ");
        setSaved(false);
        setIsLocating(false);
      },
      () => {
        setSearchMessage("ไม่สามารถใช้ตำแหน่งปัจจุบันได้ กรุณาอนุญาตสิทธิ์หรือเลือกจากแผนที่");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleConfirm = () => {
    if (selectedLatitude == null || selectedLongitude == null) {
      return;
    }

    window.localStorage.setItem(
      selectionKey,
      JSON.stringify({
        latitude: selectedLatitude,
        longitude: selectedLongitude,
        googleMapsUrl: selectedGoogleMapsUrl,
        label: selectedLabel
      })
    );

    setSaved(true);
    setTimeout(() => {
      window.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f9f5ee_0%,#ffffff_35%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="rounded-[32px] border border-[#eadfce] bg-white p-5 shadow-[0_24px_60px_rgba(72,47,18,0.08)] sm:p-7">
          <div className="flex flex-col gap-4 border-b border-[#eee5d8] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">Map Picker</p>
              <h1 className="mt-2 text-[30px] font-extrabold text-[#171212]">เลือกตำแหน่งปลายทาง</h1>
              <p className="mt-3 text-sm leading-7 text-[#5f5852]">
                ค้นหาชื่อสถานที่หรือเลื่อนแผนที่ แล้วคลิกจุดที่ต้องการเพื่อส่งตำแหน่งกลับไปยังฟอร์มเดิม
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.close();
                window.history.back();
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8cec0] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#171212] transition hover:bg-[#f7f1e7]"
            >
              กลับไปหน้าก่อน
            </button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-5 rounded-[26px] border border-[#e6dbc9] bg-[#fcfaf6] p-4 sm:p-5">
              <div>
                <p className="text-base font-extrabold text-[#171212]">ค้นหาสถานที่</p>
                <p className="mt-2 text-sm leading-7 text-[#5f5852]">พิมพ์ชื่อสถานที่ อาคาร ถนน หรือจุดสังเกตที่อยู่ปลายทาง</p>
              </div>

              <div className="grid gap-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="เช่น บ้านเลขที่ 310 บางละมุง ชลบุรี"
                  className="h-11 w-full rounded-md border border-[#d7d1c7] bg-white px-4 text-sm text-[#171212] outline-none transition focus:border-[#171212]"
                />
                <button
                  type="button"
                  onClick={() => void searchByText(query)}
                  disabled={isSearching}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#171212] px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#2b2424] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSearching ? "กำลังค้นหา..." : "ค้นหาตำแหน่ง"}
                </button>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#d7d1c7] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#171212] transition hover:bg-[#faf7f1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLocating ? "กำลังระบุตำแหน่ง..." : "ใช้ตำแหน่งปัจจุบัน"}
                </button>
              </div>

              {searchMessage ? <p className="text-sm leading-7 text-[#7a7064]">{searchMessage}</p> : null}

              <div className="grid gap-3">
                {results.map((result, index) => (
                  <button
                    key={`${result.displayName}-${index}`}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="rounded-2xl border border-[#e3d8ca] bg-white px-4 py-3 text-left transition hover:border-[#171212] hover:bg-[#faf7f1]"
                  >
                    <p className="text-sm font-semibold text-[#171212]">{result.displayName}</p>
                    <p className="mt-1 text-xs text-[#6f665d]">
                      {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                    </p>
                  </button>
                ))}
              </div>

              <div className={`rounded-2xl border px-4 py-4 text-sm ${canConfirm ? "border-[#d9e8dc] bg-[#f1fbf3] text-[#1d7a46]" : "border-[#ddd2c4] bg-white text-[#6f665d]"}`}>
                {canConfirm ? (
                  <>
                    <p className="font-semibold">พร้อมบันทึกตำแหน่งแล้ว</p>
                    <p className="mt-1">
                      {selectedLatitude?.toFixed(6)}, {selectedLongitude?.toFixed(6)}
                    </p>
                    {selectedLabel ? <p className="mt-2 text-xs">{selectedLabel}</p> : null}
                    {distanceFromStore != null ? (
                      <p className="mt-2 text-xs font-semibold">
                        ระยะทางโดยประมาณจาก{SOPHON_STORE_LOCATION.label} {distanceFromStore.toFixed(distanceFromStore < 10 ? 1 : 0)} กม.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="font-semibold">ยังไม่ได้เลือกตำแหน่ง</p>
                    <p className="mt-1">ค้นหาสถานที่หรือคลิกเลือกจากแผนที่ด้านขวา</p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#a61b1f] px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#8c171b] disabled:cursor-not-allowed disabled:bg-[#b9b0a6]"
              >
                ใช้ตำแหน่งนี้
              </button>

              {canConfirm ? (
                <a
                  href={selectedGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#d7d1c7] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#171212] transition hover:bg-[#faf7f1]"
                >
                  เปิดใน Google Maps
                </a>
              ) : null}

              {saved ? (
                <p className="rounded-2xl border border-[#d9e8dc] bg-[#f1fbf3] px-4 py-3 text-sm text-[#1d7a46]">
                  ส่งตำแหน่งกลับไปยังหน้าฟอร์มแล้ว คุณสามารถปิดแท็บนี้ได้
                </p>
              ) : null}
            </aside>

            <section className="rounded-[26px] border border-[#e6dbc9] bg-[#fcfaf6] p-4 sm:p-5">
              <MapLocationPicker
                latitude={selectedLatitude}
                longitude={selectedLongitude}
                onPick={(latitude, longitude) => {
                  setSelectedLatitude(latitude);
                  setSelectedLongitude(longitude);
                  setSelectedLabel((current) => current.trim() || "จุดที่เลือกบนแผนที่");
                  setSearchMessage("");
                  setSaved(false);
                }}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
