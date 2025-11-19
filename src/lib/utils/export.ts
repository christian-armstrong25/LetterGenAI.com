import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";
import docxtemplater from "docxtemplater";
import PizZip from "pizzip";

export function convertTextToHTML(text: string): string {
	return text
		.replace(/\n/g, "<br>")
		.replace(/^ +/gm, (match) => match.replace(/ /g, "&nbsp;"));
}

export function convertHTMLToText(html: string): string {
	return html.replace(/<br>/g, "\n").replace(/&nbsp;/g, " ");
}

export function exportPDF(htmlContent: string, filename = "coverLetter.pdf"): void {
	const element = document.createElement("div");
	element.innerHTML = `<div style="font-family: 'Times New Roman', sans-serif; font-size: 12pt; color: black; padding: 72pt; line-height: 1.15;">${htmlContent}</div>`;

	html2pdf()
		.set({ html2canvas: { scale: 4 } })
		.from(element)
		.save(filename);
}

async function loadFile(url: string): Promise<ArrayBuffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error, status = ${response.status}`);
	}
	return await response.arrayBuffer();
}

export async function exportDoc(textContent: string, filename = "coverLetter.docx"): Promise<void> {
	try {
		const content = await loadFile("/template.docx");
		const zip = new PizZip(content);
		const doc = new docxtemplater().loadZip(zip);
		doc.setData({ content: textContent });
		doc.render();
		const out = doc.getZip().generate({
			type: "blob",
			mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		});
		saveAs(out, filename);
	} catch (error) {
		console.error("Error exporting DOC:", error);
		throw error;
	}
}

export async function copyToClipboard(text: string): Promise<void> {
	await navigator.clipboard.writeText(text);
}
