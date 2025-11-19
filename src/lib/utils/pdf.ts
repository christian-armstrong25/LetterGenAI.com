import * as pdfjsLib from "pdfjs-dist";

export async function extractTextFromPDF(file: File): Promise<string> {
	const typedarray = new Uint8Array(await file.arrayBuffer());
	const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
	let textContent = "";

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		for (const item of content.items) {
			if ("str" in item && typeof item.str === "string") {
				textContent += item.str;
			}
		}
	}

	return textContent.trim();
}

export function validatePDFFile(file: File): boolean {
	return file.type === "application/pdf";
}
