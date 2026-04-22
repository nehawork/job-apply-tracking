"use client";

import { useEffect } from "react";

export function PwaProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failure should not block app usage.
    });
  }, []);

  return null;
}
