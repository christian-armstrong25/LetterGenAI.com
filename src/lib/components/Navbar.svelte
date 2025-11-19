<script>
	import { logout } from "$plugins/firebase/auth.firebase";
	import { user } from "$stores/user";
	import { navigate } from "svelte-navigator";
	let showOverlay = false;

	function goToHome() {
		navigate("/");
	}

	function toggleOverlay() {
		showOverlay = !showOverlay;
	}

	function handleAccountClick() {
		if ($user?.email) {
			toggleOverlay();
		} else {
			navigate("/login");
		}
	}

	async function handleLogout() {
		// Create handleLogout function
		await logout(); // Logout user
		navigate("/"); // Navigate to home
	}

	import { handleEnterKey } from "../utils/keyboard";

	$: userEmail = $user?.email || null;
</script>


<nav>
	<div class="nav-left" on:click={goToHome} on:keydown={handleEnterKey(goToHome)}>
		<img src="/LetterGen.svg" alt="LetterGen Logo" id="logo" />
		<h1>LetterGenAI</h1>
	</div>
	<div class="nav-right">

		<a href="https://forms.gle/oasanaZiXbMdfXc18" target="_blank">
	<button
		id="feedback-button"
		>Send Feedback</button
	>
</a>

		<button
			id="account"
			on:click={handleAccountClick}
			on:keydown={handleEnterKey(handleAccountClick)}
			>{userEmail ? "My Account" : "Sign In"}</button
		>
		{#if userEmail}
			<div class="overlay {showOverlay ? 'show' : ''}" style="height: 6.75rem;">
				<p
					id="logged"
				>
					<img src="person.png" id="me" alt="User Avatar" />
					{userEmail}
				</p>
				<span
					class="overlay-button"
					on:click={() => navigate("/settings")}
					on:keydown={() => navigate("/settings")}
					style="border-top: 1px black solid;padding-top: 0.75rem;"
					>Account Settings</span
				>
				<span
					id="btn2"
					class="overlay-button"
					on:click={handleLogout}
					on:keydown={handleEnterKey(handleLogout)}>Log Out</span
				>
			</div>
		{/if}
	</div>
</nav>


<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		background-color: white;
		padding: 0rem; /* Remove padding */
		margin: 0; /* Remove margin */
	}

	.nav-left {
		display: flex;
		align-items: center;
	}

	#logo {
		max-width: 12%; /* Smaller logo */
		height: auto;
		padding-left: 1.2rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		cursor: pointer; /* Makes it clear that logo is clickable */
	}

	.nav-left h1 {
		margin-left: 10px;
		cursor: pointer; /* Makes it clear that the text is clickable */
	}

	.nav-right {
		margin-right: 10px;
	}

		#feedback-button {
		border: 0.2rem solid #0c44a5; /* Bigger stroke */
		border-radius: 0.4rem;
		background-color: transparent;
		color: #0c44a5;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		margin: 0;
		margin-right: 0.5rem;
	}

		#feedback-button:hover {
		background-color: #0c44a5; /* Change background on hover */
		color: white; /* Change text color on hover */
	}

	#account:hover {
		background-color: #0c44a5; /* Change background on hover */
		color: white; /* Change text color on hover */
	}



	#account {
		border: 0.2rem solid #0c44a5; /* Bigger stroke */
		border-radius: 0.4rem;
		background-color: transparent;
		color: #0c44a5;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		margin: 0;
		margin-right: 0.5rem;
	}

.overlay {
	display: none;
	position: absolute;
	background-color: white;
	border: 1px solid #ddd;
	padding: 10px;
	width: 10rem;
	z-index: 100;
	font-size: 0.9rem;
	top: 3.4rem; /* Adjust this */
	right: 0.3rem; /* Adjust this */
}


	.overlay.show {
		display: block;
	}

	.overlay-button {
		display: block;
		cursor: pointer;
		margin-bottom: 10px;
		border-top: none;
		padding-top: 0.6rem;
	}

	#btn2 {
		border-top: 1px solid black; /* Add a thin black line */
		padding-top: 0.5rem;
	}

	#logged {
		font-size: 0.52rem;
		padding: 0;
		margin: 0;
		padding-bottom: 0.75rem;
		font-weight:normal;
	}

	#me {
		position: relative;
		top: 0.25rem;
		width: 1rem;
		height: auto;
		margin: 0;
		padding: 0;

	}
</style>
