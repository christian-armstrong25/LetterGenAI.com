<script>
	import { emailSignin, googleSignin } from "$plugins/firebase/auth.firebase";
	import { navigate } from "svelte-navigator";
	import Navbar from "../components/Navbar.svelte";
	let email = "";
	let password = "";
	let loginError = ""; // New variable to store login error message

	const handleGoogleSignin = async () => {
		try {
			await googleSignin();
			navigate("/form");
		} catch (error) {
			console.error("Google Signin Error:", error);
			loginError = error.message; // Save the error message when an error occurs
		}
	};

	const handleEmailSignin = async (event) => {
		event.preventDefault();
		try {
			await emailSignin(email, password);
			navigate("/form");
		} catch (error) {
			console.error("Email Signin Error:", error);
			loginError = "Incorrect email or password. Please try again."; // Save the error message when an error occurs
		}
	};
</script>

<Navbar />
<div class="login-page">
	<div class="white-box">
		<h2>Sign In to your account</h2>
		<form on:submit|preventDefault={handleEmailSignin}>
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} required />
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} required />
			{#if loginError}
				<p id="incorrect">{loginError}</p>
			{/if}
			<a
				href="/forgot"
				class="forgot-password"
				on:click|preventDefault={() => navigate("/forgot")}
				on:keydown|preventDefault={() => navigate("/forgot")}
				>Forgot your password?</a
			>
			<label class="stay"><input type="checkbox" /> Stay signed in</label>
			<button type="submit">Login</button>
		</form>
		<p class="google-sign-in">Or</p>
		<button class="google-sign-in-btn" on:click={handleGoogleSignin}>
			<div class="logo-container">
				<img src="google_logo.png" alt="Google Logo" />
			</div>
			<div class="text-container">Sign in with Google</div>
		</button>
		<p class="new-account">
			Don’t have an account? <a
				href="/signup"
				on:click|preventDefault={() => navigate("/signup")}
				on:keydown|preventDefault={() => navigate("/signup")}>Sign Up</a
			>
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

	form a {
		color: #0026ee;
		text-decoration: underline;
		text-align: center;
		margin-top: 10px;
	}

	.google-sign-in {
		text-align: center;
		margin-top: 2rem;
		color: rgb(96, 96, 96);
		font-size: 0.8rem;
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
	.google-sign-in-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
		background-color: #4e86ec;
		padding: 0.2rem 0rem;
		padding-top: 0.2rem;
		padding-bottom: 0rem;
		padding-left: 0;
		width: 47%;
		margin: auto;
		margin-top: 0.5rem;
		border: none;
		border-radius: 0;
		cursor: pointer;
	}

	.google-sign-in-btn img {
		width: 2.2rem; /* Adjust this size according to the logo size you want */
	}

	.google-sign-in-btn .logo-container {
		padding: 0rem;
		margin-right: 0rem;
		margin-left: 0;
		padding-left: 0.2rem;
	}

	.google-sign-in-btn .text-container {
		padding-right: 1.7rem;
		font-size: 0.85rem;
	}

	.forgot-password {
		text-decoration: underline;
		color: #0026ee;
		font-size: 0.85rem; /* Decreased font size */
		margin-top: 0rem; /* Adjust as needed */
		margin-bottom: 0; /* Adjust as needed */
		text-align: right; /* Center align the text */
	}

	.stay {
		margin-top: -0.4rem;
		font-size: 0.9rem;
		cursor: pointer;
		width: 8rem;
	}

	.stay input {
		border-radius: 0;
	}

	#incorrect {
		color: red;
		font-size: 0.85rem;
		padding: 0;
	}
</style>
