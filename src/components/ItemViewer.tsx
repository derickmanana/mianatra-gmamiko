import { useState } from "react";
import { ExternalLink, FileText, FileType2, Link2, Maximize2 } from "lucide-react";
import { ImageZoomViewer } from "./ZoomableImage";

export type ViewItem = {
  id: string;
  type: "image" | "pdf" | "word" | "link" | "text";
  title: string | null;
  content: string | null;
  url: string | null;
  signedUrl?: string | null;
};

export function ItemViewer({ item, fontScale = 1 }: { item: ViewItem; fontScale?: number }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const src = item.signedUrl ?? item.url ?? "";

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      {item.title ? (
        <h4 className="mb-2 text-base font-semibold text-foreground">{item.title}</h4>
      ) : null}

      {item.type === "image" && src ? (
        <>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="group relative block w-full overflow-hidden rounded-xl bg-muted"
          >
            <img src={src} alt={item.title ?? "Image"} loading="lazy" className="w-full object-contain" />
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-foreground/70 px-2 py-1 text-xs text-background">
              <Maximize2 className="size-3" /> Zoom
            </span>
          </button>
          <ImageZoomViewer
            src={src}
            alt={item.title ?? "Image"}
            open={zoomOpen}
            onClose={() => setZoomOpen(false)}
          />
        </>
      ) : null}

      {item.type === "pdf" && src ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe src={src} title={item.title ?? "PDF"} className="h-[70vh] w-full bg-muted" />
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-secondary py-2 text-sm font-medium text-secondary-foreground"
          >
            <FileText className="size-4" /> Ouvrir en plein écran
          </a>
        </div>
      ) : null}

      {item.type === "word" && src ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(src)}`}
            title={item.title ?? "Document Word"}
            className="h-[70vh] w-full bg-muted"
          />
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-secondary py-2 text-sm font-medium text-secondary-foreground"
          >
            <FileType2 className="size-4" /> Ouvrir le document
          </a>
        </div>
      ) : null}

      {item.type === "link" && src ? (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-3 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          <Link2 className="size-4 shrink-0" />
          <span className="truncate">{src}</span>
          <ExternalLink className="ml-auto size-4 shrink-0" />
        </a>
      ) : null}

      {item.content ? (
        <p
          className="mt-3 whitespace-pre-wrap break-words leading-relaxed text-foreground/90"
          style={{ fontSize: `${fontScale}rem`, lineHeight: 1.7 }}
        >
          {item.content}
        </p>
      ) : null}
    </div>
  );
}
