/** Vercel serverless body limit is ~4.5MB; keep image data URL well under that. */
export const MAX_UPLOAD_DATA_URL_LENGTH = 350_000;
export const MAX_SAFE_JSON_PAYLOAD_LENGTH = 3_500_000;

const DEFAULT_MAX_INPUT_BYTES = 10 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Invalid image file."));
    img.src = src;
  });
}

function encodeJpeg(img, maxDimension, quality) {
  let width = img.width;
  let height = img.height;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Resize and compress an image for API upload (Vercel-friendly payload size).
 */
export async function compressImageForUpload(file, options = {}) {
  const maxInputBytes = options.maxInputBytes ?? DEFAULT_MAX_INPUT_BYTES;
  const targetLength = options.targetLength ?? MAX_UPLOAD_DATA_URL_LENGTH;
  const maxDimension = options.maxDimension ?? 800;

  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose a valid image file (PNG, JPG, or WebP).");
  }

  if (file.size > maxInputBytes) {
    throw new Error(`Image must be under ${Math.round(maxInputBytes / 1024 / 1024)}MB.`);
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let dimension = maxDimension;
  let best = "";

  while (dimension >= 320) {
    let quality = 0.85;
    while (quality >= 0.35) {
      const encoded = encodeJpeg(img, dimension, quality);
      best = encoded;
      if (encoded.length <= targetLength) {
        return encoded;
      }
      quality -= 0.1;
    }
    dimension = Math.round(dimension * 0.75);
  }

  if (best.length > targetLength) {
    throw new Error(
      "Could not compress this image enough. Try a smaller photo or crop it before uploading."
    );
  }

  return best;
}

export function isPayloadTooLargeForVercel(payload) {
  try {
    return JSON.stringify(payload).length > MAX_SAFE_JSON_PAYLOAD_LENGTH;
  } catch {
    return true;
  }
}
