import { homeIntroProgress, homeIntroScrollRange } from './home-intro';

type IntroMetrics = {
	range: number;
	headerCx: number;
	headerCy: number;
	headerW: number;
	headerH: number;
	markBase: number;
	headerMarkPx: number;
	introMarkScale: number;
	headerNamePx: number;
	headerTagPx: number;
	introNamePx: number;
	introTagPx: number;
};

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function introCenterY(viewportHeight: number): number {
	return viewportHeight * 0.5;
}

function measureIntroMarkScale(mark: HTMLElement, viewportWidth: number, viewportHeight: number): number {
	const base = mark.getBoundingClientRect().width;
	if (base <= 0) return 6;
	// ~2× prior intro size; width/height caps keep it inside small viewports.
	const maxByWidth = (viewportWidth * 0.68) / base;
	const maxByHeight = (viewportHeight * 0.34) / base;
	const maxScale = viewportWidth < 380 ? 6.5 : viewportWidth < 480 ? 7.25 : 8;
	return Math.min(maxScale, maxByWidth, maxByHeight);
}

function readFontPx(el: HTMLElement): number {
	return parseFloat(getComputedStyle(el).fontSize) || 16;
}

function measureMetrics(
	brand: HTMLElement,
	mark: HTMLElement,
	nameEl: HTMLElement,
	tagEl: HTMLElement
): IntroMetrics {
	const range = homeIntroScrollRange(window.innerHeight);
	const brandRect = brand.getBoundingClientRect();
	const markRect = mark.getBoundingClientRect();
	const headerNamePx = readFontPx(nameEl);
	const headerTagPx = readFontPx(tagEl);
	const vw = window.innerWidth;

	return {
		range,
		headerCx: brandRect.left + brandRect.width / 2,
		headerCy: brandRect.top + brandRect.height / 2,
		headerW: brandRect.width,
		headerH: brandRect.height,
		markBase: markRect.width || 36,
		headerMarkPx: readFontPx(mark),
		introMarkScale: measureIntroMarkScale(mark, vw, window.innerHeight),
		headerNamePx,
		headerTagPx,
		introNamePx: Math.min(headerNamePx * 1.85, vw * 0.11),
		introTagPx: Math.min(headerTagPx * 1.35, vw * 0.035)
	};
}

function applyFrame(
	brand: HTMLElement,
	mark: HTMLElement,
	nameEl: HTMLElement,
	tagEl: HTMLElement,
	slot: HTMLElement | null,
	root: HTMLElement,
	metrics: IntroMetrics,
	p: number
) {
	const scrubbing = p < 1;
	const vw = window.innerWidth;
	const introCx = vw / 2;
	const introCy = introCenterY(window.innerHeight);

	if (scrubbing) {
		if (slot) slot.style.display = 'block';
	} else if (slot) {
		slot.style.display = 'none';
	}

	if (scrubbing && slot) {
		const slotRect = slot.getBoundingClientRect();
		if (slotRect.width > 0) {
			metrics.headerCx = slotRect.left + slotRect.width / 2;
			metrics.headerCy = slotRect.top + slotRect.height / 2;
		}
	}

	const cx = lerp(introCx, metrics.headerCx, p);
	const cy = lerp(introCy, metrics.headerCy, p);
	const introMarkPx = metrics.headerMarkPx * metrics.introMarkScale;
	const markFontPx = lerp(introMarkPx, metrics.headerMarkPx, p);
	const namePx = lerp(metrics.introNamePx, metrics.headerNamePx, p);
	const tagPx = lerp(metrics.introTagPx, metrics.headerTagPx, p);
	const stacked = p < 0.62;
	const stackProgress = stacked ? Math.min(1, p / 0.62) : 1;
	const introGapRem = 2.25;
	const headerGapRem = 0.75;
	const markWrap = mark.closest<HTMLElement>('.site-header__brand-mark-wrap');

	brand.classList.toggle('site-header__brand--scrubbing', scrubbing);
	brand.classList.toggle('site-header__brand--stacked', scrubbing && stacked);

	if (scrubbing) {
		mark.style.fontSize = `${markFontPx}px`;
	} else {
		mark.style.fontSize = '';
	}

	if (scrubbing && stacked && markWrap) {
		markWrap.style.width = `${mark.offsetWidth}px`;
		markWrap.style.height = `${mark.offsetHeight}px`;
		const gap = lerp(introGapRem, headerGapRem, stackProgress);
		brand.style.gap = `${gap}rem`;
	} else if (markWrap) {
		markWrap.style.width = '';
		markWrap.style.height = '';
		brand.style.gap = scrubbing ? '' : '';
	}

	if (!scrubbing) {
		brand.style.gap = '';
	}

	if (scrubbing) {
		brand.style.left = `${cx}px`;
		brand.style.top = `${cy}px`;
	} else {
		brand.style.left = '';
		brand.style.top = '';
	}

	nameEl.style.fontSize = scrubbing ? `${namePx}px` : '';
	tagEl.style.fontSize = scrubbing ? `${tagPx}px` : '';

	root.style.setProperty('--home-intro-p', String(p));
}

