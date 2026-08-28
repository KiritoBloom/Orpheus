"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PhotoMeta } from "@/types/game";
import { PHOTOS, getPhoto } from "@/game/data/photos";
import { getCurrentPhotoId, openPhoto, photoFocusBus } from "@/game/services";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   PHOTO ALBUM — grid + viewer window with manual zoom/pan.
   The player does ALL visual inspection. ARIA can open but
   never zoom (enforced by design: no zoom service exists).
   ============================================================ */

const PHOTO_SOURCES: Record<string, string> = {
  DSC04821: "/Images/PhotoDSC04821.png",
  DSC04655: "/Images/PhotoDSC04655.png",
  DSC04788: "/Images/PhotoDSC04788.png",
  DSC04903: "/Images/PhotoDSC04903.png",
  IMG_0022: "/Images/PhotoIMG0022.png",
  IMG_0044: "/Images/PhotoIMG0044.png",
  IMG_0103: "/Images/PhotoIMG0103.png",
  old_cern_group_2003: "/Images/PhotoOldCern.png",
  sarah_defense_day: "/Images/PhotoSarahDefense.png",
  badge_scan: "/Images/PhotoBadgeScan.png",
  brass_plate: "/Images/PhotoBrassPlate.png",
  campus_map: "/Images/PhotoCampusMap.png",
};

function PhotoAsset({
  id,
  sizes,
}: {
  id: string;
  sizes?: string;
}) {
  const source = PHOTO_SOURCES[id];
  const meta = getPhoto(id);
  if (!source || !meta) return <div className="w-full h-full bg-surface" />;
  // Grid thumbnail: optimized via next/image → WebP/AVIF. Low-res is fine for 120px tiles.
  return (
    <Image
      src={source}
      alt={meta.caption || meta.filename}
      width={meta.width}
      height={meta.height}
      sizes={sizes ?? "120px"}
      className="w-full h-full object-cover"
      draggable={false}
      loading="lazy"
      decoding="async"
      fetchPriority="auto"
    />
  );
}

function PhotoViewerImage({ id }: { id: string }) {
  const source = PHOTO_SOURCES[id];
  const meta = getPhoto(id);
  if (!source || !meta) return <div className="w-full h-full bg-surface" />;
  // Forensic viewer: full-resolution PNG (unoptimized) so CSS scale(9×) stays crisp
  // and does not upscale a 256w WebP into a blurry, ghosted tile.
  return (
    <Image
      src={source}
      alt={meta.caption || meta.filename}
      width={meta.width}
      height={meta.height}
      className="w-full h-full object-contain"
      draggable={false}
      decoding="async"
      fetchPriority="high"
      priority
      unoptimized
      sizes="900px"
      style={{ objectFit: "contain" }}
    />
  );
}

/* ---------------- album grid ---------------- */

