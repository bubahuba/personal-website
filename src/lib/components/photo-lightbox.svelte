<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import X from '@lucide/svelte/icons/x';
	import type { Shot } from '#lib/profile';

	let {
		shots,
		index = $bindable(null)
	}: {
		shots: Shot[];
		index: number | null;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	const current = $derived(index !== null ? shots[index] : undefined);
	const total = $derived(shots.length);

	$effect(() => {
		const node = dialog;
		const open = index !== null;
		if (!node) return;
		if (open && !node.open) node.showModal();
		if (!open && node.open) node.close();
	});

	function close() {
		index = null;
	}

	function step(delta: number) {
		if (index === null || total === 0) return;
		index = (index + delta + total) % total;
	}

	function onDialogClick(event: MouseEvent) {
		if (event.target === dialog) close();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			step(1);
		}
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			step(-1);
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto w-[min(100%-2rem,72rem)] max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-black/75"
	aria-label={current ? current.alt : 'Photo'}
	onclick={onDialogClick}
	onclose={close}
	onkeydown={onKeydown}
>
	{#if current && index !== null}
		<figure class="flex flex-col gap-3 rounded-xl bg-card p-3">
			<div class="relative">
				<img src={current.src} alt={current.alt} class="max-h-[75vh] w-full object-contain" />
				{#if total > 1}
					<button
						type="button"
						class="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
						aria-label="Previous photo"
						onclick={() => step(-1)}
					>
						<ChevronLeft />
					</button>
					<button
						type="button"
						class="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
						aria-label="Next photo"
						onclick={() => step(1)}
					>
						<ChevronRight />
					</button>
				{/if}
				<button
					type="button"
					class="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground"
					aria-label="Close"
					onclick={close}
				>
					<X />
				</button>
			</div>
			<figcaption class="flex items-baseline justify-between gap-4 px-1 text-sm leading-relaxed">
				<span>{current.alt}</span>
				{#if total > 1}
					<span class="shrink-0 text-muted-foreground">{index + 1} / {total}</span>
				{/if}
			</figcaption>
		</figure>
	{/if}
</dialog>
