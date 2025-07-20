import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			"pdfjs-dist/build/pdf.worker.entry.js": "pdfjs-dist/build/pdf.worker.js",
			$: path.resolve(__dirname, "src/lib"), // updated alias
			$plugins: path.resolve(__dirname, "src/plugins"),
		},
	},
	optimizeDeps: {
		include: ["pdfjs-dist/build/pdf.worker.js"],
	},
});
