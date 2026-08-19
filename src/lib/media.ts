
/**
 * Утилиты для работы с медиа-ссылками.
 * Google Drive отдаёт файлы/картинки/видео только через специальные URL,
 * обычные ссылки вида drive.google.com/file/d/ID/view не работают
 * для встраивания (<img>, <iframe>) и прямой скачки.
 */

const DRIVE_FILE_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_UC_RE = /drive\.google\.com\/uc\?.*[?&]id=([a-zA-Z0-9_-]+)/;
const DRIVE_OPEN_RE = /drive\.google\.com\/open\?.*[?&]id=([a-zA-Z0-9_-]+)/;
const DRIVE_VIEW_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/preview/;

function extractDriveId(url: string): string | null {
  const m = url.match(DRIVE_FILE_RE) || url.match(DRIVE_UC_RE) || url.match(DRIVE_OPEN_RE) || url.match(DRIVE_VIEW_RE);
  return m ? m[1] : null;
}

/** Картинка с Google Drive → URL для <img> (uc?export=view) */
export function driveImageUrl(url: string): string {
  if (!url) return url;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
  return url;
}

/** Видео с Google Drive → URL для <iframe> (preview) */
export function driveVideoEmbed(url: string): string {
  if (!url) return url;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  return url;
}

/** Файл с Google Drive → прямая ссылка на скачивание (uc?export=download) */
export function driveDownloadUrl(url: string): string {
  if (!url) return url;
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return url;
}

/** Показывает, ссылка это на Google Drive или нет */
export function isDriveUrl(url: string): boolean {
  return !!extractDriveId(url);
}

/** Валидация: ссылка на видео должна быть с YouTube/Vimeo/Google Drive */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/.test(url);
}

/** Универсальный embed URL для видео (youtube / vimeo / google drive) */
export function videoEmbedUrl(url: string): string {
  if (!url) return "";
  // YouTube
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // Vimeo
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  // Google Drive
  return driveVideoEmbed(url);
}

/**
 * Конвертирует GitHub blob-ссылку в прямую raw-ссылку для тега <img>.
 *   github.com/user/repo/blob/branch/path.png → raw.githubusercontent.com/user/repo/branch/path.png
 */
export function githubImageUrl(url: string): string {
  if (!url) return url;
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+?)(?:\?.*)?$/);
  if (m) {
    const [, user, repo, path] = m;
    return `https://raw.githubusercontent.com/${user}/${repo}/${path}`;
  }
  return url;
}

/**
 * Универсальный конвертер URL картинки в прямую ссылку для <img>.
 * Поддерживает Google Drive и GitHub blob → raw. Если не распознал — отдаёт как есть.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  const d = driveImageUrl(url);
  if (d !== url) return d;
  const g = githubImageUrl(url);
  if (g !== url) return g;
  return url;
}
