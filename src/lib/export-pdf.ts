/** A4 at 72dpi, in points — jsPDF's default unit. */
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const MARGIN_PT = 24;

/**
 * Render a DOM element to a multi-page A4 PDF and download it.
 *
 * jsPDF and html2canvas-pro are imported on demand so they stay out of the
 * initial bundle — they're only needed when someone actually exports.
 * `html2canvas-pro` (not `html2canvas`) is required because Tailwind v4 emits
 * `oklch()` colours, which the original library can't parse.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    // 2x keeps text crisp without ballooning the file.
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  const contentWidth = A4_WIDTH_PT - MARGIN_PT * 2;
  const contentHeight = A4_HEIGHT_PT - MARGIN_PT * 2;
  // Scale the capture to the page width; height follows the aspect ratio.
  const imageHeight = (canvas.height * contentWidth) / canvas.width;

  const image = canvas.toDataURL("image/png");
  let remaining = imageHeight;
  let offset = 0;

  // Taller-than-a-page captures are sliced by shifting the image up each page.
  while (remaining > 0) {
    if (offset > 0) pdf.addPage();
    pdf.addImage(
      image,
      "PNG",
      MARGIN_PT,
      MARGIN_PT - offset,
      contentWidth,
      imageHeight,
    );
    remaining -= contentHeight;
    offset += contentHeight;
  }

  pdf.save(fileName);
}
