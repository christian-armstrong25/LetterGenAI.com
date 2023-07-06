<script>
	import { abortStoredController, storeController } from "$/stores/controller";
	import { coverLetter } from "$/stores/coverLetter";
	import { onValue, ref, set } from "firebase/database";
	import * as pdfjsLib from "pdfjs-dist/build/pdf";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";
	import { auth, database } from "../plugins/firebase/firebase";
	import { uploadedResumesStore } from '$/stores/resumes';
	import { ChatOpenAI } from "langchain/chat_models/openai";
	import {
		ChatPromptTemplate,
		HumanMessagePromptTemplate,
	} from "langchain/prompts";
    import { SequentialChain, LLMChain } from "langchain/chains";
    import { OpenAI } from "langchain/llms/openai";
    import { PromptTemplate } from "langchain/prompts";

	let style = "custom";
	let uploadedResumes = [];
    let resumesAll = []
	let resume = uploadedResumes[uploadedResumes.length - 1];
    let sectionStyle = "custom"
    let selectedResume = resume
	let additionalNotes = "";
	let jobDescription = "";
	let writingSample1 = "";
	let writingSample2 = "";
	let selectedPrompt = "";
	let isSample = true;
    let styleSelection =""

	let writingSample1FileName = "";
	let writingSample2FileName = "";
    let uploadedResume = ""

	const userID = auth.currentUser.uid;
	const name = auth.currentUser.displayName;
	let controller;

    uploadedResumesStore.subscribe(value => {
    uploadedResumes = value.reverse(); // This will reverse the order of resumes
});

let selectedResumeIndex = uploadedResumes.length > 0 ? 0 : -1; // Initialize selectedResumeIndex as 0 if there is at least one uploaded resume

// Calculate selectedResume based on selectedResumeIndex
$: selectedResume = selectedResumeIndex > -1 ? uploadedResumes[selectedResumeIndex] : null;

