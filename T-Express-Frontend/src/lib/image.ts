export function isBackendImageUrl(src?: string | null): boolean {
  if (!src || typeof src !== "string") {
    return false;
  }

  // If the path explicitly references the storage folder, treat it as a backend image
  if (src.includes('/storage/')) {
    return true;
  }

  // Otherwise, only treat full HTTP(S) URLs that point to the known backend hosts as backend images
  if (/^https?:\/\//i.test(src)) {
    return (
      src.includes("t-express-backend.onrender.com") ||
      src.includes("localhost:8000") ||
      src.includes("127.0.0.1:8000")
    );
  }

  return false;
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
