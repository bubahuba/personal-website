import { applyDocumentLanguage, sourceLanguage, type Language } from './languages';

const SOURCE = sourceLanguage.tag;
const SKIP_SELECTOR = '.notranslate, [translate="no"], script, style, noscript, svg, textarea';
const TEXT_ATTRIBUTES = ['alt', 'aria-label', 'title', 'placeholder'] as const;

interface DownloadProgressEvent extends Event {
	loaded?: number;
	total?: number;
}

interface TranslateMonitor {
	addEventListener(
		type: 'downloadprogress',
		listener: (event: DownloadProgressEvent) => void
	): void;
	ondownloadprogress: ((event: DownloadProgressEvent) => void) | null;
}

interface TranslatorInstance {
	translate(input: string): Promise<string>;
	/** Present on the origin-trial API; create() already waits on the current API. */
	ready?: Promise<unknown>;
}

interface TranslatorFactory {
	create(options: {
		sourceLanguage: string;
		targetLanguage: string;
		signal?: AbortSignal;
		monitor?: (monitor: TranslateMonitor) => void;
	}): Promise<TranslatorInstance>;
}

type CreateFailure = 'needs-gesture' | 'unavailable' | 'aborted';
type CreateResult =
	{ ok: true; translator: TranslatorInstance } | { ok: false; reason: CreateFailure };

type Inflight = {
	gesture: boolean;
	progressed: boolean;
	abort: () => void;
	promise: Promise<CreateResult>;
};

type RecordState = {
	original: string;
	applied: string | null;
	locale: string | null;
};

export type TranslateResult = 'done' | 'needs-gesture' | 'unavailable' | 'stale';

const textRecords = new Map<Text, RecordState>();
const attrRecords = new Map<Element, Map<string, RecordState>>();
const translators = new Map<string, TranslatorInstance>();
const inflight = new Map<string, Inflight>();
const cache = new Map<string, string>();
let downloadListener: ((ratio: number) => void) | null = null;

let currentLanguage: Language = sourceLanguage;
let touched = false;
let running = false;
let writing = false;
let dirty = false;
let generation = 0;
let observer: MutationObserver | null = null;
let timer = 0;
let titleState: RecordState | null = null;

function browserScope(): {
	Translator?: TranslatorFactory;
	ai?: { translator?: TranslatorFactory };
} {
	return globalThis as {
		Translator?: TranslatorFactory;
		ai?: { translator?: TranslatorFactory };
	};
}

/**
 * Current Chrome exposes `Translator`. The origin-trial API from the
 * language-detector guide is `self.ai.translator` and has no `availability()`.
 * `Translator.availability()` is not used: it can stay pending forever, and
 * Chrome reports every pair as downloadable until `create()` runs.
 */
function translatorFactory(): { api: TranslatorFactory; modern: boolean } | null {
	if (!globalThis.isSecureContext) return null;
	const scope = browserScope();
	if (typeof scope.Translator?.create === 'function')
		return { api: scope.Translator, modern: true };
	if (typeof scope.ai?.translator?.create === 'function') {
		return { api: scope.ai.translator, modern: false };
	}
	return null;
}

export function translatorSupported(): boolean {
	return translatorFactory() !== null;
}

/** 0–1. The current API reports `loaded` as a fraction; the origin trial used `loaded / total`. */
function downloadRatio(event: DownloadProgressEvent): number {
	const loaded = event.loaded ?? 0;
	const total = event.total;
	if (typeof total === 'number' && total > 0 && (loaded > 1 || total > 1)) {
		return Math.min(1, Math.max(0, loaded / total));
	}
	return Math.min(1, Math.max(0, loaded));
}

export function onDownloadProgress(listener: (ratio: number) => void) {
	downloadListener = listener;
	return () => {
		if (downloadListener === listener) downloadListener = null;
	};
}

/** Share of the overall 0–1 bar reserved for language-pack download; the rest is on-page translation. */
const MODEL_PROGRESS_CAP = 0.22;

function reportOverall(ratio: number) {
	downloadListener?.(Math.min(1, Math.max(0, ratio)));
}

function reportModelDownload(eventRatio: number) {
	reportOverall(eventRatio * MODEL_PROGRESS_CAP);
}

function reportTranslationProgress(done: number, total: number, modelCap: number) {
	if (total <= 0) {
		reportOverall(1);
		return;
	}
	const fraction = Math.min(1, Math.max(0, done / total));
	reportOverall(modelCap + (1 - modelCap) * fraction);
}

function failureReason(error: unknown): CreateFailure {
	const name =
		error instanceof DOMException ? error.name : error instanceof Error ? error.name : '';
	if (name === 'NotAllowedError') return 'needs-gesture';
	if (name === 'AbortError') return 'aborted';
	return 'unavailable';
}

