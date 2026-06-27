import { API_ORIGIN } from "../api/axios";
import type { Project } from "../types/project";
import type { Perfil } from "../types/profile";
import { richTextToPlainText } from "./richText";

const EMPTY_VALUE = "Sin información registrada";
const PAGE_W = 1240;
const PAGE_H = 1754;
const PDF_W = 595.28;
const PDF_H = 841.89;
const SIDEBAR_W = 340;
const RIGHT_X = SIDEBAR_W + 58;
const RIGHT_W = PAGE_W - RIGHT_X - 64;
const TOP = 74;
const BOTTOM = PAGE_H - 74;

type LoadedImage = {
  image: HTMLImageElement;
  url: string;
};

type CvImages = {
  profile?: LoadedImage | null;
  projects: Record<number, LoadedImage | null>;
};

type PdfPage = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  y: number;
  pageNumber: number;
};

type PdfImagePage = {
  jpegBytes: Uint8Array;
  width: number;
  height: number;
};

function sanitizeText(value?: string | number | boolean | null) {
  if (value === null || value === undefined) return "";

  const valueWithoutControls = Array.from(String(value).replace(/\uFFFD/g, ""))
    .map((char) => {
      const code = char.charCodeAt(0);
      return code === 10 || code === 13 || code === 9 || code >= 32 ? char : " ";
    })
    .join("");

  const normalized = valueWithoutControls
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (/^(undefined|null|nan)$/i.test(normalized)) return "";
  return normalized;
}

function textOrEmpty(value?: string | number | boolean | null) {
  return sanitizeText(value) || EMPTY_VALUE;
}

function richText(value?: string | null) {
  return textOrEmpty(richTextToPlainText(value || ""));
}

function compactJoin(values: Array<string | number | boolean | null | undefined>, separator = " · ") {
  const parts = values.map((value) => sanitizeText(value)).filter((value) => value && value !== EMPTY_VALUE);
  return parts.length ? parts.join(separator) : EMPTY_VALUE;
}

function cleanTags(tags: string[]) {
  return tags.map((tag) => sanitizeText(tag)).filter(Boolean);
}

function getUserInitials(profile: Perfil) {
  return textOrEmpty(profile.nombre_completo)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CV";
}

function formatFileName(profile: Perfil, extension: "pdf") {
  const name = profile.nombre_completo || [profile.nombres, profile.apellidos].filter(Boolean).join(" ") || "Usuario";
  const safeName = sanitizeText(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `CV_${safeName || "Usuario"}.${extension}`;
}

function formatDate(value?: string | null) {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return new Intl.DateTimeFormat("es-BO", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatDateRange(start?: string | null, end?: string | null, current?: boolean) {
  const startValue = formatDate(start);
  const endValue = current ? "Actualidad" : formatDate(end);
  const values = [startValue, endValue].filter((item) => item !== EMPTY_VALUE);

  return values.length ? values.join(" - ") : EMPTY_VALUE;
}

function resolveStorageImage(value?: string | null) {
  const imagePath = sanitizeText(value);
  if (!imagePath) return "";
  if (/^(https?:|blob:|data:)/i.test(imagePath)) return imagePath;

  const storagePath = imagePath.replace(/^\/+/, "").replace(/^storage\/+/i, "");
  const encodedPath = encodeURI(storagePath);

  return `${API_ORIGIN}/storage-proxy/${encodedPath}`;
}

function resolveProfileImage(profile: Perfil) {
  const candidates = [
    profile.foto_perfil,
    (profile as Perfil & { fotoPerfil?: string | null }).fotoPerfil,
    (profile as Perfil & { imagenPerfil?: string | null }).imagenPerfil,
    (profile as Perfil & { avatar?: string | null }).avatar,
    (profile as Perfil & { photoURL?: string | null }).photoURL,
    (profile as Perfil & { imageUrl?: string | null }).imageUrl,
    (profile as Perfil & { profileImage?: string | null }).profileImage,
  ];

  return resolveStorageImage(candidates.find(Boolean) || "");
}

function getProjectImageUrl(project: Project) {
  return resolveStorageImage(project.url_imagen);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function inferImageMimeType(url: string) {
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".avif")) return "image/avif";
  return "";
}

async function imageToBase64(url: string) {
  if (!url) return null;

  try {
    if (url.startsWith("data:")) return url;

    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*" },
    });
    if (!response.ok) return null;

    const blob = await response.blob();
    const inferredType = inferImageMimeType(url);
    const imageBlob = /^image\//i.test(blob.type) ? blob : inferredType ? new Blob([blob], { type: inferredType }) : null;
    if (!imageBlob) return null;

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
  } catch {
    return null;
  }
}