export function PhotosApp() {
  const os = useOS();
  const visible = PHOTOS.filter((p) => !p.inPrivateBackup || os.vaultUnlocked);
  if (visible.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 h-[28px] px-2 flex items-center justify-between border-b border-line bg-surface text-[10px] text-faint tracking-[0.14em]">
          <span>CAMERA ROLL — 0 ITEM(S)</span>
          <span>PRIVATE BACKUP SEALED</span>
        </div>
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div>
            <div className="text-[11px] tracking-[0.22em] text-faint">PRIVATE BACKUP SEALED</div>
            <div className="text-[10px] tracking-[0.14em] text-dim mt-1 leading-relaxed">unlock via terminal: <span className="text-accent">unlock lantern orpheus echo</span><br />order is light → name → echo</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 h-[28px] px-2 flex items-center justify-between border-b border-line bg-surface text-[10px] text-faint tracking-[0.14em]">
        <span>CAMERA ROLL — {visible.length} ITEM(S)</span>
        <span>DOUBLE-CLICK TO OPEN · ZOOM IS MANUAL</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 content-start">
        {visible.map((p) => (
          <button
            key={p.id}
            onDoubleClick={() => openPhoto(p.id)}
            onClick={() => sfx.click()}
            className="photo-tile text-left group"
            aria-label={`open ${p.filename}`}
          >
            <div className="aspect-[4/3] overflow-hidden border border-line group-hover:border-linebright img-checker relative">
              <div className="absolute inset-0 pointer-events-none"><PhotoAsset id={p.id} sizes="120px" /></div>
            </div>
            <div className="mt-1 text-[9.5px] text-dim truncate group-hover:text-txt">{p.filename}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- viewer ---------------- */

export function ImageViewerApp() {
  const [photoId, setPhotoId] = useState<string>(() => getCurrentPhotoId());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [bump, setBump] = useState(false);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const prevZoomRef = useRef(1);
  const os = useOS();

  useLayoutEffect(() => {
    const selectPhoto = (id: string) => {
      setPhotoId(id);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    // Sync immediately before paint — avoids flash of DSC04821 when opening a different photo
    selectPhoto(getCurrentPhotoId());
    return photoFocusBus.on((id) => selectPhoto(String(id)));
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    setZoom((z) => Math.min(9, Math.max(1, z * dir)));
  }, []);

  const startDrag = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
    const move = (ev: PointerEvent) => {
      if (!dragRef.current || !viewportRef.current) return;
      const r = viewportRef.current.getBoundingClientRect();
      const maxX = (r.width * (zoom - 1)) / 2;
      const maxY = (r.height * (zoom - 1)) / 2;
      setPan({
        x: Math.max(-maxX, Math.min(maxX, dragRef.current.px + ev.clientX - dragRef.current.x)),
        y: Math.max(-maxY, Math.min(maxY, dragRef.current.py + ev.clientY - dragRef.current.y)),
      });
    };
    const up = () => {
      dragRef.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // zoom milestone hook for story flags (e.g., reflection discovery) + detent bump
  useEffect(() => {
    const crossed = prevZoomRef.current < 2.5 && zoom >= 2.5;
    if (crossed) {
      sfx.typeTick();
      setBump(true);
      setTimeout(() => setBump(false), 40);
    }
    prevZoomRef.current = zoom;
    if (zoom >= 2.5 && photoId === "DSC04821") {
      import("@/game/services").then((S) => {
        // reuse the same flag logic as the service layer
        S.fsList(); // warm
        const osApi = useOS.getState();
        osApi.addFlag("FOUND_PHOTO_017");
        osApi.pushToast({
          app: "PHOTOS",
          title: "DSC04821.JPG",
          body: "Something is reflected in the glass.",
        });
      });
    }
  }, [zoom, photoId]);

  const meta: PhotoMeta | undefined = getPhoto(photoId);
  if (!meta) return <div className="p-4 text-faint">no image</div>;

  const list = PHOTOS.filter((p) => !p.inPrivateBackup || os.vaultUnlocked);
  const idx = list.findIndex((p) => p.id === photoId);

  const step = (d: number) => {
    const next = list[(idx + d + list.length) % list.length];
    setPhotoId(next.id);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    sfx.click();
  };

  return (
    <div className="flex flex-col h-full text-[11px]" data-zoom={zoom.toFixed(2)}>
      {/* toolbar */}
      <div className="shrink-0 h-[30px] flex items-center gap-2 px-2 border-b border-line bg-surface">
        <button className="btn-bevel text-[10px]" onClick={() => step(-1)}>◀ PREV</button>
        <button className="btn-bevel text-[10px]" onClick={() => step(1)}>NEXT ▶</button>
        <span className="text-txt truncate flex-1">{meta.filename}</span>
        <button className="btn-bevel text-[10px]" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); sfx.click(); }}>FIT</button>
        <button className="btn-bevel text-[10px]" onClick={() => { setShowInfo((s) => !s); sfx.click(); }}>
          {showInfo ? "HIDE INFO" : "INFO"}
        </button>
      </div>

      {/* viewport */}
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 relative overflow-hidden bg-black cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={startDrag}
      >
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * (bump ? 1.02 : 1)})`,
            transformOrigin: "center center",
            willChange: "transform",
            transition: dragging ? "none" : bump ? "transform 40ms ease-out" : "transform .12s ease-out",
          }}
        >
          <div className="relative" style={{ width: "min(100%, 900px)", aspectRatio: `${meta.width}/${meta.height}` }}>
            <PhotoViewerImage id={photoId} />
          </div>
        </div>

        {/* zoom readout */}
        <div className="absolute bottom-2 right-2 panel-inset px-2 py-0.5 text-[10px] text-dim select-none">
          ZOOM {(zoom * 100).toFixed(0)}%{zoom >= 2.5 ? " · MANUAL INSPECTION" : ""}
        </div>
        {zoom <= 1.02 && (
          <div className="absolute bottom-2 left-2 text-[9.5px] text-faint select-none pointer-events-none">
            SCROLL TO ZOOM · DRAG TO PAN — inspect closely; ARIA cannot see this
          </div>
        )}
      </div>

      {/* info bar — intentionally limited fields for the PLAYER */}
      {showInfo && (
        <div className="shrink-0 border-t border-line px-3 py-2 bg-surface leading-relaxed">
          <div className="text-faint">
            FILE {meta.filename} · {meta.width}×{meta.height}px
            {meta.visibleDate && ` · DATE SHOWN ${meta.visibleDate}`}
          </div>
          <div className="text-faint mt-0.5">
            FULL EXIF (timestamps, GPS, software, hash) is machine-readable — ask ARIA.
          </div>
        </div>
      )}
    </div>
  );
}