/**
 * Starts `create()` immediately. Call this synchronously from the language click
 * so a language-pack download still has transient user activation.
 * A refresh has no activation: `create()` still runs, and succeeds when the pack
 * is already installed. A click replaces a gesture-less attempt that has not
 * started downloading, so the new `create()` keeps the activation.
 */
export function primeTranslator(tag: string, gesture: boolean) {
	if (tag === SOURCE || translators.has(tag)) return;
	const existing = inflight.get(tag);
	if (existing) {
		if (!(gesture && !existing.gesture && !existing.progressed)) return;
		existing.abort();
		inflight.delete(tag);
	}

	const factory = translatorFactory();
	if (!factory) return;

	const controller = new AbortController();
	const entry: Inflight = {
		gesture,
		progressed: false,
		abort() {
			controller.abort();
		},
		promise: Promise.resolve({ ok: false, reason: 'unavailable' })
	};
	let created: Promise<TranslatorInstance>;
	try {
		reportOverall(0);
		created = factory.api.create({
			sourceLanguage: SOURCE,
			targetLanguage: tag,
			...(factory.modern ? { signal: controller.signal } : {}),
			monitor(monitor) {
				const onProgress = (event: DownloadProgressEvent) => {
					entry.progressed = true;
					reportModelDownload(downloadRatio(event));
				};
				monitor.addEventListener('downloadprogress', onProgress);
				try {
					monitor.ondownloadprogress = onProgress;
				} catch {
					// addEventListener is enough when the handler property is read-only.
				}
			}
		});
	} catch (error) {
		const reason = failureReason(error);
		entry.promise = Promise.resolve({
			ok: false,
			reason: reason === 'aborted' ? 'unavailable' : reason
		});
		inflight.set(tag, entry);
		return;
	}

	entry.promise = created
		.then(async (translator) => {
			if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
			if (translator.ready) await translator.ready;
			reportOverall(MODEL_PROGRESS_CAP);
			translators.set(tag, translator);
			if (inflight.get(tag) === entry) inflight.delete(tag);
			return { ok: true as const, translator };
		})
		.catch((error: unknown) => {
			if (inflight.get(tag) === entry) inflight.delete(tag);
			return { ok: false as const, reason: failureReason(error) };
		});

	inflight.set(tag, entry);
}

async function ensureTranslator(
	tag: string,
	gesture: boolean
): Promise<TranslatorInstance | 'needs-gesture' | null> {
	const ready = translators.get(tag);
	if (ready) return ready;

	primeTranslator(tag, gesture);
	const pending = inflight.get(tag);
	if (!pending) return null;

	const result = await pending.promise;
	if (result.ok) return result.translator;
	if (result.reason === 'needs-gesture' || result.reason === 'aborted') return 'needs-gesture';
	return null;
}

function shouldTranslate(text: string): boolean {
	const trimmed = text.trim();
	if (trimmed.length < 2) return false;
	if (!/\p{L}/u.test(trimmed)) return false;
	if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(trimmed)) return false;
	if (/^https?:\/\/\S+$/i.test(trimmed)) return false;
	return true;
}

function edges(value: string): { leading: string; core: string; trailing: string } | null {
	const core = value.trim();
	if (!shouldTranslate(core)) return null;
	const start = value.indexOf(core);
	return {
		leading: value.slice(0, start),
		core,
		trailing: value.slice(start + core.length)
	};
}

function readState(state: RecordState, current: string): string {
	if (current !== state.applied && current !== state.original) {
		state.original = current;
		state.applied = null;
		state.locale = null;
	}
	return state.original;
}

function blocked(element: Element | null): boolean {
	return (
		!element ||
		element.closest(SKIP_SELECTOR) !== null ||
		(element instanceof HTMLElement && element.isContentEditable)
	);
}

function collectText(): Array<{
	node: Text;
	state: RecordState;
	leading: string;
	core: string;
	trailing: string;
}> {
	const found: Array<{
		node: Text;
		state: RecordState;
		leading: string;
		core: string;
		trailing: string;
	}> = [];
	if (!document.body) return found;

	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			if (blocked(node.parentElement)) return NodeFilter.FILTER_REJECT;
			const text = node as Text;
			const stored = textRecords.get(text)?.original;
			if (!edges(stored ?? text.data) && !edges(text.data)) return NodeFilter.FILTER_REJECT;
			return NodeFilter.FILTER_ACCEPT;
		}
	});

	let current = walker.nextNode();
	while (current) {
		const node = current as Text;
		const parts = edges(node.data);
		if (parts) {
			let state = textRecords.get(node);
			if (!state) {
				state = { original: node.data, applied: null, locale: null };
				textRecords.set(node, state);
			}
			readState(state, node.data);
			const originalParts = edges(state.original);
			if (originalParts) {
				found.push({ node, state, ...originalParts });
			}
		}
		current = walker.nextNode();
	}

	return found;
}

