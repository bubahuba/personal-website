<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';

	let {
		visible = false,
		showArrow = false,
		onScrollHint
	}: {
		visible?: boolean;
		showArrow?: boolean;
		onScrollHint?: () => void;
	} = $props();
</script>

{#if visible}
	<div class="home-intro" aria-hidden="true">
		{#if showArrow}
			<button
				type="button"
				class="home-intro__arrow"
				aria-label="Scroll to explore"
				onclick={() => onScrollHint?.()}
			>
				<ArrowDown class="size-8" strokeWidth={2.25} />
			</button>
		{/if}
	</div>
{/if}
