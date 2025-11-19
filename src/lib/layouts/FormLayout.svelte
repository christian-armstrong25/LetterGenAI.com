<script>
	import FileUpload from "$/components/FileUpload.svelte";
	import { pdfWorkerUrl } from "$/pdfWorkerSetup";
	import { loadUserData, saveUserData } from "$/services/firebase";
	import {
		generateCoverLetter as generateLLM,
		reviewCoverLetter as reviewLLM,
	} from "$/services/llm";
	import { abortStoredController, storeController } from "$/stores/controller";
	import { coverLetter } from "$/stores/coverLetter";
	import {
		isSample,
		writingSample1Text,
		writingSample2Text,
	} from "$/stores/samples";
	import { PASTED_SAMPLE_ID, STYLES } from "$/utils/constants";
	import { extractTextFromPDF, validatePDFFile } from "$/utils/pdf";
	import { uuidv4 } from "$/utils/uuid";
	import { determineStyle, validateForm } from "$/utils/validation";
	import { auth } from "$plugins/firebase/firebase";
	import * as pdfjsLib from "pdfjs-dist";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";

	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

	// State
	let uploadedResumes = [];
	let selectedResume = "";
	let resumesData = {};
	let additionalNotes = "";
	let style = "";
	let writingSample1Id = "";
	let writingSample2Id = "";
	let writingSamplesData = {};
	let jobDescription = "";

	// Auth
	const isAuthenticated = auth.currentUser !== null;
	const userID = isAuthenticated ? auth.currentUser.uid : null;
	const name = isAuthenticated ? auth.currentUser.displayName : "";

	const handleSubmit = async (event) => {
		event.preventDefault();
		const isSampleMode = $isSample === 1;
		const validation = validateForm(
			isSampleMode,
			style,
			writingSamplesData,
			writingSample1Id,
			selectedResume,
			jobDescription
		);
		if (!validation.valid) {
			alert(validation.message);
			return;
		}

		style =
			determineStyle(isSampleMode, writingSamplesData, writingSample2Id) ||
			style;
		navigate("/loading1");
		writeUserData();
		coverLetter.set("");

		const letter = await generateCoverLetter();
		await reviewCoverLetter(letter);
	};

	onMount(() => {
		abortStoredController();
		if (!isAuthenticated) return;

		loadUserData(userID, (userData) => {
			selectedResume = userData.selectedResume || "";
			uploadedResumes = Array.isArray(userData.uploadedResumes)
				? userData.uploadedResumes
				: [];
			resumesData = userData.resumesData || {};
			additionalNotes = userData.additionalNotes || "";
			style = userData.style || "";
			writingSample1Id = userData.writingSample1Id || "";
			writingSample2Id = userData.writingSample2Id || "";
			writingSamplesData = userData.writingSamplesData || {};
			writingSample1Text.set(
				writingSamplesData[writingSample1Id]?.textContent || ""
			);
			writingSample2Text.set(
				writingSamplesData[writingSample2Id]?.textContent || ""
			);
			isSample.set(userData.isSample);
		});
	});

	function writeUserData() {
		if (!isAuthenticated) return;
		saveUserData(userID, {
			selectedResume,
			uploadedResumes,
			resumesData,
			additionalNotes,
			style,
			writingSample1Id,
			writingSample2Id,
			writingSamplesData,
			isSample: $isSample,
			jobDescription,
			name,
		});
	}

	async function generateCoverLetter() {
		storeController(new AbortController());
		try {
			return await generateLLM(
				resumesData[selectedResume].textContent,
				jobDescription,
				additionalNotes,
				name
			);
		} catch (e) {
			if (e.name !== "AbortError") console.log(e);
			throw e;
		}
	}

	async function reviewCoverLetter(letter) {
		storeController(new AbortController());
		navigate("/letter");
		try {
			await reviewLLM(
				letter,
				style,
				name,
				writingSamplesData,
				writingSample1Id,
				writingSample2Id,
				(token) => coverLetter.update((l) => l + token)
			);
		} catch (e) {
			if (e.name !== "AbortError") console.log(e);
		}
	}

	async function handleFileChange(event, target) {
		const file = event.target?.files?.[0];
		if (!file) return;

		if (!validatePDFFile(file)) {
			alert("Please upload a PDF file.");
			return;
		}

		try {
			const textContent = await extractTextFromPDF(file);
			if (!textContent) {
				alert("Unable to read uploaded PDF. Please upload a valid PDF.");
				return;
			}

			const uploadedFile = { fileName: file.name, textContent };
			const id = uuidv4();

			if (target === "resume") {
				uploadedResumes.push(id);
				selectedResume = id;
				resumesData[id] = uploadedFile;
			} else if (target === "writingSample1") {
				writingSample1Id = id;
				writingSamplesData[id] = uploadedFile;
				writingSample1Text.set(textContent);
			} else if (target === "writingSample2") {
				writingSample2Id = id;
				writingSamplesData[id] = uploadedFile;
				writingSample2Text.set(textContent);
			}
		} catch (error) {
			console.error("Error processing PDF:", error);
			alert("Error reading PDF file. Please try again.");
		}
	}

	function handleTextInputChange(e, target) {
		if (!(e.target instanceof HTMLTextAreaElement)) return;

		const text = e.target.value;
		const sampleData = { fileName: PASTED_SAMPLE_ID, textContent: text };

		if (target === "writingSample1") {
			writingSample1Id = PASTED_SAMPLE_ID;
			writingSample1Text.set(text);
			writingSamplesData[PASTED_SAMPLE_ID] = sampleData;
		} else if (target === "writingSample2") {
			writingSample2Id = PASTED_SAMPLE_ID;
			writingSample2Text.set(text);
			writingSamplesData[PASTED_SAMPLE_ID] = sampleData;
		}
	}

	function removeResume(id) {
		const index = uploadedResumes.indexOf(id);
		if (index === -1) return;

		uploadedResumes.splice(index, 1);
		delete resumesData[id];
		if (selectedResume === id) {
			selectedResume = uploadedResumes[0] || "";
		}
	}

	// Computed values
	$: hasSelectedResume = uploadedResumes.includes(selectedResume);
	$: sectionPadding = hasSelectedResume ? "0rem" : "1rem";
	$: sectionPaddingBottom = hasSelectedResume ? "1rem" : "1.1rem";
	$: isPastedSample = (id) =>
		writingSamplesData[id]?.fileName === PASTED_SAMPLE_ID;
