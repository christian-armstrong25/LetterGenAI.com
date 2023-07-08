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

	// handleKeyPress function
	function handleKeyPress(event) {
		if (event.key === "Enter") {
			goToHome();
		}
	}

	// handleAccountKeyPress function
	function handleAccountKeyPress(event) {
		if (event.key === "Enter") {
			handleAccountClick();
		}
	}

	// handleLogoutKeyPress function
	function handleLogoutKeyPress(event) {
		if (event.key === "Enter") {
			handleLogout();
		}
	}

	$: userEmail = $user?.email || null;
</script>

<nav>
	<div class="nav-left" on:click={goToHome} on:keydown={handleKeyPress}>
		<img src="/LetterGen.svg" alt="LetterGen Logo" id="logo" />
		<h1>LetterGenAI</h1>
	</div>
	<div class="nav-right">
		<button
			id="account"
			on:click={handleAccountClick}
			on:keydown={handleAccountKeyPress}
			>{userEmail ? "My Account" : "Sign In"}</button
		>
		{#if userEmail}
			<div class="overlay {showOverlay ? 'show' : ''}" style="height: 5.75rem;">
				<p
					id="logged"
					on:click={() => navigate("/settings")}
					on:keydown={() => navigate("/settings")}
				>
					<img src="person.png" id="me" alt="User Avatar" />
					{userEmail}
				</p>
				<span
					class="overlay-button"
					on:click={() => navigate("/settings")}
					on:keydown={() => navigate("/settings")}
					style="border-top: 1px black solid;padding-top: 0.6rem;"
					>Account Settings</span
				>
				<span
					id="btn2"
					class="overlay-button"
					on:click={handleLogout}
					on:keydown={handleLogoutKeyPress}>Log Out</span
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
		width: 9rem;
		z-index: 100;
		font-size: 0.9rem;
	}

	.overlay.show {
		display: block;
	}

	.overlay-button {
		display: block;
		cursor: pointer;
		margin-bottom: 10px;
		border-top: 1px solid black; /* Add a thin black line */
		padding-top: 0.6rem;
	}

	#btn2 {
		border-top: 1px solid black; /* Add a thin black line */
		padding-top: 0.5rem;
	}

	#logged {
		font-size: 0.6rem;
		padding: 0;
		margin: 0;
		padding-bottom: 0.75rem;
		cursor: pointer;
	}

	#me {
		position: relative;
		top: 0.25rem;
		width: 1rem;
		height: auto;
		margin: 0;
		padding: 0;
		cursor: pointer;
	}
</style>
