import { pdfjs } from "react-pdf";

/**
 * Points pdf.js at the worker served from public/, rather than a CDN.
 *
 * Importing this module for its side effect configures the worker before the
 * first `<Document>` renders, so any component that renders react-pdf should
 * `import "@/lib/pdf-worker"` at the top of the file.
 *
 * Why not a CDN: the PDF viewers show policy documents staff acknowledge and
 * incident attachments, so they have to work on a plant network with no route
 * to unpkg.com and under a CSP that doesn't allow third-party script origins.
 * A CDN also puts a third party in the path of a compliance record.
 *
 * public/pdf.worker.min.mjs is copied from pdfjs-dist/build/. After upgrading
 * pdfjs-dist (or react-pdf, which pulls it in), run `npm run sync:pdf-worker`
 * to refresh it — react-pdf throws if the worker and API versions disagree.
 */
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
