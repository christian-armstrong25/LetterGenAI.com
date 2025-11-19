import { writable } from "svelte/store";

// creates a writable store
export const writingSample1Text = writable("");
export const writingSample2Text = writable("");
export const isSample = writable(0); // 0 = Pre-Selected Style (default), 1 = Personalized Style