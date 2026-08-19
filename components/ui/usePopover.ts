import { useEffect, useRef, useState } from "react";

/**
 * Shared open/close mechanics for DatePicker, TimePicker, and Dropdown —
 * an anchored popover (trigger button + a panel positioned right below it),
 * as opposed to Modal.tsx's full-screen backdrop-click pattern, which
 * doesn't apply here since there's no full-screen overlay to click.
 *
 * Closes on: click outside the container, or Escape (matching Modal.tsx's
 * existing Escape behavior for consistency across the app's overlays).
 */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return { open, setOpen, containerRef };
}
