"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import ProjectStats from './ProjectStats';

type MediaItem = {
  id: string;
  url: string;
  type: string;
  likesCount?: number;
  fakeLikes?: number;
  viewsCount?: number;
  fakeViews?: number;
  sharesCount?: number;
  fakeShares?: number;
};

function getCloudinaryPageUrl(originalUrl: string, pageNumber: number, isMobile: boolean = false) {
  const urlWithoutHash = originalUrl.split('#')[0];
  if (!urlWithoutHash.includes('/upload/')) return urlWithoutHash;
  const width = isMobile ? 'w_800' : 'w_1600';
  return urlWithoutHash.replace('/upload/', `/upload/${width},q_auto,f_auto,fl_progressive,pg_${pageNumber}/`);
}

function getPageCount(url: string) {
  const match = url.match(/#pages=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Stable forwardRef page — NO internal state (prevents setArea crash)
const Page = React.forwardRef<HTMLDivElement, { src?: string; isFirstPage?: boolean }>(
  ({ src, isFirstPage }, ref) => (
    <div
      ref={ref}
      className="page"
      style={{ 
        width: '100%', height: '100%', overflow: 'hidden', background: src ? '#fff' : 'transparent',
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          loading={isFirstPage ? 'eager' : 'lazy'}
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            display: 'block', pointerEvents: 'none', userSelect: 'none',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'
          }}
        />
      )}
    </div>
  )
);
Page.displayName = 'Page';

// ─── Dimension calculator ───────────────────────────────────────────────────
// The book fills the ENTIRE viewport. Bars are overlaid on top (glassmorphism).
// We shrink the effective area by bar heights so the book content stays visible.
const TOP_BAR_H    = 52;   // floating top bar height
const BOTTOM_BAR_H = 52;   // floating stats bar height
const ARROW_W      = 60;   // space each side for nav arrows

function computeBookDims(pageAspect: number, isMobile: boolean) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Book fills the FULL viewport — bars float on top of it
  // We only subtract arrow width on desktop. On mobile, we use 0 to maximize width.
  const arrowPadding = isMobile ? 0 : ARROW_W * 2;
  const avW = Math.max(vw - arrowPadding, 200);
  const avH = Math.max(vh, 200);

  // Mobile is ALWAYS single page to be readable. 
  // Desktop is single page only if clearly wider than tall (aspect > 1.3)
  const useSinglePage = isMobile || pageAspect > 1.3;

  let pageW: number, pageH: number;
  if (useSinglePage) {
    if (avW / avH > pageAspect) {
      pageH = avH; pageW = Math.round(pageH * pageAspect);
    } else {
      pageW = avW; pageH = Math.round(pageW / pageAspect);
    }
  } else {
    const openAspect = pageAspect * 2;
    let bW: number, bH: number;
    if (avW / avH > openAspect) {
      bH = avH; bW = Math.round(bH * openAspect);
    } else {
      bW = avW; bH = Math.round(bW / openAspect);
    }
    pageW = Math.round(bW / 2);
    pageH = bH;
  }
  return { pageW, pageH, useSinglePage };
}

