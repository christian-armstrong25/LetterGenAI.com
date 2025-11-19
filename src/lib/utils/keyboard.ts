export function handleEnterKey(callback: () => void) {
	return (event: KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			callback();
		}
	};
}
