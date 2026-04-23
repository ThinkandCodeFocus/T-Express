export function isBackendImageUrl(src?: string | null): boolean {
  if (!src || typeof src !== "string") {
    return false;
  }

  // Keep direct image loading only in development.
  // In production, let Next.js proxy remote images via /_next/image
  // to avoid browser-side failures against backend storage hosts.
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  return (
    /^https?:\/\//i.test(src) &&
    (
      src.includes("t-express-backend.onrender.com") ||
      src.includes("localhost:8000") ||
      src.includes("127.0.0.1:8000") ||
      src.includes("/storage/")
    )
  );
}

export function getBackendOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    return new URL(apiUrl).origin;
  } catch {
    return 'http://localhost:8000';
  }
}

export function resolveBackendImageUrl(
  src?: string | null,
  fallback = '/images/products/default.png'
): string {
  if (!src || typeof src !== 'string') {
    return fallback;
  }

  if (/^https?:\/\//i.test(src) || src.startsWith('/images/')) {
    return src;
  }

  const normalized = src.replace(/^\/+/, '');

  if (normalized.startsWith('storage/')) {
    return `${getBackendOrigin()}/${normalized}`;
  }

  return `${getBackendOrigin()}/storage/${normalized}`;
}
