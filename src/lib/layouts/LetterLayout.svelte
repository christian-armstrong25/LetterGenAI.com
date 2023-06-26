<script>
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
</div>