</script>

<div id="app">
	<div class="form-container">
		<h1>Create your Cover Letter</h1>

		<div
			class="section"
			id="style-sect"
			style="padding-top: {sectionPadding}; padding-bottom: {sectionPaddingBottom};"
		>
			<h2>Style<span class="required-star">*</span></h2>
			<p id="choose">
				Choose from a number of default writing styles, or imitate your own by
				pasting in cover letters or writing samples.
			</p>
			<div class="toggle-button">
				{#each [{ index: 0, label: "Pre-Selected Style" }, { index: 1, label: "Personalized Style" }] as { index, label }}
					<button
						on:click={() => {
							if ($isSample !== index) isSample.set(index);
						}}
						class:active={$isSample === index}
					>
						{label}
					</button>
				{/each}
			</div>
			{#if $isSample}
				<div class="double">
					<div class="custom-style">
						<FileUpload
							id="getFile1"
							label="Upload Sample #1 PDF"
							uploadedFileName={!isPastedSample(writingSample1Id) &&
							writingSamplesData[writingSample1Id]
								? writingSamplesData[writingSample1Id].fileName
								: ""}
							onFileChange={(e) => handleFileChange(e, "writingSample1")}
						/>
						<p class="style-or">or</p>
						<textarea
							placeholder="Paste your first writing sample here"
							class="sample-paste"
							bind:value={$writingSample1Text}
							on:input={(e) => handleTextInputChange(e, "writingSample1")}
						/>
					</div>

					<div class="custom-style">
						<FileUpload
							id="getFile2"
							label="Upload Sample #2 (Optional)"
							uploadedFileName={!isPastedSample(writingSample2Id) &&
							writingSamplesData[writingSample2Id]
								? writingSamplesData[writingSample2Id].fileName
								: ""}
							onFileChange={(e) => handleFileChange(e, "writingSample2")}
						/>
						<p class="style-or">or</p>
						<textarea
							placeholder="Paste your second writing sample here (Optional)"
							class="sample-paste"
							bind:value={$writingSample2Text}
							on:input={(e) => handleTextInputChange(e, "writingSample2")}
						/>
					</div>
				</div>
			{:else}
				<div class="base-style">
					<ul>
						<li>
							<label class="cursor">
								<input
									type="radio"
									name="style"
									value={STYLES.PRECISE}
									checked={style === STYLES.PRECISE}
									on:click={() => (style = STYLES.PRECISE)}
								/>
								Precise and Qualification-Driven
							</label>
						</li>
					</ul>
				</div>
			{/if}
		</div>

		<div class="section">
			<h2>Resume<span class="required-star">*</span></h2>
			{#if hasSelectedResume}
				<select bind:value={selectedResume}>
					{#each uploadedResumes as resumeKey (resumeKey)}
						<option value={resumeKey}>
							{resumeKey === selectedResume
								? `Selected: ${resumesData[resumeKey].fileName}`
								: resumesData[resumeKey].fileName}
						</option>
					{/each}
				</select>
				<button
					on:click={() => removeResume(selectedResume)}
					disabled={!selectedResume}
				>
					Remove Selected Resume
				</button>
				<p class="style-or">or</p>
			{/if}
			<div id="resume-upload">
				<FileUpload
					id="resumeUpload"
					label="Upload New PDF"
					onFileChange={(e) => handleFileChange(e, "resume")}
				/>
			</div>
		</div>

		<div
			class="section"
			style="padding-top: {hasSelectedResume
				? '0rem'
				: '0.5rem'}; padding-bottom: {sectionPaddingBottom};"
		>
			<h2>Job Description<span class="required-star">*</span></h2>
			<textarea
				bind:value={jobDescription}
				placeholder="Paste the job description here"
			/>
		</div>

		<div
			class="section"
			id="additional"
			style="padding-top: {hasSelectedResume
				? '0rem'
				: '0.5rem'}; padding-bottom: {sectionPaddingBottom};"
		>
			<h2>Additional Notes (Optional)</h2>
			<p id="additional-label">
				Include any additional notes or ideas you want to highlight
			</p>
			<textarea
				bind:value={additionalNotes}
				placeholder="Any additional notes, e.g. “Highlight my data science skills and interest in public policy”"
			/>
		</div>

		<button
			class="generate-button"
			on:click|stopPropagation={handleSubmit}
			style="margin-top: {hasSelectedResume ? '0rem' : '1rem'};"
		>
			Generate Letter
		</button>
	</div>
</div>

<img src="loading-resume.gif" id="loading-resume" alt="Loading resume" />

<style>
	#app {
		background-color: #22385f;
		font-family: "Roboto", sans-serif;
		margin: 0;
		padding: 0;
		padding-top: 0.5rem;
		width: 100vw;
		height: 100vh;
	}
	.form-container {
		background-color: white;
		max-width: 43rem;
		margin: 0rem auto;
		padding: 2em;
		padding-top: 0rem;
		height: 93.5vh;
		overflow: auto;
	}
	.form-container h1 {
		font-size: 1.4rem;
		text-align: center;
		margin-bottom: 0;
		padding-top: 0.7rem;
		margin-top: 0;
		padding-bottom: 0;
	}
	.section h2 {
		font-size: 1.1rem;
		color: #000;
		margin-bottom: 0.5em;
		margin-top: 0;
	}
	.section {
		margin-bottom: 1rem;
		padding: 1em;
		margin-top: 0rem;
		padding-top: 0rem;
		border-radius: 5px;
	}
	.toggle-button button {
		border: solid 1px #848484;
		padding: 0.2rem 1em;
		border-radius: 0;
		font-size: 0.9rem;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		cursor: pointer;
		color: #848484;
		background-color: white;
		font-weight: normal;
	}
	.toggle-button button:first-child {
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
	.toggle-button button:last-child {
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
	}
	.toggle-button button.active {
		color: #004896;
		border-color: #004896;
		background-color: #dcedff;
		font-weight: bold;
	}
	.toggle-button {
		display: flex;
	}
	.custom-style {
		margin-top: 1rem;
	}

	.custom-style textarea,
	.base-style ul {
		margin-top: 0em;
	}
	.base-style ul li {
		list-style-type: none;
	}
	.generate-button {
		background-color: #0c44a5;
		color: white;
		padding: 0.9em 2rem;
		display: block;
		margin: 0 auto;
		border: none;
		font-size: 0.9rem;
		cursor: pointer;
	}
	select {
		color: #125208;
		border-color: #125208;
		background-color: #f1fff4;
		font-size: 0.8rem;
		border: solid 0.1rem;
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
	}
	.required-star {
		color: red;
	}

	p {
		font-size: 0.79rem;
	}

	textarea {
		font-size: 0.7rem;
		font-family: "Roboto", sans-serif;
		padding: 0.2rem;
		width: 15rem;
		height: 2rem;
	}

	#additional-label {
		padding: 0;
		margin: 0;
		margin-bottom: 0.25rem;
	}

	.style-or {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		margin: 0;
		font-size: 0.65rem;
	}

	.sample-paste {
		padding: 0.2rem;
		margin: 0;
		width: 12rem;
		height: 2rem;
	}

	#choose {
		padding: 0;
		margin: 0;
	}

	.double {
		display: flex;
		justify-content: space-between;
		margin-right: 12rem;
	}

	#resume-upload {
		display: flex;
		align-items: center;
	}
	#resume-upload :global(.file-upload button) {
		width: 7rem;
		padding-top: 0rem;
		padding-bottom: 0rem;
		font-size: 0.6rem;
		height: 1.4rem;
	}

	#additional {
		margin-bottom: 0.2rem;
	}

	li {
		font-size: 0.9rem;
		margin-right: 2rem;
		padding-left: 0;
		margin-left: 0;
	}

	ul {
		padding-left: 0rem;
		margin-left: 0;
	}

	.cursor {
		cursor: pointer;
	}

	#loading-resume {
		width: 2rem;
		position: absolute;
		top: 51%;
		left: 40%;
		display: none;
	}
</style>
