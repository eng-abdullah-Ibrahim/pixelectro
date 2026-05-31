"use client";

import { useEffect } from "react";

export default function ContentProtection() {
  useEffect(() => {
    // دالة مساعدة للتحقق مما إذا كان الحدث يخص سكريبت الـ Analytics
    const isAnalyticsTarget = (target: EventTarget | null): boolean => {
      if (!target) return false;
      const element = target as HTMLElement;
      // استثناء سكريبتات فيرسيل أو أي عنصر يحمل تتبع داتا التحليلات
      return (
        element.hasAttribute("data-va") || 
        element.closest("[data-va]") !== null ||
        element.id?.includes("vercel") ||
        element.className?.toString().includes("vercel")
      );
    };

    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      if (isAnalyticsTarget(e.target)) return; // استثناء التحليلات
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts for Developer Tools and Source Code
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Ctrl+Shift+I (Windows/Linux) or Cmd+Opt+I (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
      }
      // Ctrl+Shift+J (Windows/Linux) or Cmd+Opt+J (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
      }
      // Ctrl+Shift+C (Windows/Linux) or Cmd+Opt+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
      }
      // Ctrl+U (View Source) or Cmd+Opt+U (Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }
    };

    // 3. Disable Dragging (Images, Text)
    const handleDragStart = (e: DragEvent) => {
      if (isAnalyticsTarget(e.target)) return; // استثناء التحليلات
      // Allow drag inside admin area for our sorting component, but block globally
      if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
    };
  }, []);

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Disable text selection across the entire site globally */
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -user-select: none;
      }
      /* Allow text selection inside inputs and textareas so users can type */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      /* Disable image dragging globally via CSS as fallback */
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
    `}} />
  );
}