function collectAttributes(): Array<{
	element: Element;
	name: string;
	state: RecordState;
	leading: string;
	core: string;
	trailing: string;
}> {
	const found: Array<{
		element: Element;
		name: string;
		state: RecordState;
		leading: string;
		core: string;
		trailing: string;
	}> = [];
	if (!document.body) return found;

	for (const name of TEXT_ATTRIBUTES) {
		for (const element of document.body.querySelectorAll(`[${name}]`)) {
			if (blocked(element)) continue;
			const current = element.getAttribute(name) ?? '';
			let bucket = attrRecords.get(element);
			if (!bucket) {
				bucket = new Map();
				attrRecords.set(element, bucket);
			}
			let state = bucket.get(name);
			if (!state) {
				state = { original: current, applied: null, locale: null };
				bucket.set(name, state);
			}
			readState(state, current);
			const parts = edges(state.original);
			if (!parts) continue;
			found.push({ element, name, state, ...parts });
		}
	}

	return found;
}

function titleParts(): {
	state: RecordState;
	leading: string;
	core: string;
	trailing: string;
} | null {
	const current = document.title;
	if (!titleState) {
		const parts = edges(current);
		if (!parts) return null;
		titleState = { original: current, applied: null, locale: null };
	}
	readState(titleState, current);
	const parts = edges(titleState.original);
	if (!parts || !titleState) return null;
	return { state: titleState, ...parts };
}

function writeText(node: Text, state: RecordState, value: string, locale: string) {
	state.applied = value;
	state.locale = locale;
	if (node.isConnected && node.data !== value) node.data = value;
}

function restoreAll() {
	writing = true;
	try {
		for (const [node, state] of textRecords) {
			if (!node.isConnected) {
				textRecords.delete(node);
				continue;
			}
			if (state.applied !== null && node.data === state.applied) node.data = state.original;
			state.applied = null;
			state.locale = null;
		}
		for (const [element, bucket] of attrRecords) {
			if (!element.isConnected) {
				attrRecords.delete(element);
				continue;
			}
			for (const [name, state] of bucket) {
				if (state.applied !== null && element.getAttribute(name) === state.applied) {
					element.setAttribute(name, state.original);
				}
				state.applied = null;
				state.locale = null;
			}
		}
		if (titleState?.applied !== null && titleState && document.title === titleState.applied) {
			document.title = titleState.original;
		}
		if (titleState) {
			titleState.applied = null;
			titleState.locale = null;
		}
	} finally {
		writing = false;
	}
}

function prune() {
	for (const node of textRecords.keys()) {
		if (!node.isConnected) textRecords.delete(node);
	}
	for (const element of attrRecords.keys()) {
		if (!element.isConnected) attrRecords.delete(element);
	}
}

