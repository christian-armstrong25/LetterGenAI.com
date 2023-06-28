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

	let style;
	let resume;
	let resumeFileName = "";
	let jobDescription = "";
	let additionalNotes = "";
	let writingSample = "";
	let isTextbox = false;
	const userID = auth.currentUser.uid;
	const name = auth.currentUser.displayName;

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (
			(!isTextbox && !style) ||
			(isTextbox && writingSample.trim() === "") ||
			!resume ||
			jobDescription.trim() === ""
		) {
			alert("Please fill out all fields.");
		} else {
			writeUserData();
			coverLetter.set("");
			generateCoverLetter();
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
				style = snapshot.val() && snapshot.val().style;
				writingSample = (snapshot.val() && snapshot.val().writingSample) || "";
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
			style: style,
			writingSample: writingSample,
			isTextbox: isTextbox,
			resume: resume,
			resumeFileName: resumeFileName,
		});
	}

	async function generateCoverLetter() {
		let prompt;
		if (!isTextbox) {
			// default styles
			prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					"Welcome, Career Advisor! Today, we're pairing you with a student, {name}, who needs your expert touch to craft a stellar cover letter. This is more than just a task—it's a mission to present {name} as the ideal candidate for their dream role. We'll need to synthesize their resume, the job description, and their unique voice to tell a compelling story. Let's dive right in: \n\
				Here is {name}'s resume: ‘’’{resume}’’’ \n\
And the job description: ‘’’{jobDescription}’’’ \n\
Step 1: Getting Personal: First impressions matter! Using {name}'s resume and job description as a guide, could you draft an engaging introduction that not only expresses their sincere interest in the role but also demonstrates their understanding of the company's mission, culture, or recent initiatives? \n\
Step 2: Matching Skills: Let's align {name}'s qualifications and achievements with the job requirements. Highlight a project or experience where {name} used similar skills or faced similar challenges to what they'll encounter at the company. Be sure to provide quantifiable results to show the impact of their work. Also, let's emphasize how these experiences specifically prepare {name} for the role they are applying for. \n\
Step 3: Demonstrating Potential: What makes {name} a great candidate? Elaborate on how their past experiences will contribute to the company and role. Be explicit—how exactly do {name}'s skills and achievements meet the company's needs? Also, let's weave in aspects of {name}'s personality and motivations that make them a cultural fit for the company. \n\
Step 4: Wrapping Up: We're almost there! Let's write a closing paragraph expressing gratitude for the reader's time, {name}'s eagerness to discuss further in an interview, and their excitement about the unique contributions they can make to the company. \n\
Step 5: Signing Off: And finally, let's bid them adieu with a 'Sincerely, {name}'. \n\
Remember, {name} prefers their letter to be written in a {style} style. It's a challenging task, but we have faith in your skills to create a cover letter that is professional, engaging, and truly encapsulates {name}'s personality and potential. Notes: Do not label the steps you take, only show the end result, which should be a cover letter. Also, the greeting should just be 'Dear Hiring Manager,' {additionalNotes}"
				),
			]);
		} else {
			// writing sample
			prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					"Welcome, Career Advisor! Today, we're pairing you with a student, {name}, who needs your expert touch to craft a stellar cover letter. This is more than just a task—it's a mission to present {name} as the ideal candidate for their dream role. We'll need to synthesize their resume, the job description, and their unique voice from a writing sample to tell a compelling story. Let's dive right in: \n\
Here is {name}'s resume: ‘’’{resume}’’’ \n\
Here is {name}’s writing sample: ‘’’{writingSample}’’’ \n\
And the job description: ‘’’{jobDescription}’’’ \n\
Step 1: Getting Personal: First impressions matter! Using {name}'s resume and job description as a guide, could you draft an engaging introduction that not only expresses their sincere interest in the role but also demonstrates their understanding of the company's mission, culture, or recent initiatives? \n\
Step 2: Matching Skills: Let's align {name}'s qualifications and achievements with the job requirements. Highlight a project or experience where {name} used similar skills or faced similar challenges to what they'll encounter at the company. Be sure to provide quantifiable results to show the impact of their work. Also, let's emphasize how these experiences specifically prepare {name} for the role they are applying for. \n\
Step 3: Demonstrating Potential: What makes {name} a great candidate? Elaborate on how their past experiences will contribute to the company and role. Be explicit—how exactly do {name}'s skills and achievements meet the company's needs? Also, let's weave in aspects of {name}'s personality and motivations that make them a cultural fit for the company. \n\
Step 4: Wrapping Up: We're almost there! Let's write a closing paragraph expressing gratitude for the reader's time, {name}'s eagerness to discuss further in an interview, and their excitement about the unique contributions they can make to the company. \n\
Step 5: Signing Off: And finally, let's bid them adieu with a 'Sincerely, {name}'. \n\
Remember, {name} prefers their letter to be written in their own voice based on their writing sample. It's a challenging task, but we have faith in your skills to create a cover letter that is professional, engaging, and truly encapsulates {name}'s personality and potential. Notes: Do not label the steps you take, only show the end result, which should be a cover letter. Also, the greeting should just be 'Dear Hiring Manager,' {additionalNotes}"
				),
			]);
		}

		const model = new ChatOpenAI({
			openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
			streaming: true,
		});

		const chain = new LLMChain({
			llm: model,
			prompt: prompt,
		});

		navigate("/letter");

		const response = await chain.call(
			{
				jobDescription: jobDescription,
				resume: resume,
				writingSample: writingSample,
				style: style,
				name: name,
				additionalNotes: additionalNotes,
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
				Choose from a number of default writing styles, or imitate your own by
				pasting in a past cover letter
			</p>
			<div class="mb-2">
				<button
					type="button"
					class="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
					on:click={toggleInputType}
				>
					{isTextbox ? "Default Styles" : "Select Writing Sample"}
				</button>
			</div>
			{#if !isTextbox}
				<select
					bind:value={style}
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
					bind:value={writingSample}
					placeholder="Paste your writing sample here"
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
				placeholder="e.g. Highlight my data science skills and interest in public policy. Mention that I how I know John from IT."
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
