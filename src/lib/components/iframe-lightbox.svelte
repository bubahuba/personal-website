<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	let {
		open = $bindable(false),
		src,
		title
	}: {
		open?: boolean;
		src: string;
		title: string;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		const node = dialog;
		if (!node) return;
		if (open && !node.open) node.showModal();
		if (!open && node.open) node.close();
	});

	function close() {
		open = false;
	}

	function onDialogClick(event: MouseEvent) {
		if (event.target === dialog) close();
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)] max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-black/75"
	aria-label={title}
	closedby="any"
	onclick={onDialogClick}
	onclose={close}
>
	{#if open}
		<div class="relative h-full overflow-hidden rounded-xl bg-black">
			<iframe
				{src}
				{title}
				class="absolute inset-0 h-full w-full border-0"
				allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; magnetometer"
			></iframe>
			<button
				type="button"
				class="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground"
				aria-label="Close"
				onclick={close}
			>
				<X />
			</button>
		</div>
	{/if}
</dialog>
