import App from "./App.svelte";

let app;

document.addEventListener("DOMContentLoaded", () => {
	const targetElement = document.getElementById("app");
	if (targetElement) {
		app = new App({
			target: targetElement,
		});
	}
});

export default app;
