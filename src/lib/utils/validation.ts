import { STYLES } from "./constants";

export function validateForm(
	isSample: boolean,
	style: string,
	writingSamplesData: any,
	writingSample1Id: string,
	selectedResume: string,
	jobDescription: string
): { valid: boolean; message?: string } {
	if (!isSample && !style) {
		return { valid: false, message: "Please select a style." };
	}

	if (isSample) {
		const sample1 = writingSamplesData[writingSample1Id];
		if (!sample1 || !sample1.textContent.trim()) {
			return { valid: false, message: "Writing sample 1 is required." };
		}
	}

	if (!selectedResume) {
		return { valid: false, message: "Please select a resume." };
	}

	if (!jobDescription.trim()) {
		return { valid: false, message: "Job description is required." };
	}

	return { valid: true };
}

export function determineStyle(
	isSample: boolean,
	writingSamplesData: any,
	writingSample2Id: string
): string {
	if (!isSample) return "";
	const sample2 = writingSamplesData[writingSample2Id];
	return sample2?.textContent.trim() ? STYLES.SAMPLE_2 : STYLES.SAMPLE_1;
}
