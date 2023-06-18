<script>
	import { onMount } from "svelte";
	import { ref, set, onValue } from "firebase/database";
	import { database, auth } from "../plugins/firebase/firebase.ts";
	import { coverLetter } from "$/stores/coverLetter";
	import { navigate } from "svelte-navigator";
	import { LLMChain } from "langchain/chains";
	import { ChatOpenAI } from "langchain/chat_models/openai";
	import {
		ChatPromptTemplate,
		HumanMessagePromptTemplate,
	} from "langchain/prompts";

	let default_style;
	let style;
	let resume;
	let resumeFileName = "";
	let jobDescription = "";
	let additionalNotes = "";
	let writtingSample = "";
	let isTextbox = false;
	const userID = auth.currentUser.uid;

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (
			(!default_style && writtingSample.trim() === "") ||
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
				name =
					(snapshot.val() && snapshot.val().name) ||
					auth.currentUser.displayName;
				resume = snapshot.val() && snapshot.val().resume;
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
			userID: userID,
			resume: resume,
			additionalNotes: additionalNotes,
			default_style: default_style,
			writtingSample: writtingSample,
			isTextbox: isTextbox,
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
				Please remove the text above the greeting. \n\
				Please replace [Recipient's Name] with Hiring Manager.\n\
				{additionalNotes}"
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
		});

		return response.text;
	}

	async function reviewCoverLetter(letter) {
		const prompt = ChatPromptTemplate.fromPromptMessages([
			HumanMessagePromptTemplate.fromTemplate(
				"You are a career advisor helping students write cover letters. You know that the great cover letters are simultaneously personal, show genuine enthusiasm, and professional. A student gives you the following cover letter: '{letter}' Edit it to be more personal, more genuinely enthusiastic and human, but not unprofessional or informal."
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
				style = "Make it sound very formal";
				break;
			case "Enthusiastic and Passionate":
				style = "Make it sound enthusiastic and passionate";
				break;
			case "Narrative-Oriented":
				style = "Make it sound narrative-oriented";
				break;
			case "Visionary":
				style = "Make it sound visionary";
				break;
			case "Precise and Qualification-Driven":
				style = "Make it sound precise and qualification driven";
				break;
		}
	}

	const handleFileChange = async (event) => {
		resume = event.target.files[0];
	};

	const toggleInputType = () => {
		isTextbox = !isTextbox;
	};
</script>

<div class="w-screen h-screen flex flex-col gap-4 items-center justify-center">
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
		integrity="sha512-ml/QKfG3+Yes6TwOzQb7aCNtJF4PUyha6R3w8pSTo/VJSywl7ZreYvvtUso7fKevpsI+pYVVwnu82YO0q3V6eg=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	></script>
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
			<input
				type="file"
				accept=".pdf"
				on:change={handleFileChange}
				class="w-full p-2 border border-gray-300 rounded"
			/>
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
