<script>
	import { emailSignup } from "$plugins/firebase/auth.firebase";
	import { navigate } from "svelte-navigator";
	import Navbar from "../components/Navbar.svelte";

	let firstName = "";
	let lastName = "";
	let email = "";
	let password = "";
	let isSubmitting = false;
	let error = null;

	const onSubmit = async (event) => {
		event.preventDefault();

		isSubmitting = true;
		error = null;

		try {
			await emailSignup(email, password, firstName, lastName);
			navigate("/form");
		} catch (err) {
			error = err.message;
		} finally {
			isSubmitting = false;
		}
	};
</script>

<Navbar />
<div class="signup-page">
	<div class="white-box">
		<h2>Create your account</h2>
		<form on:submit={onSubmit}>
			<label for="firstName" class="required-field">First Name</label>
			<input id="firstName" type="text" bind:value={firstName} required />
			<label for="lastName" class="required-field">Last Name</label>
			<input id="lastName" type="text" bind:value={lastName} required />
			<label for="email" class="required-field">Email</label>
			<input id="email" type="email" bind:value={email} required />
			<label for="password" class="required-field">Password</label>
			<input id="password" type="password" bind:value={password} required />
			<label class="signup-email-notification"
				><input type="checkbox" /> Receive email notifications</label
			>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			<button type="submit" disabled={isSubmitting}>Sign Up</button>
		</form>
		<p class="new-account">
			Already have an account? <button
				on:click={() => navigate("/login")}
				on:keydown={() => navigate("/login")}
			>
				Sign In
			</button>
		</p>
	</div>
</div>

<style>
	/* Styles are identical as provided in the previous code */

	.signup-page {
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
		margin-top: 1.5rem;
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
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

	form input,
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

	.signup-email-notification {
		font-size: 0.9rem;
		cursor: pointer;
	}

	.signup-email-notification input {
		border-radius: 0;
	}

	.new-account {
		text-align: center;
		margin-top: 30px;
		font-size: 0.9rem;
	}

	.required-field::after {
		content: "*";
		color: red;
	}
</style>
