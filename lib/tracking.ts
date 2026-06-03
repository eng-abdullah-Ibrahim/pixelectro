/**
 * Unique Visitor Tracking Utility
 *
 * Uses localStorage to identify a unique browser.
 * The visitor ID persists indefinitely (until localStorage is cleared).
 *
 * Keys used:
 *  pxl_vid         – unique visitor identifier (UUID)
 *  pxl_pv          – whether this browser has sent a PAGE_VIEW
 *  pxl_cv_[id]     – whether this browser has sent a CATEGORY_VIEW for category [id]
 *  pxl_prv_[id]    – whether this browser has sent a PROJECT_VIEW for project [id]
 */

/** Returns the persistent visitor ID, creating one on first call */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem('pxl_vid');
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem('pxl_vid', vid);
  }
  return vid;
}

/** Returns true if this event has never been tracked for this browser */
function isFirstTime(key: string): boolean {
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, '1');
  return true;
}

type TrackPayload = {
  eventType: string;
  targetId?: string;
  targetName?: string;
};

async function sendEvent(payload: TrackPayload): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, visitorId: getVisitorId() }),
    });
  } catch (err) {
    console.error('Failed to track event:', err);
  }
}

/** Track a PAGE_VIEW — fires only once per browser lifetime */
export function trackPageView(): void {
  if (typeof window === 'undefined') return;
  if (!isFirstTime('pxl_pv')) return;
  sendEvent({
    eventType: 'PAGE_VIEW',
    targetId: window.location.pathname,
    targetName: document.title || window.location.pathname,
  });
}

/** Track a CATEGORY_VIEW — fires once per category per browser */
export function trackCategoryView(categoryId: string, categoryName: string): void {
  if (typeof window === 'undefined') return;
  if (!isFirstTime(`pxl_cv_${categoryId}`)) return;
  sendEvent({ eventType: 'CATEGORY_VIEW', targetId: categoryId, targetName: categoryName });
}

/** Track a PROJECT_VIEW — fires once per project per browser */
export function trackProjectView(projectId: string, projectTitle: string): void {
  if (typeof window === 'undefined') return;
  if (!isFirstTime(`pxl_prv_${projectId}`)) return;
  sendEvent({ eventType: 'PROJECT_VIEW', targetId: projectId, targetName: projectTitle });
}

/** Track a WHATSAPP_CLICK — always tracked (intentional action) */
export function trackWhatsAppClick(): void {
  sendEvent({ eventType: 'WHATSAPP_CLICK' });
}

/** Track an EMAIL_CLICK — always tracked (intentional action) */
export function trackEmailClick(): void {
  sendEvent({ eventType: 'EMAIL_CLICK' });
}
