<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import { Button } from '#lib/components/ui/button';
	import { cn } from '#lib/utils';

	const filename = 'peter-huba-cv.pdf';

	let busy = $state(false);
	let progress = $state<number | null>(null);

	const showProgressRing = $derived(busy && progress !== null);

	async function downloadPdf(event: MouseEvent) {
		event.preventDefault();
		if (busy) return;

		busy = true;
		progress = 0;

		try {
			const response = await fetch('/cv/pdf');
			if (!response.ok) {
				throw new Error(`PDF download failed (${response.status})`);
			}

			const total = Number(response.headers.get('content-length') || 0);
			const reader = response.body?.getReader();
			if (!reader) {
				const blob = await response.blob();
				triggerSave(blob);
				return;
			}

			const chunks: Uint8Array[] = [];
			let loaded = 0;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) {
					chunks.push(value);
					loaded += value.length;
					if (total > 0) {
						progress = Math.min(1, loaded / total);
					}
				}
			}

			progress = 1;
			triggerSave(new Blob(chunks as BlobPart[], { type: 'application/pdf' }));
		} catch (error) {
			console.error(error);
			window.location.assign('/cv/pdf');
		} finally {
			busy = false;
			progress = null;
		}
	}

	function triggerSave(blob: Blob) {
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.click();
		URL.revokeObjectURL(url);
	}
</script>

<Button
	variant="ghost"
	size="icon"
	type="button"
	class="cv-pdf-download-trigger shrink-0"
	aria-busy={busy}
	aria-label={busy && progress !== null
		? `Downloading CV, ${Math.round(progress * 100)} percent`
		: busy
			? 'Downloading CV as PDF'
			: 'Download CV as PDF'}
	aria-valuenow={busy && progress !== null ? Math.round(progress * 100) : undefined}
	aria-valuemin={busy && progress !== null ? 0 : undefined}
	aria-valuemax={busy && progress !== null ? 100 : undefined}
	onclick={downloadPdf}
>
	<span
		class={cn(
			'lang-progress',
			!showProgressRing && 'lang-progress--idle',
			busy && progress === null && '[&_.lang-progress__label]:animate-pulse'
		)}
		style="--lang-progress: {progress ?? 0}"
	>
		<Download class="lang-progress__label size-4" />
	</span>
</Button>
