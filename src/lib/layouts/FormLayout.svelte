<script>
	import { coverLetter } from "$/stores/coverLetter";
	import { LLMChain } from "langchain/chains";
	import { ChatOpenAI } from "langchain/chat_models/openai";
	import {
		ChatPromptTemplate,
		HumanMessagePromptTemplate,
	} from "langchain/prompts";
	import { navigate } from "svelte-navigator";

	let style;
	let resume;
	let jobDescription = "";
	let additionalNotes = "";
	let writtingSample = "";
	let isTextbox = false;

	async function generateCoverLetter() {
		if (!isTextbox) {
			// handles style or writting sample
			setStyle();
		} else {
			style =
				"Copy the writting style and syntactic quirks of the following cover letter: " +
				writtingSample;
		}

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
			temperature: 0.9,
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
			temperature: 0.9,
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
		switch (style) {
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

	const handleFileChange = (event) => {
		resume = event.target.files[0];
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (
			(!style && writtingSample.trim() === "") ||
			!resume ||
			jobDescription.trim() === ""
		) {
			alert("Please fill out all fields.");
		} else {
			// Handle form submission logic here
			navigate("/loading1");
			generateCoverLetter().then((letter) => reviewCoverLetter(letter));
		}
	};

	const toggleInputType = () => {
		isTextbox = !isTextbox;
	};
</script>

<div class="w-screen h-screen flex flex-col gap-4 items-center justify-center">
	<form on:submit={handleSubmit} class="p-6 bg-gray-100 shadow-md rounded-md">
		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Multiple Choice Field</h2>
			<p class="text-sm text-gray-600 mb-2">Select an option from below:</p>
			<div class="mb-2">
				<button
					type="button"
					class="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
					on:click={toggleInputType}
				>
					{isTextbox ? "Switch to select" : "Switch to text input"}
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
					bind:value={writtingSample}
					rows="3"
					cols="50"
					class="w-full p-2 border border-gray-300 rounded"
				/>
			{/if}
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">PDF Upload</h2>
			<p class="text-sm text-gray-600 mb-2">Select a PDF file to upload:</p>
			<input
				type="file"
				accept=".pdf"
				on:change={handleFileChange}
				class="w-full p-2 border border-gray-300 rounded"
			/>
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Text Section 1</h2>
			<p class="text-sm text-gray-600 mb-2">Paste your text here:</p>
			<textarea
				bind:value={jobDescription}
				rows="3"
				cols="50"
				class="w-full p-2 border border-gray-300 rounded"
			/>
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold mb-2">Text Section 2</h2>
			<p class="text-sm text-gray-600 mb-2">Paste more text here:</p>
			<textarea
				bind:value={additionalNotes}
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
