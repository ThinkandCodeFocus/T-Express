export function isBackendImageUrl(src?: string | null): boolean {
  if (!src || typeof src !== "string") {
    return false;
  }

  return (
    src.includes("/storage/") &&
    (
      src.includes("t-express-backend.onrender.com") ||
      src.includes("localhost:8000") ||
      src.includes("127.0.0.1:8000")
    )
  );
}
