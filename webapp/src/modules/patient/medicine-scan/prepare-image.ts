/** Compress / resize a File or Blob to a temporary JPEG data URL (not stored). */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;
const MAX_BASE64_CHARS = 1_200_000; // ~900KB binary

export type PreparedImage = {
  base64: string;
  mimeType: "image/jpeg";
  previewUrl: string;
};

export async function prepareMedicineImage(file: Blob): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image for scanning.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    let quality = JPEG_QUALITY;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > MAX_BASE64_CHARS && quality > 0.45) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    const comma = dataUrl.indexOf(",");
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    return {
      base64,
      mimeType: "image/jpeg",
      previewUrl: dataUrl,
    };
  } finally {
    bitmap.close();
  }
}

export function revokePreview(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}
