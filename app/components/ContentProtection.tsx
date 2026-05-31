"use client";

import { useEffect } from "react";

export default function ContentProtection() {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
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
      // Allow drag inside admin area for our sorting component, but block globally
      if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Disable text selection across the entire site globally */
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
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
