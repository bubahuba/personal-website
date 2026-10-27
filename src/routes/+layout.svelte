<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import './layout.css';
	import HomeIntroMatrixRain from '#lib/components/home-intro-matrix-rain.svelte';
	import HomeIntroOverlay from '#lib/components/home-intro-overlay.svelte';
	import SiteFooter from '#lib/components/site-footer.svelte';
	import SiteHeader from '#lib/components/site-header.svelte';
	import {
		HOME_INTRO_SKIP_SCROLL,
		HOME_INTRO_STORE_KEY,
		type HomeIntroStore,
		scrollToHomeHero,
		scrollToHomeIntro
	} from '#lib/home-intro';
	import { setContext } from 'svelte';
	import { mountHomeIntroScroll } from '#lib/home-intro-scroll';
	import { applyDocumentLanguage, languageFromLocale } from '#lib/languages';
	import { person, site, type Project } from '#lib/profile';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const homeIntroStore = $state<HomeIntroStore>({ enabled: false, progress: 1 });
	setContext(HOME_INTRO_STORE_KEY, homeIntroStore);

	const home = $derived(page.url.pathname === '/');

	let pageRoot = $state<HTMLElement | null>(null);
	let introProgress = $state(page.url.pathname === '/' ? 0 : 1);
	/** Only prefers-reduced-motion disables the intro scrub entirely. */
	let introSkipPermanent = $state(false);
	let introScrollEnabled = $state(page.url.pathname === '/');

	const introOverlayVisible = $derived(home);
	const introArrowToTop = $derived(introProgress >= 0.92);
	const introRainFade = $derived(
		introProgress >= 0.98 ? 0 : Math.max(0.15, 1 - introProgress * 0.9)
	);

	const pageLanguage = $derived.by(() => {
		const url = page.shallow?.url ?? page.url;
		return languageFromLocale(url.searchParams.get('lang'));
	});

	$effect(() => {
		applyDocumentLanguage(pageLanguage);
	});

	$effect(() => {
		homeIntroStore.enabled = home && introScrollEnabled;
		homeIntroStore.progress = introProgress;
	});

	function introEnabled(): boolean {
		return home && introScrollEnabled && !introSkipPermanent;
	}

	function scrollIntroHint() {
		if (introArrowToTop) {
			scrollToHomeIntro(true);
			return;
		}
		if (!scrollToHomeHero(true)) {
			const range = parseFloat(
				getComputedStyle(pageRoot ?? document.documentElement).getPropertyValue(
					'--home-intro-range'
				)
			);
			window.scrollTo({
				top: Math.max(0, range || window.innerHeight),
				behavior: 'smooth'
			});
		}
	}

	function clearHashAtTop() {
		if (window.scrollY > HOME_INTRO_SKIP_SCROLL) return;
		const { pathname, search, hash } = window.location;
		if (!hash || hash.length <= 1) return;
		history.replaceState(history.state, '', `${pathname}${search}`);
	}

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		introSkipPermanent = reduceMotion;
		introScrollEnabled = home && !introSkipPermanent;

		const onScroll = () => {
			if (!home || introSkipPermanent) return;
			clearHashAtTop();
			introScrollEnabled = true;
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		if (!pageRoot) return;

		return mountHomeIntroScroll({
			root: pageRoot,
			enabled: introEnabled,
			onProgress: (p) => {
				introProgress = p;
			}
		});
	});

	$effect(() => {
		if (!home) {
			introScrollEnabled = false;
			introProgress = 1;
			return;
		}
		if (!introSkipPermanent) {
			introScrollEnabled = true;
		}
	});

	$effect(() => {
		if (!home || !introScrollEnabled || introSkipPermanent) return;
		if (typeof window === 'undefined') return;
		requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
	});

	const project = $derived(page.data.project as Project | undefined);
	const title = $derived(project?.title ? `${project.title} — ${person.name}` : site.title);
	const description = $derived(project?.summary ?? site.description);
	const imagePath = $derived(project?.image.src ?? person.portrait);
	const image = $derived(`${site.origin}${imagePath}`);
	const imageAlt = $derived(project?.image.alt ?? person.name);
	const imageType = $derived(imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg');
	const url = $derived(`${site.origin}${page.url.pathname}`);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
	<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
	<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,450;0,6..72,550;0,6..72,650;1,6..72,450&family=Outfit:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={person.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta property="og:image:type" content={imageType} />
	{#if !project}
		<meta property="og:image:width" content="1800" />
		<meta property="og:image:height" content="1149" />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>

<div class="flex min-h-svh flex-col" data-page-root bind:this={pageRoot}>
	<HomeIntroOverlay
		visible={introOverlayVisible}
		toTop={introArrowToTop}
		onScrollHint={scrollIntroHint}
	/>
	<SiteHeader {introProgress} introScrollActive={introScrollEnabled && introProgress < 1} />
	<div class="flex flex-1 flex-col home-surface">
		<main class="flex-1">
			{#if home}
				<div
					class="home-intro-scroll-spacer"
					class:home-intro-scroll-spacer--off={!introScrollEnabled}
					aria-hidden="true"
				>
					{#if introScrollEnabled}
						<HomeIntroMatrixRain active={introScrollEnabled} fade={introRainFade} />
					{/if}
				</div>
			{/if}
			{@render children()}
		</main>
		<SiteFooter />
	</div>
</div>
