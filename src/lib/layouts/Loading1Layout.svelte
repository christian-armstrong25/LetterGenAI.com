<script>
	import { onMount } from "svelte";
	import Navbar from "../components/Navbar.svelte";

	let images = [
		"public/loading_1.gif",
		"public/loading_2.gif",
		"public/loading_3.gif",
	];
	let currentImage = images[0];
	let loadingTime = 15000; // Set your loading time here in milliseconds

	let imageDurations = [
		loadingTime * 0.25,
		loadingTime * 0.35,
		loadingTime * 0.4,
	];

	onMount(() => {
		cycleImages();
	});

	function cycleImages() {
		let imageIndex = 0;
		const interval = setInterval(() => {
			imageIndex++;
			if (imageIndex >= images.length) {
				clearInterval(interval);
			} else {
				currentImage = images[imageIndex];
			}
		}, imageDurations[imageIndex]);
	}
</script>

<Navbar />

<div class="container">
	<div class="loading-container">
		<h2 class="loading-text">Generating Cover Letter</h2>
		<div>
			<p>
				<img src={currentImage} alt="Loading GIF" />
			</p>
		</div>
	</div>
	<slot />
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		gap: 4px;
		background-color: #22385f;
	}

	.loading-container {
		width: 27rem;
		height: 23rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		background-color: #ffffff;
		padding: 0;
		margin-top: 0rem;
		margin-bottom: 8rem;
	}

	.loading-container h2 {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 4.5rem;
		padding-top: 0.8rem;
		position: relative;
	}

	.loading-text::after {
		content: "   ";
		position: absolute;
		white-space: pre;
		animation-name: dots;
		animation-duration: 2s;
		animation-iteration-count: infinite;
	}

	.loading-container div {
		flex-shrink: 0;
		margin-top: -2em;
	}

	.loading-container img {
		max-width: 15rem;
		height: auto;
	}

	@keyframes dots {
		0%,
		20% {
			content: "   ";
		}
		40% {
			content: ".  ";
		}
		60% {
			content: ".. ";
		}
		80%,
		100% {
			content: "...";
		}
	}
</style>
