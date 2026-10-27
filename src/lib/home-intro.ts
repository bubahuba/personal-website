import { getContext } from 'svelte';

/** Shared intro scrub state (layout writes, home page reads for hero rain). */
export const HOME_INTRO_STORE_KEY = 'homeIntroStore';

export type HomeIntroStore = {
	enabled: boolean;
	progress: number;
};

const HOME_INTRO_FALLBACK: HomeIntroStore = { enabled: false, progress: 1 };

export function getHomeIntroStore(): HomeIntroStore {
	return getContext<HomeIntroStore>(HOME_INTRO_STORE_KEY) ?? HOME_INTRO_FALLBACK;
}

/** Pixels of scroll over which the home intro scrubs from full-screen to header (one viewport). */
export function homeIntroScrollRange(viewportHeight: number): number {
	return Math.round(Math.max(viewportHeight, 1));
}

export function homeIntroProgress(scrollY: number, range: number): number {
	if (range <= 0) return 1;
	return Math.min(1, Math.max(0, scrollY / range));
}

/** If user landed past this offset, skip the intro scrub (treat as complete). */
export const HOME_INTRO_SKIP_SCROLL = 48;

export function siteHeaderScrollPadding(): number {
	const header = document.querySelector('header');
	if (!header) return 96;
	return Math.ceil(header.getBoundingClientRect().height);
}

/** Scroll position so `el` sits flush below the sticky site header. */
export function scrollTopBelowHeader(el: HTMLElement): number {
	return el.getBoundingClientRect().top + window.scrollY - siteHeaderScrollPadding();
}

export function scrollToHomeHero(smooth = true): boolean {
	const hero = document.querySelector<HTMLElement>('[data-home-hero]');
	if (!hero) return false;
	const top = scrollTopBelowHeader(hero);
	window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
	return true;
}

export function scrollToHomeIntro(smooth = true): void {
	window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}