function loadImageElement(src: string, url: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const image = new Image();

    if (!src.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }

    image.onload = () => resolve({ image, url });
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function loadImageFromBlob(url: string): Promise<LoadedImage | null> {
  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*" },
    });
    if (!response.ok) {
      console.warn(`[cvExport] loadImageFromBlob failed response ${response.status} for`, url);
      return null;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const loaded = await loadImageElement(objectUrl, url);
    URL.revokeObjectURL(objectUrl);
    if (!loaded) {
      console.warn(`[cvExport] loadImageFromBlob could not load image element for`, url);
    }
    return loaded;
  } catch (error) {
    console.warn(`[cvExport] loadImageFromBlob error for`, url, error);
    return null;
  }
}

async function loadImage(url: string): Promise<LoadedImage | null> {
  if (!url) return null;

  const directImage = await loadImageElement(url, url);
  if (directImage) return directImage;

  const blobImage = await loadImageFromBlob(url);
  if (blobImage) return blobImage;

  const base64 = await imageToBase64(url);
  if (base64) {
    const dataImage = await loadImageElement(base64, url);
    if (dataImage) return dataImage;
  }

  console.warn(`[cvExport] failed to load profile image for`, url);
  return null;
}

async function loadCvImages(profile: Perfil): Promise<CvImages> {
  const profileUrl = resolveProfileImage(profile);
  console.info(`[cvExport] profile foto_perfil=`, profile.foto_perfil, `profileUrl=`, profileUrl);
  const projectEntries = (profile.proyectos || []).map((project) => [project.id, getProjectImageUrl(project)] as const);
  const [profileImage, projectImages] = await Promise.all([
    loadImage(profileUrl),
    Promise.all(projectEntries.map(async ([id, url]) => [id, await loadImage(url)] as const)),
  ]);

  console.info(`[cvExport] loaded profile image=`, !!profileImage, profileImage?.url);

  return {
    profile: profileImage,
    projects: Object.fromEntries(projectImages),
  };
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function fillShadowRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  shadow = "rgba(15, 23, 42, 0.08)",
) {
  ctx.save();
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  fillRoundedRect(ctx, x, y, w, h, r, color);
  ctx.restore();
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number, radius = 0) {
  const sourceRatio = image.width / image.height;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.save();
  if (radius) {
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
  }
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function drawCircularCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  const sourceRatio = image.width / image.height;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (sourceRatio > 1) {
    sw = image.height;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width;
    sy = (image.height - sh) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, sx, sy, sw, sh, x, y, size, size);
  ctx.restore();
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight: number | "normal" | "bold" = 400) {
  ctx.font = `${weight} ${size}px "Segoe UI", Arial, Helvetica, sans-serif`;
  ctx.textBaseline = "top";
}

