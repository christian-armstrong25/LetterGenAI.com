import { writable } from "svelte/store";

// creates a writable store
export const writingSample1Text = writable("");
export const writingSample2Text = writable("");
export const isSample = writable(1);