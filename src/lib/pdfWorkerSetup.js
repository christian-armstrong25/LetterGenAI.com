import pdfWorkerCode from "pdfjs-dist/build/pdf.worker.js?raw";
const blob = new Blob([pdfWorkerCode], { type: "application/javascript" });
export const pdfWorkerUrl = URL.createObjectURL(blob);
