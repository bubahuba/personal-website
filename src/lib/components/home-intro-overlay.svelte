<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';

	let {
		visible = false,
		toTop = false,
		onScrollHint
	}: {
		visible?: boolean;
		toTop?: boolean;
		onScrollHint?: () => void;
	} = $props();
</script>

{#if visible}
	<div class="home-intro">
		<button
			type="button"
			class={['home-intro__arrow', toTop && 'home-intro__arrow--up']}
			aria-label={toTop ? 'Back to top' : 'Scroll to explore'}
			onclick={() => onScrollHint?.()}
		>
			<ArrowDown class="home-intro__arrow-icon size-8" strokeWidth={2.25} />
		</button>
	</div>
{/if}
