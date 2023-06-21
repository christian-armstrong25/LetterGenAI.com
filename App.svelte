<script lang="ts">
	import Links from "$/components/Links.svelte";
	import Loading1Layout from "$/layouts/Loading1Layout.svelte";
	import RouteChangeHandler from "$/router/RouteChangeHandler.svelte";
	import type { Layout } from "$/router/router";
	import { currentRoute, routes } from "$/router/router";
	import { user } from "$/stores/user";
	import Signout from "$/views/Signout.svelte";
	import { auth } from "$plugins/firebase/firebase";
	import { onAuthStateChanged } from "firebase/auth";
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-navigator";
	import FormLayout from "./src/lib/layouts/FormLayout.svelte";
	import HomeLayout from "./src/lib/layouts/HomeLayout.svelte";
	import LetterLayout from "./src/lib/layouts/LetterLayout.svelte";
	import LazyRoute from "./src/lib/router/LazyRoute.svelte";

	let ready: boolean = false;

	/* LAYOUT MANAGEMENT */
	let currentLayout: Layout;
	currentRoute.subscribe(($currentRoute) => {
		if (!$currentRoute) return;
		currentLayout = $currentRoute.layout;
	});

	/* AUTH MANAGEMENT */
	const authSubscriber = () => {
		onAuthStateChanged(auth, async (userAuthData) => {
			if (userAuthData) {
				user.set(userAuthData);
			} else {
				user.set(null);
			}
			ready = true;
		});
	};

	onMount(async () => {
		authSubscriber();
	});
</script>

{#if ready}
	<main class="min-h-screen w-screen bg-white">
		<div class="fixed top-2 right-2">
			<Links />
		</div>
		<Router>
			<RouteChangeHandler />
			<Route path="signout">
				<Signout />
			</Route>
			{#if currentLayout === "home"}
				<HomeLayout>
					{#each routes.filter((r) => r.layout === "home") as route}
						<LazyRoute component={route.component} path={route.path} />
					{/each}
				</HomeLayout>
			{:else if currentLayout === "form"}
				<FormLayout>
					{#each routes.filter((r) => r.layout === "form") as route}
						<LazyRoute component={route.component} path={route.path} />
					{/each}
				</FormLayout>
			{:else if currentLayout === "loading1"}
				<Loading1Layout>
					{#each routes.filter((r) => r.layout === "loading1") as route}
						<LazyRoute component={route.component} path={route.path} />
					{/each}
				</Loading1Layout>
			{:else if currentLayout === "letter"}
				<LetterLayout>
					{#each routes.filter((r) => r.layout === "letter") as route}
						<LazyRoute component={route.component} path={route.path} />
					{/each}
				</LetterLayout>
			{/if}
		</Router>
	</main>
{/if}
