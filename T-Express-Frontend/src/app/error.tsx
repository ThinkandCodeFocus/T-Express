"use client";

import { useEffect } from "react";
import ErrorPage from "@/components/Error";

export default function GlobalError({
  error,
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPage onRetry={reset} />;
}