export type HomeIntroScrollOptions = {
	root: HTMLElement;
	enabled: () => boolean;
	onProgress?: (p: number) => void;
};

export function mountHomeIntroScroll({ root, enabled, onProgress }: HomeIntroScrollOptions): () => void {
	let metrics: IntroMetrics | null = null;
	let raf = 0;

	const els = () => {
		const brand = document.querySelector<HTMLElement>('[data-site-header-brand]');
		const slot = document.querySelector<HTMLElement>('[data-site-header-brand-slot]');
		const mark = brand?.querySelector<HTMLElement>('.site-header__brand-mark');
		const nameEl = brand?.querySelector<HTMLElement>('.site-header__brand-name');
		const tagEl = brand?.querySelector<HTMLElement>('.site-header__brand-tagline');
		return brand && slot && mark && nameEl && tagEl
			? { brand, slot, mark, nameEl, tagEl }
			: null;
	};

	const remeasure = () => {
		const found = els();
		if (!found) return;
		const { brand, slot, mark, nameEl, tagEl } = found;

		brand.classList.remove('site-header__brand--scrubbing', 'site-header__brand--stacked');
		brand.style.left = '';
		brand.style.top = '';
		brand.style.gap = '';
		const markWrap = mark.closest<HTMLElement>('.site-header__brand-mark-wrap');
		if (markWrap) {
			markWrap.style.width = '';
			markWrap.style.height = '';
		}
		mark.style.fontSize = '';
		nameEl.style.fontSize = '';
		tagEl.style.fontSize = '';
		slot.style.display = 'none';

		const brandRect = brand.getBoundingClientRect();
		slot.style.width = `${Math.round(brandRect.width)}px`;
		slot.style.height = `${Math.round(brandRect.height)}px`;

		metrics = measureMetrics(brand, mark, nameEl, tagEl);
		const spacerPx = Math.round(window.innerHeight);
		metrics.range = spacerPx;
		root.style.setProperty('--home-intro-range', `${spacerPx}px`);
	};

	const frame = () => {
		raf = 0;
		if (!enabled()) {
			root.style.setProperty('--home-intro-p', '1');
			onProgress?.(1);
			const found = els();
			if (found) {
				found.brand.classList.remove('site-header__brand--scrubbing', 'site-header__brand--stacked');
				found.brand.style.left = '';
				found.brand.style.top = '';
				found.brand.style.gap = '';
				found.mark
					.closest<HTMLElement>('.site-header__brand-mark-wrap')
					?.style.removeProperty('width');
				found.mark
					.closest<HTMLElement>('.site-header__brand-mark-wrap')
					?.style.removeProperty('height');
				found.mark.style.fontSize = '';
				found.nameEl.style.fontSize = '';
				found.tagEl.style.fontSize = '';
			}
			return;
		}

		if (!metrics) remeasure();
		if (!metrics) return;

		const p = homeIntroProgress(window.scrollY, metrics.range);
		const found = els();
		if (!found) return;

		applyFrame(
			found.brand,
			found.mark,
			found.nameEl,
			found.tagEl,
			found.slot,
			root,
			metrics,
			p
		);
		onProgress?.(p);
	};

	const schedule = () => {
		if (raf) return;
		raf = requestAnimationFrame(frame);
	};

	const onScroll = () => schedule();
	const onResize = () => {
		remeasure();
		schedule();
	};

	remeasure();
	schedule();

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onResize, { passive: true });

	return () => {
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onResize);
		if (raf) cancelAnimationFrame(raf);
		root.style.removeProperty('--home-intro-p');
		root.style.removeProperty('--home-intro-range');
	};
}
