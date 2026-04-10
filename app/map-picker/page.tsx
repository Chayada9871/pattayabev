import { MapPickerPageClient } from "@/components/account/map-picker-page-client";

function toNumber(value: string | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function MapPickerPage({
  searchParams
}: {
  searchParams: {
    key?: string;
    q?: string;
    lat?: string;
    lng?: string;
  };
}) {
  const selectionKey = typeof searchParams.key === "string" && searchParams.key.trim() ? searchParams.key : "map-picker:default";
  const initialQuery = typeof searchParams.q === "string" ? searchParams.q : "";
  const initialLatitude = typeof searchParams.lat === "string" ? toNumber(searchParams.lat) : null;
  const initialLongitude = typeof searchParams.lng === "string" ? toNumber(searchParams.lng) : null;

  return (
    <MapPickerPageClient
      selectionKey={selectionKey}
      initialQuery={initialQuery}
      initialLatitude={initialLatitude}
      initialLongitude={initialLongitude}
    />
  );
}
