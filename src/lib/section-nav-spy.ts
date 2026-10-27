import { tick } from 'svelte';

export type NavSegment<T extends string = string> = {
	sectionId: string;
	navId: T;
};

const TOP_BAND = 0.3;

export const PAGE_ROOT_SELECTOR = '[data-page-root]';

function pageRoot(): HTMLElement {
	return document.querySelector(PAGE_ROOT_SELECTOR) ?? document.documentElement;
}

/** Visible slice of the page root in the viewport — band % is relative to this height. */
function visibleRootBand(root: HTMLElement) {
	const rect = root.getBoundingClientRect();
	const visibleTop = Math.max(rect.top, 0);
	const visibleBottom = Math.min(rect.bottom, window.innerHeight);
	const height = Math.max(visibleBottom - visibleTop, 1);
	return { visibleTop, height };
}

/** Top edge of the active band (30% of the root’s visible height). */
function markerY(root: HTMLElement): number {
	const { visibleTop, height } = visibleRootBand(root);
	return visibleTop + height * TOP_BAND;
}

function measureActive<T extends string>(
	segments: readonly NavSegment<T>[],
	sectionIds: readonly string[]
): T | null {
	const y = markerY(pageRoot());
	let current: T | null = null;

	for (const segment of segments) {
		if (!sectionIds.includes(segment.sectionId)) continue;
		const el = document.getElementById(segment.sectionId);
		if (!el) continue;
		if (el.getBoundingClientRect().top <= y) current = segment.navId;
	}

	return current;
}

/** Highlight the nav item for the last segment whose top has crossed the active band. */
export function watchSectionNav<T extends string>(
	segments: readonly NavSegment<T>[],
	onActive: (id: T | null) => void
): () => void {
	if (typeof document === 'undefined') return () => {};

	const sectionIds = [...new Set(segments.map((s) => s.sectionId))];
	let stopped = false;
	let frame = 0;

	const sync = () => {
		if (stopped) return;
		onActive(measureActive(segments, sectionIds));
	};

	const schedule = () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(sync);
	};

	const connect = async (attempt = 0) => {
		await tick();
		if (stopped) return;

		const missing = sectionIds.some((id) => !document.getElementById(id));
		if (missing) {
			if (attempt < 30) requestAnimationFrame(() => void connect(attempt + 1));
			else onActive(null);
			return;
		}

		sync();
	};

	void connect();

	window.addEventListener('scroll', schedule, { passive: true, capture: true });
	document.addEventListener('scroll', schedule, { passive: true, capture: true });
	window.addEventListener('resize', schedule, { passive: true });

	return () => {
		stopped = true;
		cancelAnimationFrame(frame);
		window.removeEventListener('scroll', schedule, true);
		document.removeEventListener('scroll', schedule, true);
		window.removeEventListener('resize', schedule);
	};
}
