"use client";

import { useEffect } from "react";

// When a page is restored from the browser's back/forward cache (bfcache), its
// frozen DOM is shown without hitting the server — which can redisplay an
// authenticated dashboard after the user has logged out. Reloading on a persisted
// pageshow forces the server (and auth middleware) to run again.
export function BfcacheGuard() {
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
