// filepath: /Users/christianarmstrong/Desktop/CS/side-projects/LetterGen/vite.config.ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import * as path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$: path.resolve(__dirname, "./src/lib"),
			$views: path.resolve(__dirname, "./src/lib/views"),
			$plugins: path.resolve(__dirname, "./src/lib/plugins"),
			$stores: path.resolve(__dirname, "./src/lib/stores"),
			$components: path.resolve(__dirname, "./src/lib/components"),
			"pdfjs-dist/build/pdf.worker.entry.js": "pdfjs-dist/build/pdf.worker.js",
		},
	},
	optimizeDeps: {
		exclude: ["pdfjs-dist"],
	},
	build: {
		rollupOptions: {
			external: [
				"/__/firebase/9.22.2/firebase-app-compat.js",
				"pdfjs-dist/build/pdf.worker.entry",
			],
		},
	},
});