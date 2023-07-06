<script>
	import { abortStoredController, storeController } from "$/stores/controller";
	import { coverLetter } from "$/stores/coverLetter";
	import { onValue, ref, set } from "firebase/database";
	import { LLMChain } from "langchain/chains";
	import { ChatOpenAI } from "langchain/chat_models/openai";
	import { HumanMessagePromptTemplate } from "langchain/prompts";
	import * as pdfjsLib from "pdfjs-dist/build/pdf";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";
	import { auth, database } from "../plugins/firebase/firebase";
	import Navbar from '../components/Navbar.svelte';



	let style = "custom";
	let uploadedResumes = ["Resume1.pdf", "Resume2.pdf"];
	let resume = uploadedResumes[uploadedResumes.length - 1];
	let additionalNotes = "";
	let jobDescription = "";
	let writingSample1 = "";
	let writingSample2 = "";
	let selectedPrompt = "";
	let isSample = true;

	let writingSample1FileName = "";
	let writingSample2FileName = "";

	const userID = auth.currentUser.uid;
	const name = auth.currentUser.displayName;
	let controller;
	
	uploadedResumesStore.subscribe(value => {
    uploadedResumes = value;
});


	onMount(() => {
		abortStoredController();
		onValue(
			ref(database, "/users/" + userID),
			(snapshot) => {
				let userValue = snapshot.val();
				if (userValue) {
					resume = userValue.resume || resume;
					additionalNotes = userValue.additionalNotes || additionalNotes;
					style = userValue.style || style;
					writingSample1 = userValue.writingSample1 || writingSample1;
					writingSample2 = userValue.writingSample2 || writingSample2;
				}
			},
			{
				onlyOnce: true,
			}
		);
	});

	const handleFormSubmit = async (event) => {
		event.preventDefault();
		writeUserData();
		coverLetter.set("");
		generateCoverLetter();
	};

	function writeUserData() {
		set(ref(database, "users/" + userID), {
			name: name,
			additionalNotes: additionalNotes,
			style: style,
			writingSample1: writingSample1,
			writingSample2: writingSample2,
			resume: resume
		});
	}

	async function generateCoverLetter() {
		const controller = new AbortController();
		storeController(controller);
		let prompt;
		if (isSample) {
			if (selectedPrompt == "sample-1"){
				prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					prompts["1-sample"]),
			]);
			} else if (selectedPrompt == "sample-2"){
				prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					prompts["2-sample"]),
			]);
			}
		} else {
			if (selectedPrompt == "enthusiastic"){
				prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					prompts["enthusiastic"]),
			]);
			} else if (selectedPrompt == "formal"){
				prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					prompts["formal"]),
			]);
			} else if (selectedPrompt == "narrative"){
				prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					prompts["narrative"]),
			]);
			} else if (selectedPrompt == "qualification-driven"){
				prompt = ChatPromptTemplate.fromPromptMessages([
				HumanMessagePromptTemplate.fromTemplate(
					prompts["qualification-driven"]),
			]);
			}
		}
	}

	function handleStyleChange(event) {
		style = event.target.value;
	}

	function handleFileChange(event, target) {
		const file = event.target.files[0];
		// Rest of the handleFileChange() as in old layout
	}

	function handleResumeChange(event) {
		resume = event.target.value;
	}

		function selectStyle(style) {
			sectionStyle = style;
		}

		let prompts = {
			"1-sample" : "",
			"2-sample" : "",
			"qualification-driven" : "",
			"narrative" : "",
			"enthusiastic": "",
			"formal"
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
