<script>
	import { sendResetPasswordEmail } from "$plugins/firebase/auth.firebase";
	import { onMount } from "svelte";
	import { navigate } from "svelte-navigator";
	import Navbar from "../components/Navbar.svelte";

	let email = "";
	let showConfirmation = false;

	async function sendResetEmail() {
		try {
			await sendResetPasswordEmail(email);
			showConfirmation = true;
		} catch (error) {
			console.error(error);
			alert("Error sending password reset email: ");
		}
	}

	onMount(() => {
		showConfirmation = false;
	});
</script>

<Navbar />
<div class="login-page">
	<div class="white-box">
		<h2>Forgot Password</h2>
		<form>
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} />

			{#if !showConfirmation}
				<button on:click|preventDefault={sendResetEmail}
					>Send Reset Email</button
				>
			{:else}
				<p>Password reset email has been sent. Please check your inbox.</p>
			{/if}
		</form>
		<p class="new-account">
			Remember your password?
			<a
				href="/login"
				on:click|preventDefault={(e) => {
					navigate("/login");
					return e;
				}}
				on:keydown={(event) => {
					if (event.key === "Enter") {
						navigate("/login");
						return event;
					}
				}}
			>
				Sign In
			</a>
		</p>
	</div>
</div>

<style>
	.login-page {
		background-color: #22385f;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.white-box {
		background-color: white;
		width: 28rem;
		margin: auto;
		margin-top: 3rem;
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center; /* Center align the image with the form */
	}

	h2 {
		text-align: center;
		font-size: 1.8rem;
		padding-bottom: 0.5rem;
	}

	form {
		display: flex;
		flex-direction: column;
		width: 22rem;
	}

	form label {
		color: black;
		margin-bottom: 5px;
	}

	form input {
		margin-bottom: 10px;
		padding: 10px;
		background-color: #f6f6f6;
		border: 0.08rem solid black;
		border-radius: 0;
	}

	form button {
		padding: 1rem;
		color: white;
		background-color: #0c44a5;
		font-weight: bold;
		border: none;
		width: 60%;
		margin: auto;
		margin-top: 1rem;
		text-transform: uppercase;
		border-radius: 0;
		cursor: pointer;
	}

	.new-account {
		text-align: center;
		margin-top: 30px;
		font-size: 0.9rem;
	}

	.new-account a {
		color: #0026ee;
		text-decoration: underline;
	}
</style>
