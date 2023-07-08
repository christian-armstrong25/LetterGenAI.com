import { writable, type Writable } from "svelte/store";

export type Layout = "home" | "form" | "letter" | "loading1" | "login" | "signup" | "forgot" | "settings";

export type Route = {
	path: string;
	component: any; //TODO: Find this type.
	layout?: Layout;
};

export const currentRoute: Writable<Route> = writable();

export const routes: Route[] = [
	{
		path: "/",
		component: () => import("$views/Home.svelte"),
		layout: "home",
	},
	{
		path: "/login",
		component: () => import("$views/Login.svelte"),
		layout: "login",
	},
	{
		path: "/form",
		component: () => import("$views/Form.svelte"),
		layout: "form",
	},
	{
		path: "/loading1",
		component: () => import("$views/Loading1.svelte"),
		layout: "loading1",
	},
	{
		path: "/letter",
		component: () => import("$views/Letter.svelte"),
		layout: "letter",
	},
	{
		path: "/signup",
		component: () => import("$views/SignUp.svelte"),
		layout: "signup",
	},
	{
		path: "/forgot",
		component: () => import("$views/Forgot.svelte"),
		layout: "forgot",
	},
	{
		path: "/settings",
		component: () => import("$views/AccountSettings.svelte"),
		layout: "settings",
	},
	{
		path: "/404",
		component: () => import("$views/404.svelte"),
		layout: "home",
	},
];
