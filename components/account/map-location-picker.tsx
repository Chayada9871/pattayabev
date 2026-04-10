"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MapLocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onPick: (latitude: number, longitude: number) => void;
};

type Point = {
  x: number;
  y: number;
};

const TILE_SIZE = 256;
const MIN_ZOOM = 5;
const MAX_ZOOM = 18;
const DEFAULT_CENTER = {
  latitude: 12.923556,
  longitude: 100.882455
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampLatitude(latitude: number) {
  return clamp(latitude, -85.05112878, 85.05112878);
}

function project(latitude: number, longitude: number, zoom: number): Point {
  const limitedLatitude = clampLatitude(latitude);
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((limitedLatitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
}

function unproject(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (x / scale) * 360 - 180;
  const mercator = Math.PI - (2 * Math.PI * y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(mercator) - Math.exp(-mercator)));

  return {
    latitude: clampLatitude(latitude),
    longitude
  };
}

function wrapTileX(value: number, maxTiles: number) {
  return ((value % maxTiles) + maxTiles) % maxTiles;
}

export function MapLocationPicker({ latitude, longitude, onPick }: MapLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWorld: Point;
    moved: boolean;
  } | null>(null);

  const [viewport, setViewport] = useState({ width: 640, height: 320 });
  const [zoom, setZoom] = useState(latitude != null && longitude != null ? 15 : 11);
  const [center, setCenter] = useState({
    latitude: latitude ?? DEFAULT_CENTER.latitude,
    longitude: longitude ?? DEFAULT_CENTER.longitude
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setViewport({
        width: Math.max(element.clientWidth, 320),
        height: Math.max(element.clientHeight, 320)
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setCenter({ latitude, longitude });
      setZoom((current) => Math.max(current, 15));
    }
  }, [latitude, longitude]);

  const viewState = useMemo(() => {
    const tileCount = 2 ** zoom;
    const centerWorld = project(center.latitude, center.longitude, zoom);
    const topLeftX = centerWorld.x - viewport.width / 2;
    const topLeftY = centerWorld.y - viewport.height / 2;
    const startTileX = Math.floor(topLeftX / TILE_SIZE);
    const endTileX = Math.floor((topLeftX + viewport.width) / TILE_SIZE);
    const startTileY = Math.floor(topLeftY / TILE_SIZE);
    const endTileY = Math.floor((topLeftY + viewport.height) / TILE_SIZE);
    const tiles: Array<{ key: string; src: string; left: number; top: number }> = [];

    for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
      for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
        if (tileY < 0 || tileY >= tileCount) {
          continue;
        }

        tiles.push({
          key: `${zoom}-${tileX}-${tileY}`,
          src: `https://tile.openstreetmap.org/${zoom}/${wrapTileX(tileX, tileCount)}/${tileY}.png`,
          left: tileX * TILE_SIZE - topLeftX,
          top: tileY * TILE_SIZE - topLeftY
        });
      }
    }

    let markerPosition: { left: number; top: number } | null = null;

    if (latitude != null && longitude != null) {
      const markerWorld = project(latitude, longitude, zoom);
      markerPosition = {
        left: markerWorld.x - topLeftX,
        top: markerWorld.y - topLeftY
      };
    }

    return {
      topLeftX,
      topLeftY,
      tiles,
      markerPosition,
      centerWorld
    };
  }, [center.latitude, center.longitude, latitude, longitude, viewport.height, viewport.width, zoom]);

  const updateFromClientPosition = (clientX: number, clientY: number) => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const coordinates = unproject(viewState.topLeftX + x, viewState.topLeftY + y, zoom);

    onPick(coordinates.latitude, coordinates.longitude);
    setCenter(coordinates);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWorld: viewState.centerWorld,
      moved: false
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      drag.moved = true;
    }

    const nextCenter = unproject(drag.startWorld.x - deltaX, drag.startWorld.y - deltaY, zoom);
    setCenter(nextCenter);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!drag.moved) {
      updateFromClientPosition(event.clientX, event.clientY);
    }

    dragRef.current = null;
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6f665d]">
        <p>ลากแผนที่เพื่อเลื่อน แล้วคลิกจุดที่ต้องการจัดส่ง</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((current) => clamp(current - 1, MIN_ZOOM, MAX_ZOOM))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cec0] bg-white text-sm font-bold text-[#171212] transition hover:bg-[#f7f1e7]"
            aria-label="ซูมออก"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setZoom((current) => clamp(current + 1, MIN_ZOOM, MAX_ZOOM))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cec0] bg-white text-sm font-bold text-[#171212] transition hover:bg-[#f7f1e7]"
            aria-label="ซูมเข้า"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[320px] overflow-hidden rounded-[22px] border border-[#e1d7ca] bg-[#eef3f6] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onPointerLeave={handlePointerLeave}
      >
        {viewState.tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: tile.left,
              top: tile.top
            }}
          />
        ))}

        {viewState.markerPosition ? (
          <div
            className="pointer-events-none absolute"
            style={{
              left: viewState.markerPosition.left,
              top: viewState.markerPosition.top,
              transform: "translate(-50%, -100%)"
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#d62027] text-sm text-white shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
              •
            </div>
            <div className="mx-auto -mt-1 h-3 w-3 rotate-45 bg-[#d62027]" />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-transparent to-transparent px-4 py-3 text-[11px] font-semibold text-white">
          คลิกเพื่อเลือกตำแหน่ง ระบบจะบันทึกให้ทันที
        </div>
      </div>
    </div>
  );
}