function wrapText(ctx: CanvasRenderingContext2D, value: string, width: number) {
  const lines: string[] = [];

  value.split(/\n+/).forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;

      if (ctx.measureText(next).width <= width) {
        current = next;
        return;
      }

      if (current) lines.push(current);

      if (ctx.measureText(word).width <= width) {
        current = word;
        return;
      }

      let chunk = "";
      Array.from(word).forEach((char) => {
        if (ctx.measureText(chunk + char).width <= width) {
          chunk += char;
        } else {
          if (chunk) lines.push(chunk);
          chunk = char;
        }
      });
      current = chunk;
    });

    if (current) lines.push(current);
  });

  return lines.length ? lines : [EMPTY_VALUE];
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  color: string,
  weight: number | "normal" | "bold" = 400,
  lineHeight = size + 9,
) {
  setFont(ctx, size, weight);
  ctx.fillStyle = color;
  const lines = wrapText(ctx, value, width);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function drawTextLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  size: number,
  color: string,
  weight: number | "normal" | "bold" = 400,
  lineHeight = size + 9,
) {
  setFont(ctx, size, weight);
  ctx.fillStyle = color;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function fitLineWithEllipsis(ctx: CanvasRenderingContext2D, line: string, width: number) {
  const ellipsis = "…";
  let candidate = line.trimEnd();

  if (ctx.measureText(`${candidate}${ellipsis}`).width <= width) return `${candidate}${ellipsis}`;

  while (candidate.length && ctx.measureText(`${candidate}${ellipsis}`).width > width) {
    candidate = candidate.slice(0, -1).trimEnd();
  }

  return candidate ? `${candidate}${ellipsis}` : ellipsis;
}

function clampWrappedLines(ctx: CanvasRenderingContext2D, value: string, width: number, maxLines: number) {
  const lines = wrapText(ctx, value, width);

  if (maxLines <= 0) return [];
  if (lines.length <= maxLines) return lines;

  const visibleLines = lines.slice(0, maxLines);
  visibleLines[visibleLines.length - 1] = fitLineWithEllipsis(ctx, visibleLines[visibleLines.length - 1], width);
  return visibleLines;
}

function drawWrappedTextLimited(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  color: string,
  weight: number | "normal" | "bold" = 400,
  lineHeight = size + 9,
  maxLines = Number.POSITIVE_INFINITY,
) {
  setFont(ctx, size, weight);
  ctx.fillStyle = color;

  const lines = Number.isFinite(maxLines)
    ? clampWrappedLines(ctx, value, width, maxLines)
    : wrapText(ctx, value, width);

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}
class CanvasCvRenderer {
  private pages: PdfPage[] = [];
  private profile: Perfil;
  private images: CvImages;
  private currentSectionTitle = "";

  constructor(profile: Perfil, images: CvImages) {
    this.profile = profile;
    this.images = images;
    this.pages.push(this.createPage(1));
  }

  private get page() {
    return this.pages[this.pages.length - 1];
  }

  private createPage(pageNumber: number): PdfPage {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No se pudo preparar el lienzo para generar el PDF.");
    }

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.fillStyle = "#0b4aa8";
    ctx.fillRect(0, 0, SIDEBAR_W, PAGE_H);
    ctx.fillStyle = "#08a6c9";
    ctx.fillRect(0, 0, SIDEBAR_W, 22);

    const page: PdfPage = { canvas, ctx, y: TOP, pageNumber };
    this.drawSidebar(page);
    return page;
  }

  private addPage() {
    this.pages.push(this.createPage(this.pages.length + 1));
  }

 private checkPageBreak(height: number, repeatSectionTitle = false) {
  if (this.page.y + height > BOTTOM) {
    this.addPage();

    if (repeatSectionTitle && this.currentSectionTitle) {
      this.drawSectionHeading(this.currentSectionTitle);
    }
  }
}

  private drawSidebar(page: PdfPage) {
  const { ctx } = page;
  const x = 42;
  const sidebarContentW = SIDEBAR_W - 84;
  let y = 52;

  if (page.pageNumber === 1) {
    const photoSize = 142;
    const photoX = (SIDEBAR_W - photoSize) / 2;

    fillRoundedRect(
      ctx,
      photoX - 8,
      y - 8,
      photoSize + 16,
      photoSize + 16,
      (photoSize + 16) / 2,
      "rgba(255, 255, 255, 0.16)",
    );

    if (this.images.profile) {
      drawCircularCoverImage(ctx, this.images.profile.image, photoX, y, photoSize);
    } else {
      fillRoundedRect(ctx, photoX, y, photoSize, photoSize, photoSize / 2, "#dbeafe");
      setFont(ctx, 42, 800);
      ctx.fillStyle = "#1d4ed8";
      const initials = getUserInitials(this.profile);
      const initialsWidth = ctx.measureText(initials).width;
      ctx.fillText(initials, photoX + (photoSize - initialsWidth) / 2, y + 46);
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(photoX + photoSize / 2, y + photoSize / 2, photoSize / 2 + 1, 0, Math.PI * 2);
    ctx.stroke();

    y += 178;
  } else {
    drawWrappedText(ctx, "SpherLink CV", x, y, sidebarContentW, 24, "#ffffff", 800, 32);
    y += 64;
  }

  const contactRows = [
    ["Correo", this.profile.correo],
    ["Teléfono", this.profile.telefono],
    ["Ubicación", this.profile.ubicacion],
  ];

  this.sidebarTitle(ctx, "Información", x, y);
  y += 34;

  contactRows.forEach(([label, value]) => {
    y += this.sidebarLine(ctx, label || "", textOrEmpty(value), x, y);
  });

  if (page.pageNumber === 1) {
  y += 20;

  const linksReserve = 214;
  const skillsBottom = BOTTOM - linksReserve;

  if (y < skillsBottom) {
    this.sidebarTitle(ctx, "Habilidades", x, y);
    y += 36;

    y += this.drawSidebarSkillGroup(
      ctx,
      "Técnicas",
      this.profile.habilidades?.filter((skill) => skill.tipo === "tecnica") || [],
      x,
      y,
      "Sin habilidades técnicas registradas",
      skillsBottom,
    );

    y += 14;

    if (y < skillsBottom) {
      y += this.drawSidebarSkillGroup(
        ctx,
        "Blandas",
        this.profile.habilidades?.filter((skill) => skill.tipo === "blanda") || [],
        x,
        y,
        "Sin habilidades blandas registradas",
        skillsBottom,
      );
    }
  }

  y = Math.min(y + 22, BOTTOM - linksReserve);

  this.sidebarTitle(ctx, "Enlaces", x, y);
  y += 34;

  [
    ["LinkedIn", this.profile.linkedin_url],
    ["GitHub", this.profile.github_url],
    ["Sitio web", this.profile.sitio_web_url],
  ].forEach(([label, value]) => {
    y += this.sidebarLine(ctx, label || "", textOrEmpty(value), x, y, 2);
  });
}
}

  private sidebarTitle(ctx: CanvasRenderingContext2D, title: string, x: number, y: number) {
    setFont(ctx, 22, 800);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(title, x, y);
    ctx.fillStyle = "rgba(219, 234, 254, 0.36)";
    ctx.fillRect(x, y + 32, SIDEBAR_W - 84, 2);
  }

  private sidebarLine(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  maxLines = 3,
) {
  setFont(ctx, 14, 800);
  ctx.fillStyle = "#bae6fd";
  ctx.fillText(label, x, y);

  const height = drawWrappedTextLimited(
    ctx,
    value,
    x,
    y + 19,
    SIDEBAR_W - 84,
    15,
    "#f8fafc",
    400,
    21,
    maxLines,
  );

  return height + 27;
}

  private drawSidebarSkillGroup(
  ctx: CanvasRenderingContext2D,
  label: string,
  skills: NonNullable<Perfil["habilidades"]>,
  x: number,
  y: number,
  emptyMessage: string,
  maxBottom = BOTTOM,
) {
  setFont(ctx, 15, 800);
  ctx.fillStyle = "#bae6fd";
  ctx.fillText(label, x, y);

  let currentY = y + 24;

  const items = skills.length
    ? skills.map((skill) => `${skill.nombre}${skill.nivel_dominio ? ` (${skill.nivel_dominio})` : ""}`)
    : [emptyMessage];

  const visibleLimit = skills.length ? 8 : 1;
  let renderedItems = 0;

  for (const item of items.slice(0, visibleLimit)) {
    setFont(ctx, 14, 700);

    const lines = clampWrappedLines(ctx, item, SIDEBAR_W - 112, 2);
    const itemHeight = Math.max(30, lines.length * 20 + 10);

    if (currentY + itemHeight > maxBottom - 30) break;

    fillRoundedRect(
      ctx,
      x,
      currentY - 2,
      SIDEBAR_W - 84,
      Math.max(27, lines.length * 20 + 8),
      10,
      "rgba(219, 234, 254, 0.14)",
    );

    setFont(ctx, 14, 700);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("•", x + 10, currentY + 3);

    drawTextLines(ctx, lines, x + 26, currentY + 3, 14, "#ffffff", 500, 20);

    currentY += itemHeight;
    renderedItems += 1;
  }

  const hiddenItems = skills.length ? Math.max(0, skills.length - renderedItems) : 0;

  if (hiddenItems > 0 && currentY + 24 <= maxBottom) {
    drawWrappedText(ctx, `+ ${hiddenItems} habilidades más`, x + 10, currentY + 2, SIDEBAR_W - 104, 13, "#bae6fd", 700, 18);
    currentY += 24;
  }

  return currentY - y;
}

  private drawSectionHeading(title: string) {
  const { ctx } = this.page;

  setFont(ctx, 26, 900);
  ctx.fillStyle = "#0b4aa8";
  ctx.fillText(title, RIGHT_X, this.page.y);

  ctx.fillStyle = "#bfdbfe";
  ctx.fillRect(RIGHT_X, this.page.y + 38, RIGHT_W, 2);

  this.page.y += 62;
}

private sectionTitle(title: string) {
  this.currentSectionTitle = title;
  this.checkPageBreak(60);
  this.drawSectionHeading(title);
}

  private textBlock(label: string, value: string) {
  const measureCtx = this.page.ctx;

  setFont(measureCtx, 18, 400);

  const remainingLines = wrapText(measureCtx, value, RIGHT_W - 48);
  const lineHeight = 27;
  const cardPadding = 50;
  let firstChunk = true;

  do {
    const minimumHeight = cardPadding + lineHeight + 18;

    if (this.page.y + minimumHeight > BOTTOM) {
      this.addPage();
    }

    const ctx = this.page.ctx;

    const maxLines = Math.max(
      1,
      Math.floor((BOTTOM - this.page.y - cardPadding - 18) / lineHeight),
    );

    const lines = remainingLines.splice(0, maxLines);
    const height = cardPadding + lines.length * lineHeight;
    const currentLabel = firstChunk ? label : `${label} (continuación)`;

    fillShadowRoundedRect(
      ctx,
      RIGHT_X,
      this.page.y,
      RIGHT_W,
      height,
      18,
      "#ffffff",
      "rgba(15, 23, 42, 0.06)",
    );

    ctx.strokeStyle = "#dbe3ee";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, RIGHT_X, this.page.y, RIGHT_W, height, 18);
    ctx.stroke();

    ctx.fillStyle = "#08a6c9";
    ctx.fillRect(RIGHT_X, this.page.y + 18, 5, height - 36);

    setFont(ctx, 17, 900);
    ctx.fillStyle = "#0f172a";
    ctx.fillText(currentLabel, RIGHT_X + 24, this.page.y + 18);

    drawTextLines(
      ctx,
      lines,
      RIGHT_X + 24,
      this.page.y + 47,
      18,
      "#475569",
      400,
      lineHeight,
    );

    this.page.y += height + 18;
    firstChunk = false;
  } while (remainingLines.length);
}

  private measureTagRows(ctx: CanvasRenderingContext2D, tags: string[], width: number) {
    if (!tags.length) return 0;

    setFont(ctx, 14, 800);
    let rows = 1;
    let x = 0;
    tags.forEach((tag) => {
      const tagW = Math.min(ctx.measureText(tag).width + 24, width);
      if (x > 0 && x + tagW > width) {
        rows += 1;
        x = 0;
      }
      x += tagW + 8;
    });

    return rows;
  }

  private drawTags(ctx: CanvasRenderingContext2D, tags: string[], x: number, y: number, width: number) {
    let tagX = x;
    let tagY = y;

    tags.forEach((tag) => {
      setFont(ctx, 14, 800);
      const tagW = Math.min(ctx.measureText(tag).width + 24, width);
      if (tagX > x && tagX + tagW > x + width) {
        tagX = x;
        tagY += 32;
      }
      fillRoundedRect(ctx, tagX, tagY, tagW, 24, 12, "#dbeafe");
      ctx.save();
      drawRoundedRect(ctx, tagX, tagY, tagW, 24, 12);
      ctx.clip();
      ctx.fillStyle = "#0b4aa8";
      ctx.fillText(tag, tagX + 12, tagY + 4);
      ctx.restore();
      tagX += tagW + 8;
    });
  }

  private card(
  title: string,
  meta: string,
  body: string,
  tags: string[] = [],
  image?: LoadedImage | null,
  footer?: string,
) {
  const measureCtx = this.page.ctx;

  const safeTitle = textOrEmpty(title);
  const safeMeta = textOrEmpty(meta);
  const safeBody = textOrEmpty(body);
  const safeFooter = sanitizeText(footer);
  const safeTags = cleanTags(tags);

  const imageW = image ? 150 : 0;
  const textW = RIGHT_W - 48 - imageW - (image ? 22 : 0);
  const maxCardHeight = BOTTOM - TOP - 16;

  setFont(measureCtx, 22, 900);
  const titleLines = wrapText(measureCtx, safeTitle, textW).slice(0, 2);

  setFont(measureCtx, 16, 800);
  const metaLines = wrapText(measureCtx, safeMeta, textW).slice(0, 3);

  setFont(measureCtx, 17, 400);
  const allBodyLines = wrapText(measureCtx, safeBody, textW);

  setFont(measureCtx, 15, 700);
  const footerLines = safeFooter ? wrapText(measureCtx, safeFooter, textW) : [];

  const remainingBodyLines = [...allBodyLines];
  let firstChunk = true;

  do {
    const continued = !firstChunk;

    setFont(measureCtx, 22, 900);
    const currentTitleLines = continued
      ? wrapText(measureCtx, `${safeTitle} (continuación)`, textW).slice(0, 2)
      : titleLines;

    const currentMetaLines = continued ? [] : metaLines;

    const bodyStartY =
      30 +
      currentTitleLines.length * 28 +
      currentMetaLines.length * 23 +
      10;

    const isPotentialLast =
      remainingBodyLines.length <=
      Math.floor((maxCardHeight - bodyStartY - 62) / 25);

    const showExtras = isPotentialLast;

    const tagRows = showExtras
      ? this.measureTagRows(measureCtx, safeTags, textW)
      : 0;

    const footerHeight =
      showExtras && footerLines.length ? footerLines.length * 22 + 8 : 0;

    const tagHeight =
      showExtras && safeTags.length ? tagRows * 32 + 12 : 0;

    const maxBodyLines = Math.max(
      1,
      Math.floor(
        (maxCardHeight - bodyStartY - tagHeight - footerHeight - 38) / 25,
      ),
    );

    const bodyLines = remainingBodyLines.splice(0, maxBodyLines);
    const isLast = remainingBodyLines.length === 0;

    const finalTagRows = isLast
      ? this.measureTagRows(measureCtx, safeTags, textW)
      : 0;

    const finalTagHeight =
      isLast && safeTags.length ? finalTagRows * 32 + 12 : 0;

    const finalFooterHeight =
      isLast && footerLines.length ? footerLines.length * 22 + 8 : 0;

    const height = Math.max(
      image && firstChunk ? 160 : 0,
      bodyStartY +
        bodyLines.length * 25 +
        finalTagHeight +
        finalFooterHeight +
        30,
    );

    this.checkPageBreak(height + 18, true);

    const ctx = this.page.ctx;

    fillShadowRoundedRect(
      ctx,
      RIGHT_X,
      this.page.y,
      RIGHT_W,
      height,
      18,
      "#ffffff",
    );

    ctx.strokeStyle = "#dbe3ee";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, RIGHT_X, this.page.y, RIGHT_W, height, 18);
    ctx.stroke();

    let x = RIGHT_X + 24;

    if (image && firstChunk) {
      drawCoverImage(ctx, image.image, x, this.page.y + 24, 150, 112, 14);
      x += 172;
    }

    let y = this.page.y + 22;

    y += drawTextLines(
      ctx,
      currentTitleLines,
      x,
      y,
      22,
      "#0f172a",
      900,
      28,
    );

    if (currentMetaLines.length) {
      y +=
        drawTextLines(
          ctx,
          currentMetaLines,
          x,
          y + 2,
          16,
          "#1d4ed8",
          800,
          23,
        ) + 8;
    } else {
      y += 8;
    }

    y += drawTextLines(
      ctx,
      bodyLines,
      x,
      y,
      17,
      "#475569",
      400,
      25,
    );

    if (isLast && safeTags.length) {
      y += 12;
      this.drawTags(ctx, safeTags, x, y, textW);
      y += finalTagRows * 32;
    }

    if (isLast && footerLines.length) {
      y += 8;

      drawTextLines(
        ctx,
        footerLines,
        x,
        y,
        15,
        "#64748b",
        700,
        22,
      );
    }

    this.page.y += height + 18;
    firstChunk = false;
  } while (remainingBodyLines.length);
}

  render() {
    const { ctx } = this.page;
    setFont(ctx, 44, 900);
    ctx.fillStyle = "#0f172a";
    drawWrappedText(ctx, textOrEmpty(this.profile.nombre_completo), RIGHT_X, TOP, RIGHT_W, 44, "#0f172a", 900, 54);
    drawWrappedText(ctx, textOrEmpty(this.profile.titular_profesional || this.profile.profesion), RIGHT_X, TOP + 64, RIGHT_W, 24, "#1d4ed8", 800, 32);
    this.page.y = TOP + 126;
    this.textBlock("Perfil profesional", richText(this.profile.biografia));

    this.sectionTitle("Experiencia laboral");
    const work = this.profile.experiencias?.filter((experience) => experience.tipo === "laboral") || [];
    if (!work.length) this.textBlock("Estado", EMPTY_VALUE);
    work.forEach((experience) => {
      this.card(
        experience.titulo,
        compactJoin([experience.institucion, formatDateRange(experience.fecha_inicio, experience.fecha_fin, experience.actualidad)]),
        richText(experience.descripcion),
      );
    });

    this.sectionTitle("Experiencia académica");
    const academic = this.profile.experiencias?.filter((experience) => experience.tipo === "academica") || [];
    if (!academic.length) this.textBlock("Estado", EMPTY_VALUE);
    academic.forEach((experience) => {
      this.card(
        experience.titulo,
        compactJoin([
          experience.institucion,
          experience.subtipo_academico,
          formatDateRange(experience.fecha_inicio, experience.fecha_fin, experience.actualidad),
        ]),
        richText(experience.descripcion),
      );
    });

    this.sectionTitle("Proyectos");
    const projects = this.profile.proyectos || [];
    if (!projects.length) this.textBlock("Estado", EMPTY_VALUE);
    projects.forEach((project) => {
      this.card(
        project.titulo,
        compactJoin([project.rol || "Proyecto", project.visible_publico ? "Público" : "Oculto"]),
        richText(project.descripcion),
        project.tecnologias || [],
        this.images.projects[project.id],
        project.enlace_proyecto ? `Enlace: ${project.enlace_proyecto}` : "Enlace: Sin información registrada",
      );
    });

    return this.pages.map((page) => page.canvas);
  }
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function asciiBytes(value: string) {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function buildPdfFromCanvases(canvases: HTMLCanvasElement[]) {
  const images: PdfImagePage[] = canvases.map((canvas) => ({
    jpegBytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92)),
    width: PDF_W,
    height: PDF_H,
  }));
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let length = 0;

  const add = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? asciiBytes(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  };

  const objectCount = 4 + images.length * 3;
  add("%PDF-1.4\n");
  offsets.push(length);
  add("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const pageIds = images.map((_, index) => 3 + index * 3);
  offsets.push(length);
  add(`2 0 obj\n<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${images.length} >>\nendobj\n`);

  images.forEach((image, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const content = `q\n${PDF_W} 0 0 ${PDF_H} 0 0 cm\n/Im${index + 1} Do\nQ`;

    offsets.push(length);
    add(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Resources << /XObject << /Im${index + 1} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);
    offsets.push(length);
    add(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
    offsets.push(length);
    add(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${PAGE_W} /Height ${PAGE_H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.jpegBytes.length} >>\nstream\n`);
    add(image.jpegBytes);
    add("\nendstream\nendobj\n");
  });

  const xrefOffset = length;
  add(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => {
    add(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  add(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const blobParts: BlobPart[] = chunks.map((chunk) => new Uint8Array(chunk));
  return new Blob(blobParts, { type: "application/pdf" });
}

export async function downloadProfileCvPdf(profile?: Perfil | null) {
  if (!profile) {
    throw new Error("No se encontró información del perfil para generar el CV.");
  }

  const images = await loadCvImages(profile);
  const canvases = new CanvasCvRenderer(profile, images).render();
  const blob = buildPdfFromCanvases(canvases);

  if (!blob.size) {
    throw new Error("No se pudo generar el archivo PDF.");
  }

  downloadBlob(blob, formatFileName(profile, "pdf"));
}
