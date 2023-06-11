<script>
	import { coverLetter } from "../stores/coverLetter";

	let coverLetterValue;

	coverLetter.subscribe((value) => {
		coverLetterValue = value;
	});
</script>

<div class="w-screen h-screen flex flex-col gap-4 items-center justify-center">
	<div class="text-6xl font-black text-center">Done</div>
	<div class="w-[150px] h-1 bg-black block" />
	<div>{coverLetterValue}</div>
	<slot />
</div>
