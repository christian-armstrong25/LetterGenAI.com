<script lang="ts">
	import {
		emailSignin,
		emailSignup,
		googleSignin,
	} from "$plugins/firebase/auth.firebase";
	import { user } from "$stores/user";
	import { navigate } from "svelte-navigator";
	import { writable } from "svelte/store";

	let showModal = false;
	let email = "";
	let password = "";
	let isLoading = false;
	let passwordVisible = false;
	let errorMessage = writable(null);

	user.subscribe(($user) => {
		if ($user) navigate("/form");
	});

	async function handleGoogleSignIn() {
		clearErrorMessage();
		isLoading = true;
		try {
			await googleSignin();
		} catch (error) {
			setErrorMessage(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleEmailSignIn() {
		console.log("Email sign-in started"); // Add console.log for debugging
		clearErrorMessage();
		if (email && password) {
			isLoading = true;
			try {
				console.log("Trying to sign in"); // Add console.log for debugging
				await emailSignin(email, password);
				console.log("Signed in successfully"); // Add console.log for debugging
			} catch (error) {
				console.log("Caught an error in sign in:", error); // Add console.log for debugging
				setErrorMessage(error);
			} finally {
				isLoading = false;
			}
		} else {
			errorMessage.set("Please fill in all the required fields");
		}
	}

	async function handleEmailSignUp() {
		clearErrorMessage();
		if (email && password) {
			isLoading = true;
			try {
				await emailSignup(email, password);
			} catch (error) {
				setErrorMessage(error);
			} finally {
				isLoading = false;
			}
		} else {
			errorMessage.set("Please fill in all the required fields");
		}
	}

	function togglePasswordVisibility() {
		passwordVisible = !passwordVisible;
	}

	function setErrorMessage(error) {
		console.log("Setting error message"); // log to see if the function is called
		switch (error.code) {
			case "auth/user-not-found":
				errorMessage.set(
					"There is no user corresponding to the given email. Please double-check your email or create an account."
				);
				break;
			case "auth/wrong-password":
				errorMessage.set("The password is invalid. Please try again.");
				break;
			case "auth/too-many-requests":
				errorMessage.set(
					"We have blocked all requests from this device due to unusual activity. Try again later."
				);
				break;
			case "auth/email-already-in-use":
				errorMessage.set(
					"The email address is already in use by another account."
				);
				break;
			case "auth/invalid-email":
				errorMessage.set(
					"The email address is not valid. Please enter a valid email address."
				);
				break;
			case "auth/operation-not-allowed":
				errorMessage.set(
					"Password sign-in is disabled for this project. Contact the application administrator."
				);
				break;
			case "auth/network-request-failed":
				errorMessage.set(
					"A network error has occurred. Please check your internet connection and try again."
				);
				break;
			case "auth/weak-password":
				errorMessage.set("The password must be 6 characters long or more.");
				break;
			default:
				errorMessage.set("An error occurred. Please try again.");
				break;
		}
	}

	function clearErrorMessage() {
		errorMessage.set(null);
	}
</script>

<div class="w-screen h-screen flex gap-4 items-center bg-gray-100">
	<div
		class="flex-1 flex flex-col items-center justify-center text-center px-10"
	>
		<div class="text-8xl font-black text-gray-800">LetterGenAI</div>
		<div class="w-[150px] h-1 bg-black block mx-auto my-4" />
		<slot />
		<div>
			<h2 class="text-3xl font-medium mb-6 text-gray-600">
				Never write a cover letter again
			</h2>

			<button
				class="bg-blue-500 hover:bg-blue-600 focus:outline-none font-lg text-white rounded-md h-9 px-4 py-2-5 text-sm inline-flex items-center mx-auto"
				on:click={() => (showModal = true)}
			>
				Generate Cover Letter
			</button>
		</div>
	</div>
	<div class="flex-1 flex items-center justify-center p-10">
		<img
			src="../../dist/coverletterGIF.gif"
			alt="Your GIF"
			class="max-h-[70%] max-w-[70%] object-cover"
		/>
	</div>
</div>

{#if showModal}
	<div class="fixed z-10 inset-0 overflow-y-auto">
		<div
			class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
		>
			<div class="fixed inset-0 transition-opacity" aria-hidden="true">
				<div class="absolute inset-0 bg-gray-500 opacity-75" />
			</div>
			<span
				class="hidden sm:inline-block sm:align-middle sm:h-screen"
				aria-hidden="true">&#8203;</span
			>
			<div
				class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
			>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div class="sm:flex sm:items-start">
						<div class="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
							<h3 class="text-lg leading-6 font-medium text-gray-900">
								Sign In / Sign Up
							</h3>
							<div class="mt-2">
								{#if $errorMessage}
									<div class="bg-red-500 text-white rounded p-2 mb-2">
										{$errorMessage}
									</div>
								{/if}

								<input
									type="email"
									bind:value={email}
									class="my-2 w-full rounded-md border-gray-300"
									placeholder="Email"
									disabled={isLoading}
								/>
								<div class="relative">
									{#if passwordVisible}
										<input
											type="text"
											bind:value={password}
											class="my-2 w-full rounded-md border-gray-300"
											placeholder="Password"
											disabled={isLoading}
										/>
									{:else}
										<input
											type="password"
											bind:value={password}
											class="my-2 w-full rounded-md border-gray-300"
											placeholder="Password"
											disabled={isLoading}
										/>
									{/if}
									<div
										class="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										<button
											type="button"
											class={isLoading
												? "cursor-not-allowed"
												: "cursor-pointer"}
											on:click={togglePasswordVisibility}
											disabled={isLoading}
										>
											{#if passwordVisible}
												<span class="fas fa-eye-slash" />
											{:else}
												<span class="fas fa-eye" />
											{/if}
										</button>
									</div>
								</div>
								<button
									class="bg-gray-200 hover:bg-gray-300 focus:outline-none font-lg text-gray-700 rounded-md h-10 px-4 py-2 text-sm flex items-center justify-center w-full"
									on:click={handleGoogleSignIn}
								>
									<img
										src="/google_logo.png"
										alt="Google logo"
										class="w-4 h-4 mr-2"
									/>
									Sign in with Google
								</button>
								<button
									class="bg-blue-500 hover:bg-blue-600 focus:outline-none font-lg text-white rounded-md h-10 px-4 py-2 text-sm flex items-center justify-center w-full"
									on:click={handleEmailSignIn}
								>
									Sign In with Email
								</button>
								<button
									class="mt-3 flex justify-center items-center bg-transparent border-none cursor-pointer text-blue-500 hover:underline"
									on:click={handleEmailSignUp}
									disabled={isLoading}
								>
									{#if isLoading}
										<span>Loading...</span>
									{:else}
										<span>Create an account</span>
									{/if}
								</button>
							</div>
						</div>
					</div>
				</div>
				<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
						on:click={() => {
							showModal = false;
							clearErrorMessage();
						}}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.bg-gray-100 {
		background-color: #f7fafc;
	}

	.text-gray-800 {
		color: #2d3748;
	}

	.text-gray-600 {
		color: #4a5568;
	}

	.bg-blue-500 {
		background-color: #4299e1;
	}

	.hover\:bg-blue-600:hover {
		background-color: #3182ce;
	}

	.text-white {
		color: #fff;
	}

	.rounded-md {
		border-radius: 0.375rem;
	}

	.inline-flex {
		display: inline-flex;
	}

	.items-center {
		align-items: center;
	}

	.justify-center {
		justify-content: center;
	}

	.flex-col {
		flex-direction: column;
	}

	.flex {
		display: flex;
	}

	.w-screen {
		width: 100vw;
	}

	.h-screen {
		height: 100vh;
	}

	.text-6xl {
		font-size: 4rem;
	}

	.font-black {
		font-weight: 900;
	}

	.text-center {
		text-align: center;
	}

	.h-1 {
		height: 1px;
	}

	.block {
		display: block;
	}

	.text-xl {
		font-size: 1.25rem;
	}

	.font-medium {
		font-weight: 500;
	}

	.mb-6 {
		margin-bottom: 1.5rem;
	}

	.px-5 {
		padding-left: 1.25rem;
		padding-right: 1.25rem;
	}

	.font-lg {
		font-size: 1.125rem;
	}

	.h-9 {
		height: 2.25rem;
	}

	.px-4 {
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.py-2-5 {
		padding-top: 0.625rem;
		padding-bottom: 0.625rem;
	}

	.text-sm {
		font-size: 0.875rem;
	}
</style>
