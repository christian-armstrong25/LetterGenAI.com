<script>
	import docxtemplater from "docxtemplater";
	import { saveAs } from "file-saver";
	import html2pdf from "html2pdf.js";
	import PizZip from "pizzip";
	import { navigate } from "svelte-navigator";
	import Navbar from "../components/Navbar.svelte";
	import { coverLetter } from "../stores/coverLetter";

	let coverLetterValue = "";
	let editableDiv;

	function handleClick() {
		coverLetter.set("");
		navigate("/form");
	}

	function handleKeyDown(event) {
		if (event.key === "Enter" || event.key === " ") {
			exportPDF();
		}
	}

	let coverLetterHTML = "";
	let coverLetterText = "";

	coverLetter.subscribe((value) => {
		coverLetterText = value;
		coverLetterHTML = value
			.replace(/\n/g, "<br>")
			.replace(/^ +/gm, (match) => match.replace(/ /g, "&nbsp;"));
		if (editableDiv) {
			editableDiv.innerHTML = coverLetterHTML;
		}
	});

	function updateCoverLetter() {
		const content = editableDiv.innerHTML
			.replace(/<br>/g, "\n")
			.replace(/&nbsp;/g, " ");
		coverLetter.set(content);
	}

	function exportPDF() {
		const element = document.createElement("div");
		element.innerHTML = `<div style="font-family: 'Times New Roman', sans-serif; font-size: 12pt; color: black; padding: 72pt; line-height: 1.15;">${coverLetterHTML}</div>`;

		html2pdf()
			.set({ html2canvas: { scale: 4 } })
			.from(element)
			.save("coverLetter.pdf");
	}

	async function loadFile(url) {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("HTTP error, status = " + response.status);
		}
		return await response.arrayBuffer();
	}

	async function exportDoc() {
		try {
			const content = await loadFile("/template.docx");
			const zip = new PizZip(content);
			const doc = new docxtemplater().loadZip(zip);
			doc.setData({ content: coverLetterText });
			doc.render();
			const out = doc.getZip().generate({
				type: "blob",
				mimeType:
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			});
			saveAs(out, `MyString.docx`);
		} catch (error) {
			let e = {
				message: error.message,
				name: error.name,
				stack: error.stack,
				properties: error.properties,
			};
			console.log(JSON.stringify({ error: e }));
			throw error;
		}
	}

	let isCopied = false;
	let cursorPosition = { x: 0, y: 0 }; // default cursor position

	function showCopyTooltip(e) {
		cursorPosition = { x: e.clientX, y: e.clientY }; // capture cursor position
		isCopied = true;
		setTimeout(() => (isCopied = false), 500); // Disappear after 2 seconds
	}

	function copyToClipboard(e) {
		navigator.clipboard.writeText(coverLetterText);
		showCopyTooltip(e);
	}
</script>

<Navbar />
<div class="all">
	<div class="coverLetter">
		<div
			id="cover-letter-text"
			contenteditable
			bind:this={editableDiv}
			on:blur={updateCoverLetter}
		>
			{@html coverLetterValue}
		</div>
		<p id="edit-letter">Click on Letter to Edit</p>
	</div>

	<div class="right">
		<div class="export">
			<h2>Export</h2>
			<img
				src="/pdf_export.png"
				alt="PDF Export"
				on:click={exportPDF}
				on:keydown={handleKeyDown}
			/>
			<img
				src="/doc_export.png"
				alt="DOC Export"
				on:click={exportDoc}
				on:keydown={handleKeyDown}
			/>
			<img
				src="/copy_export.png"
				alt="Copy Export"
				on:click={copyToClipboard}
				on:keydown={handleKeyDown}
			/>
		</div>

		<div
			class="copy-tooltip {isCopied ? 'visible' : ''}"
			style="left: {cursorPosition.x}px; top: {cursorPosition.y}px;"
		>
			Copied to Clipboard!
		</div>
		<button class="button" on:click={handleClick}>
			<img src="LetterGen.ico" alt="Generate Icon" />
			Generate New Letter
		</button>
	</div>
</div>

<style>
	.all {
		background-color: #22385f;
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
		position: relative;
		width: 33rem;
		height: 37rem;
		margin-left: 4rem;
		margin-right: 5rem;
		padding: 0rem;
		margin-top: 0rem;
		margin-bottom: 6rem;
		background-color: white;
		color: black;
		font-size: 0.63rem;
		text-align: center;
	}

	#cover-letter-text {
		text-align: left;
		padding-left: 3.7rem;
		padding-right: 4.2rem;
		padding-top: 2rem;
		padding-bottom: 3.5rem;
		font-family: "Times New Roman", Times, serif;
		font-weight: normal;
	}

	#edit-letter {
		position: absolute;
		bottom: -3.5rem;
		width: 100%;
		padding: 0.5rem;
		color: white;
		text-align: center;
		background: #22385f;
		font-size: 0.95rem;
	}

	.right {
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
		padding-right: 1rem;
		border: none;
		cursor: pointer;
	}

	.export h2 {
		padding-bottom: 2rem;
	}

	.export img {
		width: 5rem;
		padding-left: 0.3rem;
		padding-right: 0.3rem;
		cursor: pointer;
	}

	.button img {
		width: 2rem;
		height: auto;
		margin-right: 0.5em;
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