// ─── Main Viewer ───────────────────────────────────────────────────────────────
export default function PdfFlipbookViewer({
  media,
  initialBookIndex = 0,
  onClose,
  serviceSlug = "branding"
}: {
  media: MediaItem[],
  initialBookIndex?: number,
  onClose: () => void,
  serviceSlug?: string
}) {
  const [activeBookIndex, setActiveBookIndex] = useState(initialBookIndex);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [pageAspect, setPageAspect] = useState<number | null>(null);
  const [bookDims, setBookDims] = useState<{ pageW: number; pageH: number; useSinglePage: boolean } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeMedia = media[activeBookIndex];
  const rawNumPages = activeMedia ? getPageCount(activeMedia.url) : 0;

  // Build page URL list — always pad to even count (required by react-pageflip showCover=false)
  const pageUrls: (string | null)[] = Array.from({ length: rawNumPages }, (_, i) =>
    getCloudinaryPageUrl(activeMedia?.url ?? '', i + 1, isMobile)
  );
  if (pageUrls.length % 2 !== 0) pageUrls.push(null);

  // ── Load page aspect from first image ──
  useEffect(() => {
    if (!activeMedia) return;
    setPageAspect(null);
    setBookDims(null);
    setCurrentPage(0);
    const img = new Image();
    img.src = getCloudinaryPageUrl(activeMedia.url, 1, isMobile);
    img.onload = () => setPageAspect(img.naturalWidth / img.naturalHeight);
  }, [activeMedia]);

  // ── Compute dimensions ──
  const recalc = useCallback(() => {
    if (pageAspect === null) return;
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setBookDims(computeBookDims(pageAspect, mobile));
  }, [pageAspect]);

  useEffect(() => {
    if (pageAspect === null) return;
    recalc();
    let tid: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(tid); tid = setTimeout(recalc, 300); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(tid); window.removeEventListener('resize', onResize); };
  }, [pageAspect, recalc]);

  // ── Mount: audio + lock scroll ──
  useEffect(() => {
    audioRef.current = new Audio('/sounds/cover-flip.mp3');
    audioRef.current.volume = 1.0;
    const unlock = () => {
      audioRef.current?.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; }).catch(() => {});
      document.removeEventListener('pointerdown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.body.style.overflow = '';
    };
  }, []);

  const playFlipSound = useCallback(() => {
    if (isMuted || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [isMuted]);

  if (!activeMedia) return null;

  const showBook = bookDims !== null && pageUrls.length > 0;
  const { pageW = 600, pageH = 840, useSinglePage = false } = bookDims ?? {};

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 60%, #181828 0%, #05050f 100%)',
      zIndex: 999999, overflow: 'hidden',
    }}>

      {/* ══ BOOK fills entire screen edge-to-edge ══ */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingLeft: ARROW_W, paddingRight: ARROW_W,
      }}>
        {showBook ? (
          // @ts-ignore
          <HTMLFlipBook
            key={`${activeBookIndex}-${pageW}-${pageH}`}
            width={pageW}
            height={pageH}
            size="fixed"
            showCover={false}
            usePortrait={useSinglePage}
            mobileScrollSupport={false}
            swipeDistance={isMobile ? 30 : 50}
            maxShadowOpacity={0.3}
            onFlip={(e: any) => { setCurrentPage(e.data); playFlipSound(); }}
            className="pdf-flipbook"
            style={{}}
          >
            {pageUrls.map((url, i) => (
              <Page key={`${activeBookIndex}-${i}`} src={url ?? undefined} isFirstPage={i === 0 || i === 1} />
            ))}
          </HTMLFlipBook>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 38, height: 38,
              border: '3px solid rgba(255,255,255,0.12)', borderTop: '3px solid #fff',
              borderRadius: '50%', animation: 'pfl-spin 0.9s linear infinite'
            }} />
            <style>{`@keyframes pfl-spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Loading…</span>
          </div>
        )}
      </div>

      {/* ══ TOP BAR — transparent floating overlay ══ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: TOP_BAR_H,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'transparent',
        zIndex: 10,
      }}>
        {/* Book tabs - scrollable on mobile */}
        {media.length > 1 ? (
          <div style={{ 
            display: 'flex', gap: '4px', overflowX: 'auto', 
            scrollbarWidth: 'none', msOverflowStyle: 'none', 
            marginRight: '10px', paddingBottom: '2px'
          }}>
            {media.map((m, idx) => (
              <button key={m.id}
                onClick={() => setActiveBookIndex(idx)}
                style={{
                  background: idx === activeBookIndex ? 'var(--blue-core, #4f8ef7)' : 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  color: 'white', padding: '4px 14px', borderRadius: '20px',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', transition: '0.2s',
                  whiteSpace: 'nowrap', flexShrink: 0
                }}
              >Book {idx + 1}</button>
            ))}
          </div>
        ) : <div />}

        {/* Right controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {rawNumPages > 0 && (
            <span style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.55)', padding: '4px 10px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)', whiteSpace: 'nowrap'
            }}>
              {currentPage + 1} / {rawNumPages}
            </span>
          )}
          <button onClick={() => setIsMuted(m => !m)} style={btnStyle}>{isMuted ? '🔇' : '🔊'}</button>
          <button onClick={onClose} style={btnStyle}>✕</button>
        </div>
      </div>

      {/* ══ STATS BAR — transparent floating overlay at bottom ══ */}
      <div style={{
        position: 'absolute', bottom: '20px', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent',
        zIndex: 10,
      }}>
        <ProjectStats
          key={activeMedia.id}
          projectId={activeMedia.id}
          targetType="MEDIA"
          serviceSlug={serviceSlug}
          initialLikes={activeMedia.likesCount || 0}
          initialFakeLikes={activeMedia.fakeLikes || 0}
          initialViews={activeMedia.viewsCount || 0}
          initialFakeViews={activeMedia.fakeViews || 0}
          initialShares={activeMedia.sharesCount || 0}
          initialFakeShares={activeMedia.fakeShares || 0}
        />
      </div>

    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)',
  border: '1px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  color: 'white', width: '32px', height: '32px', borderRadius: '50%',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.95rem',
};
