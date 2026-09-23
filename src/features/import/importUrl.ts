import { snapshot, type Snapshot } from "./snapshot";

export const IMPORT_WIDTH = 1280;

export function isUrl(text: string) {
  return /^https?:\/\/\S+$/i.test(text.trim());
}

export async function importUrl(url: string): Promise<Snapshot & { title: string }> {
  const frame = document.createElement("iframe");
  frame.style.cssText = `position:fixed;left:0;top:0;width:${IMPORT_WIDTH}px;height:900px;border:0;opacity:0;pointer-events:none`;
  frame.src = `/__proxy?url=${encodeURIComponent(url)}`;
  document.body.append(frame);

  try {
    await new Promise<void>((resolve, reject) => {
      frame.onload = () => resolve();
      frame.onerror = () => reject(new Error("Could not load page"));
    });
    const doc = frame.contentDocument;
    if (!doc) throw new Error("Page is not readable");
    const proxyError = doc.documentElement.dataset.proxyError;
    if (proxyError) throw new Error(proxyError);

    await doc.fonts.ready;
    await new Promise((r) => setTimeout(r, 300));

    const result = snapshot(doc.body);
    return { ...result, title: doc.title || new URL(url).hostname };
  } finally {
    frame.remove();
  }
}
