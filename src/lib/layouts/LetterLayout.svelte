<script>
	import { Link } from "svelte-navigator";
	import { coverLetter } from "../stores/coverLetter";

	let coverLetterValue;

	coverLetter.subscribe((value) => {
		coverLetterValue = value;
	});
</script>

<div class="flex flex-col min-h-screen bg-gray-100">
	<div class="flex-grow flex items-center justify-center">
		<div class="max-w-xl mx-auto p-8 bg-white rounded shadow-md">
			<div class="text-center mb-3">
				<h1 class="text-2xl font-bold">Cover Letter</h1>
				<div class="text-gray-600 mt-2">{coverLetterValue}</div>
			</div>
			<slot />
			<div class="flex justify-center mt-3">
				<Link
					on:click={coverLetterValue.set("")}
					to="/form"
					class="mt-6 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Generate New Letter
				</Link>
			</div>
		</div>
	</div>
</div>
