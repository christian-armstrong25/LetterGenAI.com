<script>
	import { onMount, onDestroy } from 'svelte';
	import Navbar from '../components/Navbar.svelte';
	import { navigate } from 'svelte-navigator';
	import { jsPDF } from "jspdf";
	import docxtemplater from 'docxtemplater';
	import PizZip from 'pizzip';
	import { saveAs } from 'file-saver';  
	import { coverLetter } from "../stores/coverLetter";

	let coverLetterValue = '';
	coverLetter.subscribe(value => {
		coverLetterValue = value
		.replace(/\n/g, '<br />')
		.replace(/^ +/gm, (match) => match.replace(/ /g, "&nbsp;"));
	});

	let words = coverLetterValue.split(/( |<br \/>)/);
	let index = 0;
  
	let interval;
	function addWord() {
	  if (index < words.length) {
		coverLetterValue += words[index];
		index++;
	  } 	
	}
  

	onMount(() => {
	  interval = setInterval(addWord, 1);  // Add a word every 1 ms
	});


    function prepareTextForExport() {
        let text = coverLetterValue.replace(/<br \/>/g, "\n"); // replace all <br />
        text = text.replace(/<div>/g, "\n"); // replace opening <div> with \n
        text = text.replace(/<\/div>/g, ""); // remove closing </div>
        return text;
    }

    async function exportPDF() {
        const doc = new jsPDF();
        const text = prepareTextForExport();
        doc.text(text, 10, 10);
        doc.save("coverLetter.pdf");
    }

	async function loadFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
    }
    return await response.arrayBuffer();
}


async function exportDoc() {
  let docContent = prepareTextForExport();
  try {
    const content = await loadFile("/template.docx");
    const zip = new PizZip(content);
    const doc = new docxtemplater().loadZip(zip);
    doc.setData({ content: docContent }); // set your string data here
    doc.render();
    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    saveAs(out, `MyString.docx`);
  } catch (error) {
    let e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({error: e}));
    throw error;
  }
}

	let isCopied = false;
  	let cursorPosition = {x: 0, y: 0};  // default cursor position
  
  function showCopyTooltip(e) {
    cursorPosition = {x: e.clientX, y: e.clientY};  // capture cursor position
    isCopied = true;
    setTimeout(() => isCopied = false, 500);  // Disappear after 2 seconds
  }
  
  function copyToClipboard(e) {
    const text = prepareTextForExport();
    navigator.clipboard.writeText(text);
    showCopyTooltip(e);  // Show the tooltip after copying
  }
  </script>
  
  <style>
	.all {
	  background-color: #22385F;
	  color: white;
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  justify-content: center;
	  height: 100vh;
	  margin: 0;
	  padding: 0;
	}
	
	.coverLetter {
	  width: 33rem;
	  height: 37rem;
	  margin-left: 4rem;
	  margin-right:5rem;
	  padding:0rem;
	  margin-top: 0rem;
	  margin-bottom:6rem;
	  background-color: white;
	  color: black;
	  font-size:0.63rem;
	  text-align: center;
	}

	#cover-letter-text{
		text-align:left;
		padding-left:3.7rem;
		padding-right:4.2rem;
		padding-top:2rem;
		padding-bottom:3.5rem;
		font-family:'Times New Roman', Times, serif;
		font-weight:normal;
	}

	.right{
		margin-left: 5rem;
	}
  
	.export {
	  width: 20rem;
	  height: 12rem;
	  padding: 1em;
	  background-color: white;
	  color: black;
	  text-align: center;
	}
  
	.button {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background-color: white;
	  color: black;
	  margin-top: 1em;
	  padding: 0.5em;
	  padding-right:1rem;
	  border: none;
	  cursor: pointer;
	}

	.export h2{
		padding-bottom:2rem;
	}

	.export img{
		width:5rem;
		padding-left:0.3rem;
		padding-right:0.3rem;
		cursor:pointer;
	}
  
	.button img {
		width:2rem;
		height:auto;
	  margin-right: 0.5em;
	}

	#edit-letter{
		color:white;
		padding:0;
		margin:0;
		font-size:0.95rem;
	}

	.copy-tooltip {
    position: fixed;
    background: #333;
    color: #fff;
    padding: 10px;
    border-radius: 3px;
    font-size: 0.75em;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.1s linear;
  }
  
  .copy-tooltip.visible {
    visibility: visible;
    opacity: 1;
  }
  </style>
  
  <Navbar />
  <div class='all'>
  <div class="coverLetter">
	<p id="cover-letter-text" contenteditable bind:innerHTML={coverLetterValue}></p>
	<p id="edit-letter">Click on Letter to Edit</p>
  </div>
  
  <div class="right">
	<div class="export">
		<h2>Export</h2>
		<img src="/pdf_export.png" alt="PDF Export" on:click={exportPDF} />
		<img src="/doc_export.png" alt="DOC Export" on:click={exportDoc} />
		<img src="/copy_export.png" alt="Copy Export" on:click={copyToClipboard} />
	</div>

	<div class="copy-tooltip {isCopied ? 'visible' : ''}" style="left: {cursorPosition.x}px; top: {cursorPosition.y}px;">
		Copied to Clipboard!
	  </div>
  
  <button class="button" on:click={() => navigate('/')}>
	<img src="LetterGen.ico" alt="Generate Icon" />
	Generate New Letter
  </button>
  </div>
</div>
<!-- <script>
	import html2pdf from "html2pdf.js";
	import { Link } from "svelte-navigator";
	import { coverLetter } from "../stores/coverLetter";

	let coverLetterValue = "";
	let editableDiv;

	coverLetter.subscribe((value) => {
		coverLetterValue = value
			.replace(/\n/g, "<br>")
			.replace(/^ +/gm, (match) => match.replace(/ /g, "&nbsp;"));
		if (editableDiv) {
			editableDiv.innerHTML = coverLetterValue;
		}
	});

	function exportPdf() {
		const element = document.createElement("div");
		element.innerHTML = `<div style="font-family: 'Times New Roman', sans-serif; font-size: 14pt; color: black; padding: 72pt; line-height: 1.5;">${coverLetterValue}</div>`;

		html2pdf()
			.set({ html2canvas: { scale: 4 } })
			.from(element)
			.save("coverLetter.pdf");
	}

	function updateCoverLetter() {
		const content = editableDiv.innerHTML
			.replace(/<br>/g, "\n")
			.replace(/&nbsp;/g, " ");
		coverLetter.set(content);
	}
</script>

<div class="flex flex-col min-h-screen bg-gray-100">
	<div class="flex-grow flex items-center justify-center m-6">
		<div class="max-w-xl mx-auto p-8 bg-white rounded shadow-md">
			<p class="text-gray-500 text-xs italic mb-4">
				Click on the text below to edit.
			</p>
			<div
				class="text-black text-xs font-serif m-6 leading-relaxed p-6"
				contenteditable
				bind:this={editableDiv}
				on:blur={updateCoverLetter}
			>
				{@html coverLetterValue}
			</div>

			<slot />
			<div class="flex justify-center mt-3">
				<div class="inline-flex space-x-4">
					<Link
						on:click={() => coverLetter.set("")}
						to="/form"
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
					>
						Generate New Letter
					</Link>
					<button
						on:click={exportPdf}
						class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
					>
						Export to PDF
					</button>
				</div>
			</div>
		</div>
	</div>
</div> -->
