<script lang="ts">
	import { onMount } from 'svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { Button } from '#lib/components/ui/button';

	const storageKey = 'theme';

	function apply(dark: boolean) {
		document.documentElement.classList.toggle('dark', dark);
		document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
	}

	function toggleTheme() {
		const nextDark = !document.documentElement.classList.contains('dark');
		localStorage.setItem(storageKey, nextDark ? 'dark' : 'light');
		apply(nextDark);
	}

	onMount(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const followSystem = () => {
			if (localStorage.getItem(storageKey)) return;
			apply(media.matches);
		};
		media.addEventListener('change', followSystem);
		return () => media.removeEventListener('change', followSystem);
	});
</script>

<Button
	variant="ghost"
	size="icon"
	type="button"
	aria-label="Toggle color theme"
	onclick={toggleTheme}
>
	<Moon class="dark:hidden" />
	<Sun class="hidden dark:block" />
</Button>
