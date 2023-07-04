<script>

	import Navbar from '../components/Navbar.svelte';
	
		let sectionStyle = "custom";
		let uploadedResumes = ["Resume1.pdf", "Resume2.pdf"];
		let selectedResume = uploadedResumes[uploadedResumes.length - 1];
		let additionalNotes = '';
		let jobDescription = '';
	
		function selectStyle(style) {
			sectionStyle = style;
		}
	</script>
	
	<style>
		#app {
			background-color: #22385F;
			font-family: 'Roboto', sans-serif;
			margin:0;
			padding:0;
			padding-top:0.5rem;
			width:100vw;
			height:100vh;
		}
		.form-container {
			background-color: white;
			max-width: 43rem; 
			margin: 0rem auto; 
			padding: 2em;
			padding-top:0rem;
			height: 93.5vh; 
			overflow: auto; 
		}
		.form-container h1 {
			font-size: 1.3rem;
			text-align: center; 
			margin-bottom: 0;
			padding-top:1rem;
			margin-top:0;
			padding-bottom:0;
		}
		.section h2 {
			font-size: 1.1rem;
			color: #000;
			margin-bottom: 0.5em;
			margin-top:0;
		}
		.section {
			margin-bottom: 1rem;
			padding: 1em; 
			margin-top:0rem;
			padding-top:0rem;
			border-radius: 5px; 
		}
		.toggle-button button {
			border: solid 1px;
			padding: 0.2rem 1em;
			border-radius: 0;
			font-size:0.9rem;
			margin-top:1rem;
			margin-bottom:0.5rem;
			cursor:pointer;
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
		.custom-style{
			margin-top:1rem;
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
			background-color: #0C44A5;
			color: white;
			padding: 0.9em 2rem;
			display: block;
			margin: 0 auto;
			border:none;
			font-size:0.9rem;
		}
		select {
			color: #125208;
			border-color: #125208;
			background-color: #F1FFF4;
			font-size:0.8rem;
			border:solid 0.1rem;
			padding-top:0.25rem;
			padding-bottom:0.25rem;
		}
		.required-star {
			color: red;
		}
	
		p{
			font-size:0.79rem
		}
		
		textarea{
			font-size: 0.7rem;
			font-family: 'Roboto', sans-serif;
			padding:0.2rem;
			width:15rem;
			height:2rem;
		}
	
		#additional-label{
			padding:0;
			margin:0;
			margin-bottom:0.25rem;
		}
	
		.style-or{
			padding-top:0.5rem;
			padding-bottom:0.5rem;
			margin:0;
			font-size:0.65rem;
		}
	
		.sample-paste{
			padding:0.2rem;
			margin:0;
			width:12rem;
			height:2rem;
		}
	
		.file-upload button{
		display:flex;
		justify-content: space-between;
		align-items: center;
		width:12rem; 
		height:1.6rem;
		font-size:0.75rem;
		border-radius: 0;
		border: none;
		cursor: pointer;
		background-color: #D9D9D9;
	}
	
	.file-upload button img {
		width: 1.2rem; /* Adjust this size according to the logo size you want */
	}
	
	.file-upload button .logo-container {
		padding: 0rem;
		margin-right: 0rem;
		margin-left:0;
		padding-left:0.2rem;
	}
	
	.file-upload button .text-container{
		padding-right:0rem;
	}
	
	#choose{
		padding:0;
		margin:0;
	}
	
	.double{
		display:flex;
		justify-content: space-between;
		margin-right:12rem;
	}
	
	#upload-1{
		padding-right:2.3rem;
	}
	
	#style-sect{
		padding-top:1rem
	}
	
	#resume-upload button{
		width:7rem;
		padding-top:0rem;
		padding-bottom:0rem;
		font-size:0.6rem;
		height:1.4rem;
	}
	
	#additional{
		margin-bottom:0.2rem;
	}


	</style>
	
	<div id="app">
		<Navbar />
		<div class="form-container">
			<h1>Create your Cover Letter</h1>
	
			<div class="section" id="style-sect">
				<h2>Style<span class="required-star">*</span>:</h2>
				<p id="choose">Choose from a number of default writing styles, or imitate your own by pasting in cover letters or writing samples. </p>
				<div class="toggle-button">
					<button on:click={() => selectStyle('custom')}
							style="color: {sectionStyle === 'custom' ? '#004896' : '#848484'};
								   border-color: {sectionStyle === 'custom' ? '#004896' : '#848484'};
								   background-color: {sectionStyle === 'custom' ? '#DCEDFF' : 'white'};
								   font-weight: {sectionStyle === 'custom' ? 'bold' : 'normal'}">
						Custom Style
					</button>
					<button on:click={() => selectStyle('base')}
							style="color: {sectionStyle === 'base' ? '#004896' : '#848484'};
								   border-color: {sectionStyle === 'base' ? '#004896' : '#848484'};
								   background-color: {sectionStyle === 'base' ? '#DCEDFF' : 'white'};
								   font-weight: {sectionStyle === 'base' ? 'bold' : 'normal'}">
						Pre-Selected Style
					</button>
				</div>
				{#if sectionStyle === 'custom'}
				<div class="double">
					<div class="custom-style">
						<div class="file-upload">
							<button onclick="document.getElementById('getFile').click()">
								<div class="logo-container">
									<img src="public/upload-icon.png" alt="Upload Icon" />
								</div>
								<div class="text-container" id="upload-1">
									Upload Sample #1
								</div>
							</button>
							<input type='file' id="getFile" style="display:none">
						</div>					
						<p class="style-or">or</p>
						<textarea placeholder="Paste your first writing sample here" class="sample-paste"></textarea>
					</div>
					<div class="custom-style">
						<div class="file-upload">
							<button onclick="document.getElementById('getFile').click()">
								<div class="logo-container">
									<img src="public/upload-icon.png" alt="Upload Icon" />
								</div>
								<div class="text-container">
									Upload Sample #2 (Optional)
								</div>
							</button>
							<input type='file' id="getFile" style="display:none">
						</div>					
						<p class="style-or">or</p>
						<textarea placeholder="Paste your first writing sample here (Optional)" class="sample-paste"></textarea>
					</div>
			</div>
				{:else}
					<div class="base-style">
						<ul>
							<li><input type="radio" name="style" value="very_formal"/> Very Formal</li>
							<li><input type="radio" name="style" value="enthusiastic"/> Enthusiastic and Passionate</li>
							<li><input type="radio" name="style" value="narrative"/> Narrative-Oriented</li>
							<li><input type="radio" name="style" value="visionary"/> Visionary</li>
							<li><input type="radio" name="style" value="precise"/> Precise and Qualification-Driven</li>
						</ul>
					</div>
				{/if}
			</div>
	
			<div class="section">
				<h2>Resume<span class="required-star">*</span>:</h2>
				<select bind:value={selectedResume}>
					{#each uploadedResumes as resume (resume)}
						<option id="resume-select-option" value={resume}>{resume === selectedResume ? `Selected: ${selectedResume}` : resume}</option>
					{/each}
				</select>
			
				<p class="style-or">or</p>
				<div class="file-upload" id="resume-upload">
					<button onclick="document.getElementById('getFile').click()">
						<div class="logo-container">
							<img src="public/upload-icon.png" alt="Upload Icon" />
						</div>
						<div class="text-container">
							Upload New PDF
						</div>
					</button>
					<input type='file' id="getFile" style="display:none">
				</div>	
					</div>
	
			<div class="section">
				<h2>Job Description<span class="required-star">*</span>:</h2>
				<textarea bind:value={jobDescription} placeholder="Paste the job description here"></textarea>
			</div>
	
			<div class="section" id="additional">
				<h2>Additional Notes (Optional):</h2>
				<p id="additional-label">Include any additional notes or ideas you want to highlight</p>
				<textarea bind:value={additionalNotes} placeholder="Any additional notes, e.g. “Highlight my data science skills and interest in public policy”"></textarea>
			</div>
	
			<button class="generate-button">Generate Letter</button>
		</div>
	</div>
<!-- <script>
	import { abortStoredController, storeController } from "$/stores/controller";
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
	let writingSampleFileName = "";
	let isSample = false;
	const userID = auth.currentUser.uid;
	const name = auth.currentUser.displayName;
	let controller;

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (
			(!isSample && !style) ||
			(isSample && writingSample.trim() === "") ||
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
		abortStoredController();
		onValue(
			ref(database, "/users/" + userID),
			(snapshot) => {
				resume = snapshot.val() && snapshot.val().resume;
				resumeFileName = snapshot.val() && snapshot.val().resumeFileName;
				additionalNotes =
					(snapshot.val() && snapshot.val().additionalNotes) || "";
				style = snapshot.val() && snapshot.val().style;
				writingSample = (snapshot.val() && snapshot.val().writingSample) || "";
				writingSampleFileName =
					snapshot.val() && snapshot.val().writingSampleFileName;
				isSample = (snapshot.val() && snapshot.val().isSample) || false;
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
			isSample: isSample,
			resume: resume,
			resumeFileName: resumeFileName,
			writingSampleFileName: writingSampleFileName,
			jobDescription: jobDescription,
		});
	}

	async function generateCoverLetter() {
		const controller = new AbortController();
		storeController(controller);
		let prompt;
		if (isSample) {
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
		} else {
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

		try {
			await chain.call(
				{
					jobDescription: jobDescription,
					resume: resume,
					writingSample: writingSample,
					style: style,
					name: name,
					additionalNotes: additionalNotes,
					signal: controller.signal,
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
				if (target === "resume") {
					resumeFileName = file.name;
					resume = textContent;
				} else if (target === "writingSample") {
					writingSampleFileName = file.name;
					writingSample = textContent;
				}
			}
		};
		reader.readAsArrayBuffer(file);
	}

	const toggleInputType = () => {
		isSample = !isSample;
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
					{isSample ? "Default Styles" : "Select Writing Sample"}
				</button>
			</div>
			{#if !isSample}
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
				<div class="mb-2">
					<label
						for="writing-upload"
						class="relative inline-block cursor-pointer bg-blue-500 text-white px-4 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-blue-600"
					>
						Upload File
						<input
							id="writing-upload"
							class="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0"
							type="file"
							on:change={(e) => handleFileChange(e, "writingSample")}
						/>
					</label>
					<div class="ml-4 text-gray-600 text-sm">
						{writingSampleFileName || ""}
					</div>
				</div>
				<textarea
					bind:value={writingSample}
					placeholder="Or paste your writing sample here"
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
				placeholder="e.g. Highlight my data science skills and interest in public policy. Mention that I know John from IT."
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
</div> -->
