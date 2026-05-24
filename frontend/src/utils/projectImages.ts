import { API_ORIGIN } from "../api/axios";

export function isAbsoluteImageUrl(value?: string | null) {
  return /^https?:\/\//i.test(value || "");
}

export function resolveProjectImageSrc(value?: string | null) {
  if (!value) return null;
  if (isAbsoluteImageUrl(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  return `${API_ORIGIN}/storage/${value}`;
}
