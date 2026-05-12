"use client";

import { useEffect } from "react";

export default function RedirectToApp({ target }: { target: string }) {
  useEffect(() => {
    window.location.href = target;
  }, [target]);
  return null;
}
