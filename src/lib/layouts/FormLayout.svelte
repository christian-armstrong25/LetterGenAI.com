<script>
	import { abortStoredController, storeController } from "$/stores/controller";
	import { coverLetter } from "$/stores/coverLetter";
	import {
		isSample,
		writingSample1Text,
		writingSample2Text,
	} from "$/stores/samples";
	import { onValue, ref, set } from "firebase/database";
	import { LLMChain } from "langchain/chains";
	import { ChatOpenAI } from "langchain/chat_models/openai";
	import {
		ChatPromptTemplate,
		HumanMessagePromptTemplate,
	} from "langchain/prompts";
	import * as pdfjsLib from "pdfjs-dist/build/pdf";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";
	import { auth, database } from "../plugins/firebase/firebase";

	let uploadedResumes = [];
	let selectedResume = "";
	let resumesData = {};

	let additionalNotes = "";
	let style = "";
	let writingSample1Id = "";
	let writingSample2Id = "";
	let writingSamplesData = {};

	let jobDescription = "";

	const userID = auth.currentUser.uid;
	const name = auth.currentUser.displayName;
	let controller;

	const handleSubmit = async (event) => {
		event.preventDefault();

		const writingSample1Data = writingSamplesData[writingSample1Id];
		const writingSample2Data = writingSamplesData[writingSample2Id];

		console.log($isSample);

		// check for style when it is not a sample
		if (!$isSample && !style) {
			alert("Please select a style.");
			return; // exit from the function after alert
		}

		// check for writingSample1Data when it is a sample
		if (
			$isSample &&
			(!writingSample1Data ||
				!writingSample1Data.textContent ||
				writingSample1Data.textContent.trim() === "")
		) {
			alert("Writing sample 1 is required.");
			return; // exit from the function after alert
		}

		// check for selected resume
		if (!selectedResume) {
			alert("Please select a resume.");
			return; // exit from the function after alert
		}

		// check for job description
		if (!jobDescription || jobDescription.trim() === "") {
			alert("Job description is required.");
			return; // exit from the function after alert
		}

		// for sample checks for writingSample2Data
		if ($isSample) {
			if (
				!writingSample2Data ||
				!writingSample2Data.textContent ||
				writingSample2Data.textContent.trim() === ""
			) {
				style = "sample-1";
			} else {
				style = "sample-2";
			}
		}

		navigate("/loading1");
		writeUserData();
		coverLetter.set("");
		await generateCoverLetter().then((letter) => reviewCoverLetter(letter));
	};

	onMount(() => {
		abortStoredController();
		onValue(
			ref(database, "/users/" + userID),
			(snapshot) => {
				const userData = snapshot.val();

				// Check if userData is not null
				if (userData) {
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
				} else {
					// Handle null userData here...
					// You could set some defaults or show an error message to the user.
				}
			},
			{
				onlyOnce: true,
			}
		);
	});

	function writeUserData() {
		set(ref(database, "users/" + userID), {
			selectedResume: selectedResume,
			uploadedResumes: uploadedResumes,
			resumesData: resumesData,
			additionalNotes: additionalNotes,
			style: style,
			writingSample1Id: writingSample1Id,
			writingSample2Id: writingSample2Id,
			writingSamplesData: writingSamplesData,
			isSample: $isSample,
			jobDescription: jobDescription,
			name: name,
		});
	}

	async function generateCoverLetter() {
		const controller = new AbortController();
		storeController(controller);

		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				"A good cover letter shows sincere enthusiasm, is personal, relevant to the job description, and professional. \n\
				Here is a resume: ‘{resume}’ \n\
				Here is a job description: ‘{jobDescription}’ \n\
				Please develop a bullet point outline for a cover letter based on the resume and job description provided. \n\
				Please write the cover letter based on the outline, drawing on the resume. ‘{style}’ \n\
				Emphasize how I would contribute to the role based on the experiences on the resume. \n\
				There should be a new line between each paragraph, the greeting should say 'Dear Hiring Manager,', and the sign off should say 'Sincerely, \n {name}' \n\
				{additionalNotes}."
			),
		]);

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
		});

		const chain = new LLMChain({
			llm: model,
			prompt: prompt,
		});

		let response;

		try {
			response = await chain.call({
				resume: resumesData[selectedResume].textContent,
				jobDescription: jobDescription,
				style: style,
				additionalNotes: additionalNotes,
				name: name,
			});
		} catch (e) {
			if (e.name === "AbortError") {
				console.log("Request was aborted");
			} else {
				console.log(e);
			}
		}

		return response.text;
	}

	async function reviewCoverLetter(letter) {
		const controller = new AbortController();
		storeController(controller);

		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				"You are a career advisor helping students write cover letters. You know that the great cover letters are simultaneously personal, show genuine enthusiasm, and are professional. A student gives you the following cover letter: '{letter}' Edit it to be more personal, more genuinely enthusiastic and human, but not unprofessional or informal. Here is the job description it is based on '{jobDescription}' and here is their resume: '{resume}'"
			),
		]);

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
			streaming: true,
		});

		const chain = new LLMChain({
			llm: model,
			prompt: prompt,
		});

		navigate("/letter");

		try {
			await chain.call(
				{
					letter: letter,
					jobDescription: jobDescription,
					resume: resumesData[selectedResume].textContent,
				},
				[
					{
						handleLLMNewToken(token) {
							coverLetter.update((letter) => letter + token);
						},
					},
				]
			);
		} catch (e) {
			if (e.name === "AbortError") {
				console.log("Request was aborted");
			} else {
				console.log(e);
			}
		}
	}

	// Generate a new UUID
	function uuidv4() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function (c) {
				let r = (Math.random() * 16) | 0,
					v = c === "x" ? r : (r & 0x3) | 0x8;
				return v.toString(16);
			}
		);
	}

	async function handleFileChange(event, target) {
		const file = event.target.files[0];

		pdfjsLib.GlobalWorkerOptions.workerSrc =
			"//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.js";

		const reader = new FileReader();
		reader.onload = async function () {
			if (reader.result instanceof ArrayBuffer) {
				const typedarray = new Uint8Array(reader.result);
				const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
				let textContent = "";
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const content = await page.getTextContent();
					for (const item of content.items) {
						if (typeof item.str === "string") {
							textContent += item.str;
						}
					}
				}
				const uploadedFile = {
					fileName: file.name,
					textContent: textContent,
				};

				if (target === "resume") {
					const id = uuidv4();
					uploadedResumes.push(id);
					selectedResume = id;
					resumesData[id] = uploadedFile;
				} else if (target === "writingSample1") {
					const id = uuidv4();
					writingSample1Id = id;
					$writingSample1Text = textContent; // use $ to notify Svelte
					writingSamplesData[id] = {
						fileName: file.name,
						textContent: textContent,
					};
				} else if (target === "writingSample2") {
					const id = uuidv4();
					writingSample2Id = id;
					$writingSample2Text = textContent; // use $ to notify Svelte
					writingSamplesData[id] = {
						fileName: file.name,
						textContent: textContent,
					};
				}
			}
		};
		reader.readAsArrayBuffer(file);
	}
