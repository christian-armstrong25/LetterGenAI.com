<script>
	import Navbar from "../components/Navbar.svelte";

	import { DEMO_COVER_LETTER } from "../utils/demo";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";

	let coverLetter = "";
	let index = 0;
	let interval;

	const words = DEMO_COVER_LETTER.split(/( |<br \/>)/);
	const WORD_INTERVAL = 1;
	const RESTART_DELAY = 1000;

	function addWord() {
		if (index < words.length) {
			coverLetter += words[index];
			index++;
		} else {
			clearInterval(interval);
			setTimeout(() => {
				index = 0;
				coverLetter = "";
				interval = setInterval(addWord, WORD_INTERVAL);
			}, RESTART_DELAY);
		}
	}

	onMount(() => {
		interval = setInterval(addWord, WORD_INTERVAL);
		return () => clearInterval(interval);
	});

	const redirectToPage = () => {
		navigate("/form");
	};
</script>

<Navbar />
<div class="content">
	<div class="left">
		<h2>Your Personalized Cover Letter Writer</h2>
		<h2 class="tagline">Instant. Effortless. You.</h2>
		<div class="benefits">
			<p>
				<b>Tailored to Your Unique Style:</b> Upload your writing samples for a cover
				letter that's authentically you.
			</p>
			<p>
				<b>Instant Results:</b> Say goodbye to endless hours spent crafting the perfect
				letter. Your time is valuable, let us help you save it.
			</p>
			<p>
				<b> Amplify Your Opportunities:</b> Boost your job applications with personalized,
				polished, and professional cover letters.
			</p>
		</div>
		<div class="generate-btn">
			<button id="generate" on:click={redirectToPage}
				>Generate Your Cover Letter Now</button
			>
		</div>
	</div>
	<div class="right">
		<img src="/process.png" alt="Process" id="process-img" />
		<div class="cover-letter" id="cover-letter">{@html coverLetter}</div>
	</div>
</div>

<style>
	.content {
		background-color: #f5f5f5;
		margin: 0;
		display: flex;
		justify-content: space-between;
		padding: 20px;
	}

	.left {
		flex: 1.6; /* takes up 2 portions of space */
		color: black;
		text-align: center;
	}

	.left h2 {
		color: black;
		text-align: center;
		margin-bottom: 0;
		font-size: 2.4rem;
	}

	.left .tagline {
		color: #545454;
		text-align: center;
		margin-top: 0;
		margin-bottom: 20px; /* More distance */
	}

	.benefits {
		margin-left: 3rem; /* More padding */
		margin-right: 3rem; /* More padding */
		padding-top: 2rem;
		text-align: left;
	}

	.benefits p {
		margin-left: 0rem; /* More padding */
		margin-right: 2rem; /* More padding */
		margin-bottom: 1.75rem;
		font-size: 1.1rem;
		color: #333333;
	}

	.generate-btn {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	#generate {
		background-color: #0c44a5;
		color: white;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
		padding-top: 1.2rem;
		padding-bottom: 1.2rem;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		margin-top: 5rem;
	}

	#generate:hover {
		font-weight: bold;
	}

	.right {
		flex: 1.4; /* takes up 2 portions of space */
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	#process-img {
		max-width: 80%;
		height: auto;
		padding-top: 2rem;
	}

	.cover-letter {
		width: 18rem;
		height: 24rem;
		background-color: white;
		margin-top: 20px;
		margin-right: 5rem;
		padding: 2rem;
		padding-left: 3rem;
		padding-right: 2rem;
		padding-top: 2.5rem;
		padding-bottom: 2rem;
		font-size: 0.38rem;
		line-height: 1.5; /* emulate Google Docs line spacing */
	}

	@media only screen and (max-width: 600px) {
		.content {
			flex-direction: column;
			padding: 10px;
		}

		.left,
		.right {
			flex: none;
		}

		.benefits,
		.generate-btn {
			margin-left: 1rem;
			margin-right: 1rem;
		}

		#process-img {
			max-width: 100%;
		}

		.cover-letter {
			width: 90%;
			margin-right: 0;
		}
	}
</style>
