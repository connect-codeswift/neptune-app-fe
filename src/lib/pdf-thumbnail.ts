import { pdfjs } from "react-pdf";
import "@/lib/pdf-worker";

/**
 * Render page 1 of a PDF to a JPEG. Best-effort — a failure must not block
 * the main upload (the files API commits without a thumbnail).
 */
export async function renderPdfFirstPageJpeg(
  file: File,
): Promise<File | null> {
  try {
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
      return null;
    }

    await page.render({
      canvas,
      canvasContext,
      viewport,
    }).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((next) => resolve(next), "image/jpeg", 0.85);
    });
    if (!blob) {
      return null;
    }

    return new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
  } catch {
    return null;
  }
}
