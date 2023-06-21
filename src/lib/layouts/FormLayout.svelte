<script>
	import { coverLetter } from "$/stores/coverLetter";
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

	let default_style;
	let style;
	let resume;
	let resumeFileName = "";
	let jobDescription = "";
	let additionalNotes = "";
	let writtingSample = "";
	let isTextbox = false;
	const userID = auth.currentUser.uid;
	const name = auth.currentUser.displayName;

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (
			(!isTextbox && !default_style) ||
			(isTextbox && writtingSample.trim() === "") ||
			!resume ||
			jobDescription.trim() === ""
		) {
			alert("Please fill out all fields.");
		} else {
			// Handle form submission logic here
			if (!isTextbox) {
				// handles style or writting sample
				setStyle();
			} else {
				style =
					"Copy the writting style and syntactic quirks of the following cover letter: " +
					writtingSample;
			}

			navigate("/loading1");
			generateCoverLetter().then((letter) => reviewCoverLetter(letter));
			writeUserData();
		}
	};

	onMount(() => {
		onValue(
			ref(database, "/users/" + userID),
			(snapshot) => {
				resume = snapshot.val() && snapshot.val().resume;
				resumeFileName = snapshot.val() && snapshot.val().resumeFileName;
				additionalNotes =
					(snapshot.val() && snapshot.val().additionalNotes) || "";
				default_style = snapshot.val() && snapshot.val().default_style;
				writtingSample =
					(snapshot.val() && snapshot.val().writtingSample) || "";
				isTextbox = (snapshot.val() && snapshot.val().isTextbox) || false;
			},
			{
				onlyOnce: true,
			}
		);
	});

	function writeUserData() {
		set(ref(database, "users/" + userID), {
			name: name,
			additionalNotes: additionalNotes,
			default_style: default_style,
			writtingSample: writtingSample,
			isTextbox: isTextbox,
			resume: resume,
			resumeFileName: resumeFileName,
		});
	}

	async function generateCoverLetter() {
		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				"A good cover letter shows sincere enthusiasm, is personal, relevant to the job description, and professional. \n\
				Here is a resume: ‘{resume}’ \n\
				Here is a job description: ‘{jobDescription}’ \n\
				Please develop a bullet point outline for a cover letter based on the resume and job description provided. \n\
				Please write the cover letter based on the outline, drawing on the resume. ‘{style}’ \n\
				Emphasize how I would contribute to the role based on the experiences on the resume. \n\
				There should be a new line between each paragraph, the greeting should say 'Dear Hiring Manager,', and the sign off should say 'Sincerely, {name}' \n\
				{additionalNotes}."
			),
		]);

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
			temperature: 0.1,
		});

		const chain = new LLMChain({
			llm: model,
			prompt: prompt,
		});

		const response = await chain.call({
			resume: resume,
			jobDescription: jobDescription,
			style: style,
			additionalNotes: additionalNotes,
			name: name,
		});

		return response.text;
	}

	async function reviewCoverLetter(letter) {
		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				"You are a career advisor helping students write cover letters. You know that the great cover letters are simultaneously personal, show genuine enthusiasm, and are professional. A student gives you the following cover letter: '{letter}' Edit it to be more personal, more genuinely enthusiastic and human, but not unprofessional or informal. Here is the job description it is based on '{jobDescription}' and here is their resume: '{resume}'"
			),
		]);

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
			temperature: 0.1,
			streaming: true,
		});

		const chain = new LLMChain({
			llm: model,
			prompt: prompt,
		});

		navigate("/letter");

		const response = await chain.call(
			{
				letter: letter,
				jobDescription: jobDescription,
				resume: resume,
			},
			[
				{
					handleLLMNewToken(token) {
						coverLetter.update((letter) => letter + token);
					},
				},
			]
		);
	}

	function setStyle() {
		switch (default_style) {
			case "Very Formal":
				style = "I want to come accross as sounding very formal";
				break;
			case "Enthusiastic and Passionate":
				style = "I want to come accross as enthusiastic and passionate";
				break;
			case "Narrative-Oriented":
				style = "I want it to sound narrative-oriented";
				break;
			case "Visionary":
				style = "I want to come accross as a visionary";
				break;
			case "Precise and Qualification-Driven":
				style = "I want you to emphasize my qualification with precise figures";
				break;
		}
	}

	async function handleFileChange(event) {
		const file = event.target.files[0];
		resumeFileName = file.name;

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
				resume = textContent;
			}
		};
		reader.readAsArrayBuffer(file);
	}

	const toggleInputType = () => {
		isTextbox = !isTextbox;
	};
</script>

<div class="w-screen h-screen flex flex-col gap-4 items-center justify-center">
	<form on:submit={handleSubmit} class="p-6 bg-gray-100 shadow-md rounded-md">
		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Style</h2>
			<p class="text-sm text-gray-600 mb-2">
				Choose from a number of default writting styles, or imitate your own by
				pasting in a past cover letter
			</p>
			<div class="mb-2">
				<button
					type="button"
					class="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
					on:click={toggleInputType}
				>
					{isTextbox ? "Default Styles" : "Select Writting Sample"}
				</button>
			</div>
			{#if !isTextbox}
				<select
					bind:value={default_style}
					class="w-full p-2 border border-gray-300 rounded"
				>
					<option disabled selected value> -- select an option -- </option>
					<option>Very Formal</option>
					<option>Enthusiastic and Passionate</option>
					<option>Narrative-Oriented</option>
					<option>Visionary</option>
					<option>Precise and Qualification-Driven</option>
				</select>
			{:else}
				<textarea
					bind:value={writtingSample}
					placeholder="Paste your writting sample here"
					rows="3"
					cols="50"
					class="w-full p-2 border border-gray-300 rounded"
				/>
			{/if}
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Resume</h2>
			<div class="flex items-center">
				<label
					for="resume-upload"
					class="relative inline-block cursor-pointer bg-blue-500 text-white px-4 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-blue-600"
				>
					Upload PDF
					<input
						id="resume-upload"
						class="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0"
						type="file"
						accept=".pdf"
						on:change={handleFileChange}
					/>
				</label>
				<div class="ml-4 text-gray-600 text-sm">
					{resumeFileName || ""}
				</div>
			</div>
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Job Description</h2>
			<textarea
				bind:value={jobDescription}
				placeholder="Paste the job description here"
				rows="3"
				cols="50"
				class="w-full p-2 border border-gray-300 rounded"
			/>
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Additional Notes</h2>
			<textarea
				bind:value={additionalNotes}
				placeholder="e.g. Highlight my data science skills and interest in public policy"
				rows="3"
				cols="50"
				class="w-full p-2 border border-gray-300 rounded"
			/>
		</div>

		<div class="mb-4">
			<button
				type="submit"
				class="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
				>Submit
			</button>
		</div>
	</form>
</div>