async function applyLanguage(
	language: Language,
	translator: TranslatorInstance,
	gen: number,
	modelCap: number
): Promise<'applied' | 'failed' | 'empty' | 'stale'> {
	prune();
	const texts = collectText();
	const attributes = collectAttributes();
	const title = titleParts();

	type Job = { core: string; apply: (translated: string) => void };
	const jobs: Job[] = [];

	for (const item of texts) {
		if (item.state.locale === language.locale && item.node.data === item.state.applied) continue;
		jobs.push({
			core: item.core,
			apply(translated) {
				writeText(
					item.node,
					item.state,
					item.leading + translated + item.trailing,
					language.locale
				);
			}
		});
	}

	for (const item of attributes) {
		const current = item.element.getAttribute(item.name);
		if (item.state.locale === language.locale && current === item.state.applied) continue;
		jobs.push({
			core: item.core,
			apply(translated) {
				const value = item.leading + translated + item.trailing;
				item.state.applied = value;
				item.state.locale = language.locale;
				if (item.element.isConnected && item.element.getAttribute(item.name) !== value) {
					item.element.setAttribute(item.name, value);
				}
			}
		});
	}

	if (
		title &&
		!(title.state.locale === language.locale && document.title === title.state.applied)
	) {
		jobs.push({
			core: title.core,
			apply(translated) {
				const value = title.leading + translated + title.trailing;
				title.state.applied = value;
				title.state.locale = language.locale;
				if (document.title !== value) document.title = value;
			}
		});
	}

	const groups = new Map<string, Job[]>();
	for (const job of jobs) {
		const group = groups.get(job.core);
		if (group) group.push(job);
		else groups.set(job.core, [job]);
	}

	const totalGroups = groups.size;
	if (totalGroups === 0) {
		reportTranslationProgress(1, 1, modelCap);
		return 'empty';
	}

	let applied = 0;
	let failed = 0;
	let translatedGroups = 0;
	const separator = '\n⟦⟧\n';

	async function translateOne(core: string): Promise<string | null> {
		try {
			const translated = await translator.translate(core);
			return translated || null;
		} catch {
			return null;
		}
	}

	function writeCore(core: string, translated: string) {
		cache.set(`${language.tag}\n${core}`, translated);
		writing = true;
		try {
			for (const job of groups.get(core) ?? []) job.apply(translated);
		} finally {
			writing = false;
		}
		applied += 1;
	}

	const todo = [...groups.keys()].filter((core) => {
		const cached = cache.get(`${language.tag}\n${core}`);
		if (!cached) return true;
		writeCore(core, cached);
		translatedGroups += 1;
		reportTranslationProgress(translatedGroups, totalGroups, modelCap);
		return false;
	});

	for (let index = 0; index < todo.length;) {
		if (gen !== generation) return 'stale';
		const batch: string[] = [];
		let size = 0;
		while (index < todo.length && batch.length < 20 && size < 2500) {
			const core = todo[index];
			batch.push(core);
			size += core.length + separator.length;
			index += 1;
		}

		let parts: Array<string | null> | null = null;
		if (batch.length === 1) {
			parts = [await translateOne(batch[0])];
		} else {
			try {
				const translated = await translator.translate(batch.join(separator));
				const split = translated.split(/\n?⟦⟧\n?/);
				if (split.length === batch.length) parts = split;
			} catch {
				parts = null;
			}
			if (!parts) {
				parts = [];
				for (const core of batch) {
					if (gen !== generation) return 'stale';
					parts.push(await translateOne(core));
				}
			}
		}

		if (gen !== generation) return 'stale';
		batch.forEach((core, item) => {
			const translated = parts?.[item];
			if (!translated) {
				failed += 1;
				translatedGroups += 1;
				return;
			}
			writeCore(core, translated);
			translatedGroups += 1;
		});
		reportTranslationProgress(translatedGroups, totalGroups, modelCap);
	}

	if (gen !== generation) return 'stale';
	if (applied === 0 && failed > 0) return 'failed';
	return 'applied';
}

function ensureObserver() {
	if (observer || !document.body) return;
	observer = new MutationObserver(() => {
		if (running || writing) {
			dirty = true;
			return;
		}
		scheduleRetranslate();
	});
	observer.observe(document.documentElement, {
		subtree: true,
		childList: true,
		characterData: true,
		attributes: true,
		attributeFilter: [...TEXT_ATTRIBUTES]
	});
}

function scheduleRetranslate() {
	if (!touched || currentLanguage.tag === SOURCE) return;
	window.clearTimeout(timer);
	timer = window.setTimeout(() => {
		if (!running) void translatePage(currentLanguage, false);
	}, 80);
}

export async function translatePage(language: Language, gesture = false): Promise<TranslateResult> {
	const gen = ++generation;
	running = true;

	try {
		currentLanguage = language;

		if (language.tag === SOURCE && !touched) return 'done';

		if (language.tag === SOURCE) {
			restoreAll();
			applyDocumentLanguage(language);
			return 'done';
		}

		const packAlreadyLoaded = translators.has(language.tag);
		reportOverall(0);

		const translator = await ensureTranslator(language.tag, gesture);
		if (gen !== generation) return 'stale';
		if (translator === 'needs-gesture') return 'needs-gesture';
		if (!translator) return 'unavailable';

		const modelCap = packAlreadyLoaded ? 0 : MODEL_PROGRESS_CAP;

		touched = true;
		let pass = 0;
		let outcome: 'applied' | 'failed' | 'empty' | 'stale' = 'empty';
		do {
			if (gen !== generation) return 'stale';
			dirty = false;
			pass += 1;
			outcome = await applyLanguage(language, translator, gen, modelCap);
			await Promise.resolve();
		} while (
			dirty &&
			gen === generation &&
			pass < 3 &&
			outcome !== 'failed' &&
			outcome !== 'stale'
		);

		if (gen !== generation || outcome === 'stale') return 'stale';
		if (outcome === 'failed') return 'unavailable';
		applyDocumentLanguage(language);
		ensureObserver();
		reportOverall(1);
		return 'done';
	} catch {
		if (gen !== generation) return 'stale';
		return 'unavailable';
	} finally {
		if (gen === generation) {
			running = false;
			if (dirty) scheduleRetranslate();
		}
	}
}