onMount(() => {
    abortStoredController();
    onValue(
        ref(database, "/users/" + userID + "/uploadedResumes"),
        (snapshot) => {
            let userValue = snapshot.val();
            if (userValue) {
                uploadedResumesStore.set(userValue.map(resume => {
                    return { name: resume.name, content: resume.content }; // return as dictionary
                }));
            }
        },
        {
            onlyOnce: true,
        }
    );
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

    const handleSubmit = async (event) => {
        const finalResume = selectedResume ? selectedResume.content : null;
        if (
            (!isSample && !style) ||
            (isSample && writingSample1.trim() === "") ||
            !selectedResume || // Use selectedResume instead of resume
            jobDescription.trim() === ""
        ) {
            alert("Please fill out all fields.");
        } else {
            setStyle();
            writeUserData();
            coverLetter.set("");
            console.log("job description: " + jobDescription.trim())
            console.log("style: " + style)
            console.log("is-sample: " + isSample)
            console.log("sample-1: " + writingSample1)
            console.log("sample-2: " + writingSample2)
            console.log("selected resume: " + finalResume) // Use selectedResume instead of resume
            console.log("notes: " + additionalNotes)
            generateCoverLetter(finalResume);
            navigate("/loading1")
        }
    };


    function writeUserData() {
        set(ref(database, "users/" + userID), {
            name: name,
            additionalNotes: additionalNotes,
            style: style,
            writingSample1: writingSample1,
            writingSample2: writingSample2,
            resume: selectedResume // Use selectedResume instead of resume
        });
    }


    async function generateCoverLetter(finalResume) {
  const controller = new AbortController();
  storeController(controller);

  const model = new OpenAI({
    openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
  });

  let promptTemplate, promptTemplate2;
  switch(style) {
    case "sample-1":
      promptTemplate = new PromptTemplate({
        template: "sample-1-1",
        inputVariables: ["jobDescription", "finalResume"],
      });
      promptTemplate2 = new PromptTemplate({
        template: "sample-1-2",
        inputVariables: ["name", "additionalNotes"],
      });
      break;
      case "sample-2":
      promptTemplate = new PromptTemplate({
        template: "sample-2-1",
        inputVariables: ["jobDescription", "finalResume"],
      });
      promptTemplate2 = new PromptTemplate({
        template: "sample-2-2",
        inputVariables: ["name", "additionalNotes"],
      });
      break;
    case "formal":
      promptTemplate = new PromptTemplate({
        template: "Formal1",
        inputVariables: ["jobDescription", "finalResume"],
      });
      promptTemplate2 = new PromptTemplate({
        template: "Formal2",
        inputVariables: ["name", "additionalNotes"],
      });
      break;
    case "narrative":
      promptTemplate = new PromptTemplate({
        template: "Narrative1",
        inputVariables: ["jobDescription", "finalResume"],
      });
      promptTemplate2 = new PromptTemplate({
        template: "Narrative2",
        inputVariables: ["name", "additionalNotes"],
      });
      break;
      case "passionate":
      promptTemplate = new PromptTemplate({
        template: "Narrative1",
        inputVariables: ["jobDescription", "finalResume"],
      });
      promptTemplate2 = new PromptTemplate({
        template: "Narrative2",
        inputVariables: ["name", "additionalNotes"],
      });
      break;
    default:
      throw new Error("Invalid style");
  }

  const firstChain = new LLMChain({
  llm: model,
  prompt: promptTemplate,
  outputVariables: ["chain1output"],
});

const secondChain = new LLMChain({
  llm: model,
  prompt: promptTemplate2,
  outputVariables: ["chain2output"],
});

    // Create a SequentialChain combining your first and second chains
    const overallChain = new SequentialChain({
        chains: [firstChain, secondChain],
        inputVariables: ["jobDescription", "finalResume", "writingSample1", "writingSample2", "style", "name", "additionalNotes"],
        outputVariables: ["letterOutput"], // Assume your final output variable from the secondChain is 'finalText'
        verbose: true,
    });

    navigate("/letter");

    const chainExecutionResult = await overallChain.call({
        description: jobDescription.trim(),
        resume: finalResume,
        writingSample1: writingSample1,
        writingSample2: writingSample2,
        style: style,
        name: name,
        additionalNotes: additionalNotes,
    });

    console.log(chainExecutionResult.letterOutput);
}


	function handleStyleChange(event) {
		style = event.target.value;
	}

    function handleFileChange(event, target) {
    const file = event.target.files[0];
    if (target === "sample2") {
        writingSample2FileName = file.name;
        writingSample2 = file.name; // Make sure to set writingSample2
    }
}

function handleFileChange1(event, target) {
    const file = event.target.files[0];
    if (target === "sample1") {
        writingSample1FileName = file.name;
        writingSample1 = file.name; // Make sure to set writingSample2
    }
}

function handleTextAreaChange(event, target) {
    const text = event.target.value;
    if (target === "sample2") {
        if (!writingSample2FileName) { 
            writingSample2 = text; // Make sure to set writingSample2
        }
    }
}

function handleTextAreaChange1(event, target) {
    const text = event.target.value;
    if (target === "sample1") {
        if (!writingSample1FileName) { 
            writingSample1 = text; // Make sure to set writingSample2
        }
    }
}



async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedResume = file.name;

        document.getElementById('loading-resume').style.display = 'block';

        let textContent;
        try {
            textContent = await getTextContentFromFile(file);
        } catch (err) {
            console.error(err);
            alert('Failed to read the resume file.');
            return;
        }

        const resumeData = { name: uploadedResume, content: textContent }; // store as dictionary

        uploadedResumesStore.update(value => {
            return [resumeData, ...value]; // Put new resume at start
        });

        console.log('here')
        set(ref(database, "users/" + userID + "/uploadedResumes"), uploadedResumes);
        console.log('???')
        selectedResume = resumeData;

        document.getElementById('loading-resume').style.display = 'none';
        console.log(uploadedResumes);
    }
}



	function handleResumeChange(event) {
		resume = event.target.value;
	}

		let prompts = {
			"1-sample" : "Write 1-sample",
			"2-sample" : "Write 2-sample",
			"qualification-driven" : "Write qual",
			"narrative" : "Write narrative",
			"enthusiastic": "Write enthusiastic",
			"formal": "Write formal"
		}

    function selectStyle(style) {
        sectionStyle = style;
    }
    function setStyle() {
    if (sectionStyle === 'custom') {
        if (writingSample1 && writingSample2.trim() !== "") { // Ensure writingSample2 is not an empty string
            style = "sample-2"; 
        } else if (writingSample1) {
            style = "sample-1";
        }
    } else {
        style = styleSelection;
    }
}

    function selectDefaultStyle(style) {
        styleSelection = style;
    }

    async function getTextContentFromFile(file) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.js";

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function () {
            if (reader.result instanceof ArrayBuffer) {
                const typedarray = new Uint8Array(reader.result);
                try {
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
                    resolve(textContent);
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(new Error("File could not be read as an ArrayBuffer."));
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
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
        font-size: 1.4rem;
        text-align: center; 
        margin-bottom: 0;
		padding-top:0.7rem;
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
        cursor:pointer;
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
    width:12.5rem; 
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

li{
		font-size:0.9rem;
        margin-right:2rem;
        padding-left:0;
        margin-left:0;
	}

    ul{
        padding-left:0rem;
        margin-left:0;
    }

    .padded{
        padding-bottom:1rem;
        padding-top:1rem;
    }

    .cursor{
        cursor:pointer;
    }

.uploaded{
    font-size:0.65rem;
    padding-top:0.2rem;
}

#uploaded_resume{
    padding-left:1rem;
    padding-top:0;
    padding-bottom:0;
    margin-top:0;
    margin-bottom:0;
}

#loading-resume{
    width:2rem;
    position:absolute;
    top:51%;
    left:40%;
    display:none;
}


</style>

<div id="app">
    <div class="form-container">
        <h1>Create your Cover Letter</h1>
        <div class="section" id="style-sect" style="padding-top: {uploadedResumes.length === 0 ? '1rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Style<span class="required-star">*</span></h2>
			<p id="choose">Choose from a number of default writing styles, or imitate your own by pasting in cover letters or writing samples. </p>
			<div class="toggle-button">
				<button on:click={() => selectStyle('custom')}
						style="color: {sectionStyle === 'custom' ? '#004896' : '#848484'};
							   border-color: {sectionStyle === 'custom' ? '#004896' : '#848484'};
							   background-color: {sectionStyle === 'custom' ? '#DCEDFF' : 'white'};
							   font-weight: {sectionStyle === 'custom' ? 'bold' : 'normal'}">
					Personalized Style
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
                        <button onclick="document.getElementById('getFile1').click()">
                            <div class="logo-container">
                                <img src="/upload-icon.png" alt="Upload Icon" />
                            </div>
                            <div class="text-container" id="upload-1">
                                Upload Sample #1 PDF
                            </div>
                        </button>
                        <div class="uploaded">
                            {writingSample1FileName}
                        </div>
                        <input type='file' id="getFile1" style="display:none" on:change={(e) => handleFileChange1(e, "sample1")}>
                    </div>					                                    
                    <p class="style-or">or</p>
                    <textarea placeholder="Paste your first writing sample here" class="sample-paste"on:change={(e) => handleTextAreaChange1(e, "sample1")}></textarea>
                </div>
				<div class="custom-style">
                    <div class="file-upload">
                        <button onclick="document.getElementById('getFile2').click()">
                            <div class="logo-container">
                                <img src="public/upload-icon.png" alt="Upload Icon" />
                            </div>
                            <div class="text-container">
                                Upload Sample #2 (Optional)
                            </div>
                        </button>
                        <div class="uploaded">
                            {writingSample2FileName}
                        </div>
                        <input type='file' id="getFile2" style="display:none" on:change={(e) => handleFileChange(e, "sample2")}>
                    </div>		                                    
                    <p class="style-or">or</p>
                    <textarea placeholder="Paste your second writing sample here (Optional)" class="sample-paste" on:change={(e) => handleTextAreaChange(e, "sample2")}></textarea>
                </div>
		</div>
            {:else}
            <div class="base-style">
                <ul>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="very_formal" on:click={() => selectDefaultStyle('formal')}/>
                      Very Formal
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="enthusiastic" on:click={() => selectDefaultStyle('enthusiastic')}/>
                      Enthusiastic and Passionate
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="narrative" on:click={() => selectDefaultStyle('narrative')}/>
                      Narrative-Oriented
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="visionary" on:click={() => selectDefaultStyle('visionary')}/>
                      Visionary
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="precise" on:click={() => selectDefaultStyle('precise')}/>
                      Precise and Qualification-Driven
                    </label>
                  </li>
                </ul>
              </div>
              
            {/if}
        </div>

        <div class="section" style="padding-top: {uploadedResumes.length === 0 ? '0.5rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Resume<span class="required-star">*</span></h2>
            {#if uploadedResumes.length > 0}
            <select bind:value={selectedResumeIndex}>
                {#each uploadedResumes as resume, index (resume.name)}
                    <option value={index}>{resume.name === (selectedResume ? selectedResume.name : '') ? `Selected: ${resume.name}` : resume.name}</option>
                {/each}
            </select>              
                
            <p class="style-or">or</p>
            {/if}
            <div class="file-upload" id="resume-upload" style="display: flex; align-items: center;">
                <button onclick="document.getElementById('resumeUpload').click()">
                    <div class="logo-container">
                        <img src="public/upload-icon.png" alt="Upload Icon" />
                    </div>
                    <div class="text-container">
                        Upload New PDF
                    </div>
                </button>
                <input type='file' id="resumeUpload" style="display:none" on:change={handleResumeUpload}>
                <p id="uploaded_resume">{uploadedResume}</p>
            </div>      
        </div>


        <div class="section" style="padding-top: {uploadedResumes.length === 0 ? '0.5rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Job Description<span class="required-star">*</span></h2>
            <textarea bind:value={jobDescription} placeholder="Paste the job description here"></textarea>
        </div>

        <div class="section" id="additional" style="padding-top: {uploadedResumes.length === 0 ? '0.5rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Additional Notes (Optional)</h2>
            <p id="additional-label">Include any additional notes or ideas you want to highlight</p>
            <textarea bind:value={additionalNotes} placeholder="Any additional notes, e.g. “Highlight my data science skills and interest in public policy”"></textarea>
        </div>

        <button class="generate-button" on:click|stopPropagation={handleSubmit} style="margin-top: {uploadedResumes.length === 0 ? '1rem' : '0rem'};">Generate Letter</button>
    </div>
</div>

<img src="loading-resume.gif" id="loading-resume"/>