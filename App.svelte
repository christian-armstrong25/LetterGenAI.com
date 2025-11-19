<script lang="ts">
	import Links from "$/components/Links.svelte";
	import RouteChangeHandler from "$/router/RouteChangeHandler.svelte";
	import type { Layout } from "$/router/router";
	import { currentRoute, routes } from "$/router/router";
	import { user } from "$/stores/user";
	import { auth } from "$plugins/firebase/firebase";
	import { onAuthStateChanged } from "firebase/auth";
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-navigator";
	import AccountSettingsLayout from "./src/lib/layouts/AccountSettingsLayout.svelte";
	import FormLayout from "./src/lib/layouts/FormLayout.svelte";
	import ForgotLayout from "./src/lib/layouts/ForgotLayout.svelte";
	import HomeLayout from "./src/lib/layouts/HomeLayout.svelte";
	import LetterLayout from "./src/lib/layouts/LetterLayout.svelte";
	import Loading1Layout from "./src/lib/layouts/Loading1Layout.svelte";
	import LoginLayout from "./src/lib/layouts/LoginLayout.svelte";
	import SignUpLayout from "./src/lib/layouts/SignUpLayout.svelte";
	import LazyRoute from "./src/lib/router/LazyRoute.svelte";
	import Signout from "./src/lib/views/Signout.svelte";

	let ready = false;
	let currentLayout: Layout;

	const layoutComponents: Record<Layout, any> = {
		home: HomeLayout,
		form: FormLayout,
		letter: LetterLayout,
		loading1: Loading1Layout,
		login: LoginLayout,
		signup: SignUpLayout,
		forgot: ForgotLayout,
		settings: AccountSettingsLayout,
	};

	currentRoute.subscribe(($currentRoute) => {
		if ($currentRoute) {
			currentLayout = $currentRoute.layout;
		}
	});

	onMount(() => {
		onAuthStateChanged(auth, (userAuthData) => {
			user.set(userAuthData);
			ready = true;
		});
	});
</script>

{#if ready}
	<main>
		<div>
			<Links />
		</div>
		<Router>
			<RouteChangeHandler />
			<Route path="signout">
				<Signout />
			</Route>
			{#if currentLayout && layoutComponents[currentLayout]}
				<svelte:component this={layoutComponents[currentLayout]}>
					{#each routes.filter((r) => r.layout === currentLayout) as route}
						<LazyRoute component={route.component} path={route.path} />
					{/each}
				</svelte:component>
			{/if}
		</Router>
	</main>
{/if}

<style>
	:global(body) {
		font-family: "Roboto", sans-serif;
		margin: 0;
	}
</style>
