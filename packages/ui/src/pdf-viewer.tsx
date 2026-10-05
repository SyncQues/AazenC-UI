"use client";

import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent as ReactKeyboardEvent } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { cn } from "@aazenc/utils";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import {
  pdfPagePaneClass,
  pdfStageClass,
  pdfThumbsClass,
  pdfToolbarClass,
  pdfViewerClass,
} from "./pdf-viewer-variants";
import { clampPdfPage, clampPdfZoom, PDF_MAX_ZOOM, PDF_MIN_ZOOM, stepPdfZoom } from "./pdf-viewer-utils";

type PdfAssetOptions = {
  workerSrc?: string;
  cMapUrl?: string;
  cMapPacked?: boolean;
  standardFontDataUrl?: string;
  wasmUrl?: string;
};

type PdfRuntime = {
  Document: typeof import("react-pdf").Document;
  Page: typeof import("react-pdf").Page;
  options: {
    cMapUrl: string;
    cMapPacked: boolean;
    standardFontDataUrl: string;
    wasmUrl: string;
    useWasm: true;
  };
};

/** Font, cmap, and wasm files are static. The playground copies them to /pdfjs before dev and build. */
function bundledPdfAssets(): Required<PdfAssetOptions> {
  return {
    workerSrc: new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString(),
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    wasmUrl: "/pdfjs/wasm/",
  };
}

const THUMB_WIDTH = 72;

export interface PdfViewerProps extends Omit<ComponentProps<"div">, "className" | "children" | "onLoad"> {
  src: string | ArrayBuffer | Blob;
  title?: string;
  initialPage?: number;
  onPageChange?: (page: number, numPages: number) => void;
  onLoadSuccess?: (numPages: number) => void;
  options?: PdfAssetOptions;
  className?: string;
}

