export type NavIndicatorLayout = {
	x: number;
	width: number;
	visible: boolean;
};

export function layoutNavIndicator(nav: HTMLElement, activeId: string | null): NavIndicatorLayout {
	if (!activeId) return { x: 0, width: 0, visible: false };

	const link = nav.querySelector<HTMLElement>(`[data-nav="${CSS.escape(activeId)}"]`);
	if (!link) return { x: 0, width: 0, visible: false };

	const navRect = nav.getBoundingClientRect();
	const linkRect = link.getBoundingClientRect();

	return {
		x: linkRect.left - navRect.left + nav.scrollLeft,
		width: linkRect.width,
		visible: true
	};
}

/** Re-measure when the nav or its links resize or the mobile rail scrolls. */
export function observeNavIndicator(nav: HTMLElement, onMeasure: () => void): () => void {
	let frame = 0;

	const schedule = () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(onMeasure);
	};

	const resizeObserver = new ResizeObserver(schedule);
	resizeObserver.observe(nav);
	for (const link of nav.querySelectorAll<HTMLElement>('[data-nav]')) {
		resizeObserver.observe(link);
	}

	nav.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
	window.addEventListener('load', schedule, { once: true });

	schedule();

	return () => {
		cancelAnimationFrame(frame);
		resizeObserver.disconnect();
		nav.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', schedule);
	};
}
