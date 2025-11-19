<script>
	export let id;
	export let label;
	export let uploadedFileName = "";
	export let onFileChange;

	function handleClick() {
		document.getElementById(id).click();
	}
</script>

<div class="file-upload">
	<button on:click={handleClick}>
		<div class="logo-container">
			<img src="/upload-icon.png" alt="Upload Icon" />
		</div>
		<div class="text-container" class:upload-1={id === "getFile1"}>{label}</div>
	</button>
	{#if uploadedFileName}
		<div class="uploaded">{uploadedFileName}</div>
	{/if}
	<input type="file" {id} style="display:none" on:change={onFileChange} />
</div>

<style>
	.file-upload button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 12.5rem;
		height: 1.6rem;
		font-size: 0.75rem;
		border-radius: 0;
		border: none;
		cursor: pointer;
		background-color: #d9d9d9;
	}
	.file-upload button img {
		width: 1.2rem;
	}
	.file-upload button .logo-container {
		padding: 0;
		margin-right: 0;
		margin-left: 0;
		padding-left: 0.2rem;
	}
	.file-upload button .text-container {
		padding-right: 0;
	}
	.file-upload button .text-container.upload-1 {
		padding-right: 2.3rem;
	}
	.uploaded {
		font-size: 0.65rem;
		padding-top: 0.2rem;
	}
</style>