function PdfViewer({ src, title, initialPage = 1, onPageChange, onLoadSuccess, options, onKeyDown, className, ...regionProps }: PdfViewerProps) {
  const labelId = useId();
  const regionRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState<PdfRuntime | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [pageWidth, setPageWidth] = useState<number>();
  const [failed, setFailed] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    const assets = { ...bundledPdfAssets(), ...options };
    void import("react-pdf")
      .then((mod) => {
        mod.pdfjs.GlobalWorkerOptions.workerSrc = assets.workerSrc;
        if (!alive) return;
        setRuntime({
          Document: mod.Document,
          Page: mod.Page,
          options: {
            cMapUrl: assets.cMapUrl,
            cMapPacked: assets.cMapPacked,
            standardFontDataUrl: assets.standardFontDataUrl,
            wasmUrl: assets.wasmUrl,
            useWasm: true,
          },
        });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [options]);

  useEffect(() => {
    setNumPages(0);
    setPage(initialPage);
    setZoom(1);
    setFailed(false);
    setThumbsOpen(true);
    setExpanded(false);
  }, [src, initialPage]);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const measure = () => {
      const styles = getComputedStyle(pane);
      const pad = parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
      const next = Math.floor(pane.clientWidth - pad);
      if (next > 0) setPageWidth(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [runtime, failed, thumbsOpen, numPages]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeThumbRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [page, thumbsOpen]);

  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    regionRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = clampPdfPage(next, numPages || 1);
      setPage(clamped);
      onPageChange?.(clamped, numPages);
    },
    [numPages, onPageChange],
  );

  const setZoomLevel = useCallback((next: number) => {
    setZoom(clampPdfZoom(next));
  }, []);

  const onRegionKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(page - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(page + 1);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoomLevel(stepPdfZoom(zoom, 1));
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      setZoomLevel(stepPdfZoom(zoom, -1));
    } else if (event.key === "Escape" && expanded) {
      event.preventDefault();
      setExpanded(false);
    }
  };

  const showThumbs = numPages > 1 && thumbsOpen;

  return (
    <div
      role="region"
      aria-labelledby={title ? labelId : undefined}
      aria-label={title ? undefined : "PDF"}
      tabIndex={0}
      data-slot="pdf-viewer"
      className={cn(pdfViewerClass, className)}
      {...regionProps}
      ref={regionRef}
      data-expanded={expanded ? "true" : undefined}
      onKeyDown={onRegionKeyDown}
    >
      {title ? (
        <span id={labelId} className="sr-only">
          {title}
        </span>
      ) : null}

      <div className={pdfToolbarClass} role="toolbar" aria-label="PDF controls">
        <div className="flex items-center gap-1">
          {numPages > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={thumbsOpen ? "Hide pages" : "Show pages"}
              aria-pressed={thumbsOpen}
              onClick={() => setThumbsOpen((open) => !open)}
            >
              <PagesIcon />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
          >
            <Chevron direction="left" />
          </Button>
          <span className="min-w-14 text-center text-sm tabular-nums">{numPages > 0 ? `${page} / ${numPages}` : "—"}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={numPages === 0 || page >= numPages}
            onClick={() => goTo(page + 1)}
          >
            <Chevron direction="right" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={zoom <= PDF_MIN_ZOOM}
            onClick={() => setZoomLevel(stepPdfZoom(zoom, -1))}
          >
            <MinusIcon />
          </Button>
          <span className="min-w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={zoom >= PDF_MAX_ZOOM}
            onClick={() => setZoomLevel(stepPdfZoom(zoom, 1))}
          >
            <PlusIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Exit full page" : "Full page"}
            aria-pressed={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? <CloseIcon /> : <ExpandIcon />}
          </Button>
        </div>
      </div>

      <div className={pdfStageClass}>
        {failed ? (
          <p className="m-auto max-w-xs px-6 text-center text-sm text-destructive">
            Couldn’t open this PDF.
          </p>
        ) : runtime ? (
          <runtime.Document
            file={src}
            options={runtime.options}
            className="flex min-h-0 min-w-0 flex-1"
            loading={<PdfLoading />}
            error={<PdfFailure />}
            onLoadSuccess={(pdf) => {
              setFailed(false);
              setNumPages(pdf.numPages);
              setPage((current) => clampPdfPage(current, pdf.numPages));
              onLoadSuccess?.(pdf.numPages);
            }}
            onLoadError={() => setFailed(true)}
          >
            {showThumbs ? (
              <>
                <button
                  type="button"
                  aria-label="Hide pages"
                  className="absolute inset-0 z-[9] bg-foreground/40 md:hidden"
                  onClick={() => setThumbsOpen(false)}
                />
                <aside data-slot="pdf-viewer-thumbs" aria-label="Pages" className={pdfThumbsClass}>
                  <div className="flex flex-col gap-3 p-2" role="list">
                    {Array.from({ length: numPages }, (_, index) => {
                      const n = index + 1;
                      const selected = n === page;
                      return (
                        <div key={n} role="listitem">
                        <button
                          ref={selected ? activeThumbRef : undefined}
                          type="button"
                          aria-current={selected ? "page" : undefined}
                          aria-label={`Page ${n}`}
                          onClick={() => goTo(n)}
                          className={`flex w-full flex-col items-center gap-1.5 rounded-2xl p-1.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${selected ? "bg-primary/15" : "hover:bg-foreground/5"}`}
                        >
                          <span className={`block overflow-hidden rounded-lg bg-white shadow-sm ring-2 ${selected ? "ring-primary" : "ring-transparent"}`}>
                            <LazyPdfPage Page={runtime.Page} pageNumber={n} width={THUMB_WIDTH} />
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${selected ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                          >
                            {n}
                          </span>
                        </button>
                        </div>
                      );
                    })}
                  </div>
                </aside>
              </>
            ) : null}
            <div
              ref={paneRef}
              data-expanded={expanded ? "true" : "false"}
              className={pdfPagePaneClass}
              onClick={(event) => {
                if (expanded) return;
                const target = event.target;
                if (!(target instanceof Element)) return;
                if (target.closest("a, button, input, textarea, select")) return;
                setExpanded(true);
              }}
            >
              {pageWidth ? (
                <runtime.Page
                  pageNumber={page}
                  width={pageWidth}
                  scale={zoom}
                  loading={<PdfLoading />}
                />
              ) : (
                <PdfLoading />
              )}
            </div>
          </runtime.Document>
        ) : (
          <PdfLoading />
        )}
      </div>
    </div>
  );
}

function LazyPdfPage({
  Page,
  pageNumber,
  width,
}: {
  Page: PdfRuntime["Page"];
  pageNumber: number;
  width: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { root: node.closest("[data-slot=pdf-viewer-thumbs]"), rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="block" style={{ width, minHeight: Math.round(width * 1.3) }}>
      {visible ? <Page pageNumber={pageNumber} width={width} renderTextLayer={false} renderAnnotationLayer={false} /> : null}
    </span>
  );
}

function PdfLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Skeleton shape="block" />
    </div>
  );
}

function PdfFailure() {
  return (
    <p className="m-auto max-w-xs px-6 text-center text-sm text-destructive">
      Couldn’t open this PDF.
    </p>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {direction === "left" ? <path d="M15 6 9 12l6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

export { PdfViewer };
