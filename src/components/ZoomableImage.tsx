import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

type Props = { src: string; alt: string; open: boolean; onClose: () => void };

const MIN = 1;
const MAX = 8;

export function ImageZoomViewer({ src, alt, open, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastDistance = useRef<number | null>(null);
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const clamped = Math.min(MAX, Math.max(MIN, next));
    const k = clamped / z;
    setZoom(clamped);
    setOffset(
      clamped === 1
        ? { x: 0, y: 0 }
        : { x: px - (px - o.x) * k, y: py - (py - o.y) * k },
    );
  }, []);

  const zoomAtRef = useRef(zoomAt);
  zoomAtRef.current = zoomAt;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomAtRef.current(
        stateRef.current.zoom * Math.exp(-dy * 0.0018),
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  if (!open) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const rect = containerRef.current!.getBoundingClientRect();

    if (pts.length >= 2) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastDistance.current) {
        const factor = dist / lastDistance.current;
        zoomAt(
          stateRef.current.zoom * factor,
          (a.x + b.x) / 2 - rect.left,
          (a.y + b.y) / 2 - rect.top,
        );
      }
      lastDistance.current = dist;
    } else if (stateRef.current.zoom > 1) {
      setOffset((o) => ({ x: o.x + (e.clientX - prev.x), y: o.y + (e.clientY - prev.y) }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) lastDistance.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 py-2 text-background">
        <span className="truncate text-sm opacity-80">{alt}</span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Zoom arrière"
            onClick={() => zoomAt(zoom / 1.4, 0, 0)}
            className="rounded-full p-2 hover:bg-background/15"
          >
            <ZoomOut className="size-5" />
          </button>
          <button
            aria-label="Zoom avant"
            onClick={() => zoomAt(zoom * 1.4, 0, 0)}
            className="rounded-full p-2 hover:bg-background/15"
          >
            <ZoomIn className="size-5" />
          </button>
          <button aria-label="Réinitialiser" onClick={reset} className="rounded-full p-2 hover:bg-background/15">
            <RotateCcw className="size-5" />
          </button>
          <button aria-label="Fermer" onClick={onClose} className="rounded-full p-2 hover:bg-background/15">
            <X className="size-6" />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2.5))}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute left-0 top-0 h-full w-full select-none object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        />
      </div>
      <p className="pb-3 text-center text-xs text-background/70">
        Pincez ou utilisez la molette pour zoomer • glissez pour vous déplacer
      </p>
    </div>
  );
}
