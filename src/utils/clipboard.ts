/**
 * Read image blobs from clipboard data.
 * Returns array of DataURLs.
 */
export async function readImagesFromClipboard(
  clipboardData: DataTransfer
): Promise<string[]> {
  const urls: string[] = [];

  for (const item of Array.from(clipboardData.items)) {
    if (item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      if (blob) {
        const dataUrl = await blobToDataUrl(blob);
        urls.push(dataUrl);
      }
    }
  }

  return urls;
}

/** Check if a string looks like any http/https URL */
export function isUrl(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Check if a string looks like an image URL */
export function isImageUrl(text: string): boolean {
  try {
    const url = new URL(text.trim());
    const ext = url.pathname.toLowerCase();
    return (
      ext.endsWith(".png") ||
      ext.endsWith(".jpg") ||
      ext.endsWith(".jpeg") ||
      ext.endsWith(".gif") ||
      ext.endsWith(".webp") ||
      ext.endsWith(".svg")
    );
  } catch {
    return false;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
