import { API_ORIGIN } from "../api/axios";

export function getProfilePhotoUrl(photo?: string | number | null) {
  if (typeof photo !== "string") return null;

  const normalizedPhoto = photo.trim();

  if (!normalizedPhoto || normalizedPhoto === "0" || !normalizedPhoto.startsWith("perfiles/")) {
    return null;
  }

  return `${API_ORIGIN}/storage/${normalizedPhoto}`;
}
