<script>
	import Navbar from "../components/Navbar.svelte";
	import { navigate } from "svelte-navigator";
	import { coverLetter } from "../stores/coverLetter";
	import { convertHTMLToText, convertTextToHTML, copyToClipboard, exportDoc, exportPDF } from "../utils/export";
	import { handleEnterKey } from "../utils/keyboard";

	let coverLetterValue = "";
	let editableDiv;

	function handleClick() {
		coverLetter.set("");
		navigate("/form");
	}

	let coverLetterHTML = "";
	let coverLetterText = "";
	let isCopied = false;
	let cursorPosition = { x: 0, y: 0 };

	coverLetter.subscribe((value) => {
		coverLetterText = value;
		coverLetterHTML = convertTextToHTML(value);
		if (editableDiv) {
			editableDiv.innerHTML = coverLetterHTML;
		}
	});

	function updateCoverLetter() {
		coverLetter.set(convertHTMLToText(editableDiv.innerHTML));
	}

	function handleExportPDF() {
		exportPDF(coverLetterHTML);
	}

	async function handleExportDoc() {
		try {
			await exportDoc(coverLetterText);
		} catch (error) {
			console.error("Error exporting DOC:", error);
		}
	}

	function showCopyTooltip(e) {
		cursorPosition = { x: e.clientX, y: e.clientY };
		isCopied = true;
		setTimeout(() => (isCopied = false), 500);
	}

	async function handleCopyToClipboard(e) {
		await copyToClipboard(coverLetterText);
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
				on:click={handleExportPDF}
				on:keydown={handleEnterKey(handleExportPDF)}
			/>
			<img
				src="/doc_export.png"
				alt="DOC Export"
				on:click={handleExportDoc}
				on:keydown={handleEnterKey(handleExportDoc)}
			/>
			<img
				src="/copy_export.png"
				alt="Copy Export"
				on:click={handleCopyToClipboard}
				on:keydown={handleEnterKey(() => handleCopyToClipboard({ clientX: 0, clientY: 0 }))}
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

	@media only screen and (max-width: 1099px) {
		#cover-letter-text {
			font-size: 0.55rem;
		}
	}

	@media only screen and (max-width: 999px) {
		#cover-letter-text {
			font-size: 0.5rem;
		}
	}

	@media only screen and (max-height: 700px) {
		#cover-letter-text {
			font-size: 0.55rem;
		}
		.coverLetter {
			width: 32rem;
			height: 34rem;
		}
	}

	@media only screen and (max-height: 650px) {
		#cover-letter-text {
			font-size: 0.5rem;
		}
		.coverLetter {
			width: 28rem;
			height: 30rem;
		}
	}


</style>
