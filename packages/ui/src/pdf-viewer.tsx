"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
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

type PdfRuntime = {
  Document: typeof import("react-pdf").Document;
  Page: typeof import("react-pdf").Page;
  options: {
    cMapUrl: string;
    cMapPacked: true;
    standardFontDataUrl: string;
  };
};

const THUMB_WIDTH = 72;

export type PdfViewerProps = {
  src: string;
  title?: string;
};

function PdfViewer({ src, title }: PdfViewerProps) {
  const labelId = useId();
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState<PdfRuntime | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageWidth, setPageWidth] = useState<number>();
  const [failed, setFailed] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    void import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      if (!alive) return;
      setRuntime({
        Document: mod.Document,
        Page: mod.Page,
        options: {
          cMapUrl: `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/standard_fonts/`,
        },
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setNumPages(0);
    setPage(1);
    setZoom(1);
    setFailed(false);
    setThumbsOpen(true);
  }, [src]);

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

  const goTo = useCallback(
    (next: number) => {
      setPage(clampPdfPage(next, numPages || 1));
    },
    [numPages],
  );

  const setZoomLevel = useCallback((next: number) => {
    setZoom(clampPdfZoom(next));
  }, []);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
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
      className={pdfViewerClass}
      onKeyDown={onKeyDown}
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
        </div>
      </div>

      <div className={pdfStageClass}>
        {failed ? (
          <p className="m-auto max-w-xs px-6 text-center text-sm text-destructive dark:text-[oklch(0.78_0.16_25)]">
            Couldn’t open this PDF.
          </p>
        ) : runtime ? (
          <runtime.Document
            file={src}
            options={runtime.options}
            className="flex min-h-0 min-w-0 flex-1"
            loading={<PdfLoading />}
            error={<PdfFailure />}
            onLoadSuccess={({ numPages: next }) => {
              setFailed(false);
              setNumPages(next);
              setPage((current) => clampPdfPage(current, next));
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
                            <runtime.Page
                              pageNumber={n}
                              width={THUMB_WIDTH}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                            />
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
            <div ref={paneRef} className={pdfPagePaneClass}>
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

function PdfLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Skeleton shape="block" />
    </div>
  );
}

function PdfFailure() {
  return (
    <p className="m-auto max-w-xs px-6 text-center text-sm text-destructive dark:text-[oklch(0.78_0.16_25)]">
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

function PagesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

export { PdfViewer };
