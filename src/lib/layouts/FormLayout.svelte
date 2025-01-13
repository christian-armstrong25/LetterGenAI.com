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
		PromptTemplate,
	} from "langchain/prompts";
	import * as pdfjsLib from "pdfjs-dist";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";
	import { auth, database } from "../plugins/firebase/firebase";

	// Set the worker source URL manually
	pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

	let uploadedResumes = [];
	let selectedResume = "";
	let resumesData = {};

	let additionalNotes = "";
	let style = "";
	let writingSample1Id = "";
	let writingSample2Id = "";
	let writingSamplesData = {};

	let jobDescription = "";

	let userID;
	let name;

	// Check if a user is authenticated
	const isAuthenticated = auth.currentUser !== null;

	if (isAuthenticated) {
		userID = auth.currentUser.uid;
		name = auth.currentUser.displayName;
	}

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
			(!writingSample1Data || writingSample1Data.textContent.trim() === "")
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
			if (!writingSample2Data || writingSample2Data.textContent.trim() === "") {
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
		if (isAuthenticated) {
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
					}
				},
				{
					onlyOnce: true,
				}
			);
		}
	});

	function writeUserData() {
		if (isAuthenticated) {
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
	}

	async function generateCoverLetter() {
		const controller = new AbortController();
		storeController(controller);
		let promptTemplate;

		if (style == "sample-1" || style == "sample-2") {
			promptTemplate = PromptTemplate.fromTemplate(
				"As a Career Advisor, you are tasked with constructing a powerful cover letter for a student, " +
					name +
					". The goal is to seamlessly blend their resume, job description, and personal voice into a meaningful narrative that echoes with both sincerity and relevance." +
					"Here is their resume: '{resume}'" +
					"And the job description: '{jobDescription}'" +
					"Step 1: Introduction: Using " +
					name +
					"'s resume and job description, write an engaging introduction that shows their interest in the role, as well as their understanding of the company's mission or recent initiatives. Keep their enthusiasm for the role and alignment with their qualifications in focus." +
					"Step 2: Interests and Skills: Align " +
					name +
					"'s qualifications with their interests and job requirements. Highlight a project or experience where " +
					name +
					" applied skills that satisfy the job's needs and also connect with their passions. Include quantifiable results to showcase the impact of their work and demonstrate how these experiences prepare " +
					name +
					" for this role." +
					"Step 3: Potential: What sets " +
					name +
					" apart? Elucidate how their past experiences, fueled by their interests and qualifications, will bring substantial value to the company. Be specific—how will " +
					name +
					"'s skills, achievements, and interest in the field fulfill the company's needs? Incorporate elements of " +
					name +
					"'s personality and motivations that make them an excellent cultural fit for the company." +
					"Step 4: Conclusion: Craft a closing paragraph that expresses gratitude for the reader's time, " +
					name +
					"'s desire to further discuss in an interview, and their excitement about the contributions they can make." +
					"Step 5: Professional Sign-off: Conclude with 'Sincerely, " +
					name +
					"'." +
					name +
					" would like their letter to be crafted in a qualification-focused style. This requires the ability to create a cover letter that is professional, engaging, and effectively encapsulates " +
					name +
					"'s qualifications, interests, and potential. The greeting should be 'Dear Hiring Manager,' " +
					"'{additionalNotes}'"
			);
		} else if (style == "precise") {
			promptTemplate = PromptTemplate.fromTemplate(
				"As a Career Advisor, you are tasked with constructing a powerful cover letter for a student, " +
					name +
					". The goal is to seamlessly blend their resume, job description, and personal voice into a meaningful narrative that echoes with both sincerity and relevance." +
					"Here is their resume: '{resume}'" +
					"And the job description: '{jobDescription}'" +
					"Step 1: Introduction: Using " +
					name +
					"'s resume and job description, write an engaging introduction that shows their interest in the role, as well as their understanding of the company's mission or recent initiatives. Keep their enthusiasm for the role and alignment with their qualifications in focus." +
					"Step 2: Interests and Skills: Align " +
					name +
					"'s qualifications with their interests and job requirements. Highlight a project or experience where " +
					name +
					" applied skills that satisfy the job's needs and also connect with their passions. Include quantifiable results to showcase the impact of their work and demonstrate how these experiences prepare " +
					name +
					" for this role." +
					"Step 3: Potential: What sets " +
					name +
					" apart? Elucidate how their past experiences, fueled by their interests and qualifications, will bring substantial value to the company. Be specific—how will " +
					name +
					"'s skills, achievements, and interest in the field fulfill the company's needs? Incorporate elements of " +
					name +
					"'s personality and motivations that make them an excellent cultural fit for the company." +
					"Step 4: Conclusion: Craft a closing paragraph that expresses gratitude for the reader's time, " +
					name +
					"'s desire to further discuss in an interview, and their excitement about the contributions they can make." +
					"Step 5: Professional Sign-off: Conclude with 'Sincerely, " +
					name +
					"'." +
					name +
					" would like their letter to be crafted in a qualification-focused style. This requires the ability to create a cover letter that is professional, engaging, and effectively encapsulates " +
					name +
					"'s qualifications, interests, and potential. The greeting should be 'Dear Hiring Manager,' " +
					"'{additionalNotes}'"
			);
		}

		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				await promptTemplate.format({
					resume: resumesData[selectedResume].textContent,
					jobDescription: jobDescription,
					additionalNotes: additionalNotes,
					name: name,
				})
			),
		]);

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
			modelName: "gpt-4o-mini",
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
		console.log(letter);
		let promptTemplate;

		if (style == "sample-1") {
			// ... (other code related to sample-1)
			promptTemplate = PromptTemplate.fromTemplate(
				"Your task is to revise the provided cover letter '{letter}' to match the writing style and tone of writing samples 1 and 2. Your response should clearly identify the key characteristics of the writing style and tone present in '" +
					writingSamplesData["writingSample1Id"] +
					"' and '" +
					sample2 +
					"'. You should strive to incorporate these characteristics into your revised cover letter without compromising the overall professionalism and clarity of the letter." +
					"Please note that your revised cover letter should remain faithful to the original content and purpose of the letter, while also reflecting the requested writing style and tone. You should pay close attention to grammar, spelling, and punctuation, and ensure that the revised letter is free of errors. Please remove everything above the greeting, replace the greeting with 'Dear Hiring Manager', and replace everything below 'Sincerely' with '" +
					name +
					"' Ensure it keeps a professional, precise tone, and showcases qualifications accurately. Opt for clear, straightforward language, and focus on concrete descriptions and actions. Strive for direct communication without excessive praise or emotion. Include no text above Dear Hiring Manager."
			);
		} else if (style == "sample-2") {
			promptTemplate = PromptTemplate.fromTemplate(
				"Your task is to revise the provided cover letter '{letter}' to match the writing style and tone of writing samples 1 and 2. Your response should clearly identify the key characteristics of the writing style and tone present in '" +
					writingSamplesData["writingSample1Id"] +
					"' and '" +
					writingSamplesData["writingSample2Id"] +
					"'. You should strive to incorporate these characteristics into your revised cover letter without compromising the overall professionalism and clarity of the letter." +
					"Please note that your revised cover letter should remain faithful to the original content and purpose of the letter, while also reflecting the requested writing style and tone. You should pay close attention to grammar, spelling, and punctuation, and ensure that the revised letter is free of errors. Please remove everything above the greeting, replace the greeting with 'Dear Hiring Manager', and replace everything below 'Sincerely' with '" +
					name +
					"' Ensure it keeps a professional, precise tone, and showcases qualifications accurately. Opt for clear, straightforward language, and focus on concrete descriptions and actions. Strive for direct communication without excessive praise or emotion. Include no text above Dear Hiring Manager."
			);
		} else if (style == "precise") {
			promptTemplate = PromptTemplate.fromTemplate(
				"You've received the cover letter: '{letter}'" +
					"As a cover letter coach, your role is to revise this draft so that it presents " +
					name +
					" as genuinely interested in the company and the job role. Ensure it keeps a professional, precise tone, and showcases qualifications accurately. Opt for clear, straightforward language, and focus on concrete descriptions and actions. Strive for direct communication without excessive praise or emotion. Include no text above Dear Hiring Manager."
			);
		}

		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				await promptTemplate.format({
					letter: letter,
					jobDescription: jobDescription,
					resume: resumesData[selectedResume].textContent,
					name: name,
				})
			),
		]);

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
			modelName: "gpt-4o-mini",
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

				if (textContent.trim() === "") {
					alert("Unable to read uploaded PDF. Please upload a valid PDF.");
					return;
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
					writingSamplesData[id] = uploadedFile;
					writingSample1Text.set(textContent);
				} else if (target === "writingSample2") {
					const id = uuidv4();
					writingSample2Id = id;
					writingSamplesData[id] = uploadedFile;
					writingSample2Text.set(textContent);
				}
			}
		};
		reader.readAsArrayBuffer(file);
	}

	async function handleTextInputChange(e, target) {
		if (e.target instanceof HTMLTextAreaElement) {
			const text = e.target.value;

			if (target === "writingSample1") {
				writingSample1Id = "Pasted Sample";
				$writingSample1Text = text; // use $ to notify Svelte
				writingSamplesData["Pasted Sample"] = {
					fileName: "Pasted Sample",
					textContent: text,
				};
			} else if (target === "writingSample2") {
				writingSample2Id = "Pasted Sample";
				$writingSample2Text = text; // use $ to notify Svelte
				writingSamplesData["Pasted Sample"] = {
					fileName: "Pasted Sample",
					textContent: text,
				};
			}
		}
	}

	async function removeResume(id) {
		const index = uploadedResumes.indexOf(id);
		if (index > -1) {
			// Remove from uploadedResumes
			uploadedResumes.splice(index, 1);

			// Remove from resumesData
			delete resumesData[id];

			// If the removed resume is the selected one, select another one or clear the selection
			if (selectedResume === id) {
				selectedResume = uploadedResumes[0] || "";
			}
		}
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
								{writingSamplesData[writingSample1Id] &&
								writingSamplesData[writingSample1Id].fileName !==
									"Pasted Sample"
									? writingSamplesData[writingSample1Id].fileName
									: ""}
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
							on:input={(e) => handleTextInputChange(e, "writingSample1")}
						/>
					</div>

					<div class="custom-style">
						<div class="file-upload">
							<button
								on:click={() => document.getElementById("getFile2").click()}
							>
								<div class="logo-container">
									<img src="/upload-icon.png" alt="Upload Icon" />
								</div>
								<div class="text-container">Upload Sample #2 (Optional)</div>
							</button>
							<div class="uploaded">
								{writingSamplesData[writingSample2Id] &&
								writingSamplesData[writingSample2Id].fileName !==
									"Pasted Sample"
									? writingSamplesData[writingSample2Id].fileName
									: ""}
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
				<button
					on:click={() => removeResume(selectedResume)}
					disabled={!selectedResume}
				>
					Remove Selected Resume
				</button>
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
						<img src="/upload-icon.png" alt="Upload Icon" />
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

	#loading-resume {
		width: 2rem;
		position: absolute;
		top: 51%;
		left: 40%;
		display: none;
	}
</style>
