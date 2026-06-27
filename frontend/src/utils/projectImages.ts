import { API_ORIGIN } from "../api/axios";

export function isAbsoluteImageUrl(value?: string | null) {
  return /^https?:\/\//i.test(value || "");
}

export function resolveProjectImageSrc(value?: string | null) {
  if (!value) return null;
  if (isAbsoluteImageUrl(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  const storagePath = value.replace(/^\/+/, "").replace(/^storage\/+/, "");
  const encodedPath = encodeURI(storagePath);

  return `${API_ORIGIN}/storage-proxy/${encodedPath}`;
}