</script>

<div id="app">
	<div class="form-container">
		<h1>Create your Cover Letter</h1>

		<div
			class="section"
			id="style-sect"
			style="padding-top: {uploadedResumes[selectedResume]
				? '0rem'
				: '1rem'}; padding-bottom: {uploadedResumes[selectedResume]
				? '1rem'
				: '1.1rem'};"
		>
			<h2>Style<span class="required-star">*</span></h2>
			<p id="choose">
				Choose from a number of default writing styles, or imitate your own by
				pasting in cover letters or writing samples.
			</p>
			<div class="toggle-button">
				{#each [1, 0] as index}
					<button
						on:click={() => {
							if ($isSample !== index) isSample.set(index);
						}}
						style={`color: ${
							$isSample === index ? "#004896" : "#848484"
						}; border-color: ${
							$isSample === index ? "#004896" : "#848484"
						}; background-color: ${
							$isSample === index ? "#DCEDFF" : "white"
						}; font-weight: ${$isSample === index ? "bold" : "normal"}`}
					>
						{index === 0 ? "Pre-Selected Style" : "Personalized Style"}
					</button>
				{/each}
			</div>
			{#if $isSample}
				<div class="double">
					<div class="custom-style">
						<div class="file-upload">
							<button
								on:click={() => document.getElementById("getFile1").click()}
							>
								<div class="logo-container">
									<img src="/upload-icon.png" alt="Upload Icon" />
								</div>
								<div class="text-container" id="upload-1">
									Upload Sample #1 PDF
								</div>
							</button>
							<div class="uploaded">
								{writingSamplesData[writingSample1Id]?.fileName || ""}
							</div>
							<input
								type="file"
								id="getFile1"
								style="display:none"
								on:change={(e) => handleFileChange(e, "writingSample1")}
							/>
						</div>
						<p class="style-or">or</p>
						<textarea
							placeholder="Paste your first writing sample here"
							class="sample-paste"
							bind:value={$writingSample1Text}
						/>
					</div>

					<div class="custom-style">
						<div class="file-upload">
							<button
								on:click={() => document.getElementById("getFile2").click()}
							>
								<div class="logo-container">
									<img src="public/upload-icon.png" alt="Upload Icon" />
								</div>
								<div class="text-container">Upload Sample #2 (Optional)</div>
							</button>
							<div class="uploaded">
								{writingSamplesData[writingSample2Id]?.fileName || ""}
							</div>
							<input
								type="file"
								id="getFile2"
								style="display:none"
								on:change={(e) => handleFileChange(e, "writingSample2")}
							/>
						</div>
						<p class="style-or">or</p>
						<textarea
							placeholder="Paste your second writing sample here (Optional)"
							class="sample-paste"
							bind:value={$writingSample2Text}
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
									value="precise"
									checked={style === "precise"}
									on:click={() => {
										style = "precise";
									}}
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
			{#if uploadedResumes.includes(selectedResume)}
				<select bind:value={selectedResume}>
					{#each uploadedResumes as resumeKey (resumeKey)}
						<option value={resumeKey}>
							{resumeKey === selectedResume
								? `Selected: ${resumesData[resumeKey].fileName}`
								: resumesData[resumeKey].fileName}
						</option>
					{/each}
				</select>
				<p class="style-or">or</p>
			{/if}
			<div
				class="file-upload"
				id="resume-upload"
				style="display: flex; align-items: center;"
			>
				<button
					on:click={() => document.getElementById("resumeUpload").click()}
				>
					<div class="logo-container">
						<img src="public/upload-icon.png" alt="Upload Icon" />
					</div>
					<div class="text-container">Upload New PDF</div>
				</button>
				<input
					type="file"
					id="resumeUpload"
					style="display:none"
					on:change={(e) => handleFileChange(e, "resume")}
				/>
			</div>
		</div>

		<div
			class="section"
			style="padding-top: {uploadedResumes[selectedResume]
				? '0rem'
				: '0.5rem'}; padding-bottom: {uploadedResumes[selectedResume]
				? '1rem'
				: '1.1rem'};"
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
			style="padding-top: {uploadedResumes[selectedResume]
				? '0rem'
				: '0.5rem'}; padding-bottom: {uploadedResumes[selectedResume]
				? '1rem'
				: '1.1rem'};"
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
			style="margin-top: {uploadedResumes[selectedResume] ? '0rem' : '1rem'};"
			>Generate Letter</button
		>
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
		border: solid 1px;
		padding: 0.2rem 1em;
		border-radius: 0;
		font-size: 0.9rem;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		cursor: pointer;
	}
	.toggle-button button:first-child {
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
	.toggle-button button:last-child {
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
	}
	.toggle-button {
		display: flex;
	}
	.custom-style {
		margin-top: 1rem;
	}

	.custom-style input[type="file"],
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

	.file-upload button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 12.5rem;
		height: 1.6rem;
		font-size: 0.75rem;
		border-radius: 0;
		border: none;
		cursor: pointer;
		background-color: #d9d9d9;
	}

	.file-upload button img {
		width: 1.2rem; /* Adjust this size according to the logo size you want */
	}

	.file-upload button .logo-container {
		padding: 0rem;
		margin-right: 0rem;
		margin-left: 0;
		padding-left: 0.2rem;
	}

	.file-upload button .text-container {
		padding-right: 0rem;
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

	#upload-1 {
		padding-right: 2.3rem;
	}

	#style-sect {
		padding-top: 1rem;
	}

	#resume-upload button {
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

	.uploaded {
		font-size: 0.65rem;
		padding-top: 0.2rem;
	}

	#uploaded_resume {
		padding-left: 1rem;
		padding-top: 0;
		padding-bottom: 0;
		margin-top: 0;
		margin-bottom: 0;
	}

	#loading-resume {
		width: 2rem;
		position: absolute;
		top: 51%;
		left: 40%;
		display: none;
	}
</style>
