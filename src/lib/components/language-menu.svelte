<script lang="ts">
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { PathnameWithSearchOrHash } from '$app/types';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { DropdownMenu } from 'bits-ui';
	import { onMount } from 'svelte';
	import { buttonVariants } from '#lib/components/ui/button';
	import { languageFromLocale, languages, sourceLanguage, type Language } from '#lib/languages';
	import {
		onDownloadProgress,
		primeTranslator,
		translatePage,
		translatorSupported
	} from '#lib/page-translate';
	import { cn } from '#lib/utils';

	let choices = $state<Language[]>([]);
	let optimistic = $state<string | null>(null);
	let busy = $state(false);
	let needsGesture = $state(false);
	let download = $state<number | null>(null);
	let request = 0;
	let runningTag: string | null = null;

	/** Shallow `goto` updates `page.shallow.url`, not `page.url`. */
	function currentUrl() {
		return page.shallow?.url ?? page.url;
	}

	const showProgressRing = $derived(busy && download !== null);

	const active = $derived.by(() => {
		const locale = optimistic ?? currentUrl().searchParams.get('lang');
		const match = languageFromLocale(locale);
		if (choices.length > 0 && !choices.some((language) => language.locale === match.locale)) {
			return sourceLanguage;
		}
		return match;
	});

	function choiceFrom(locale: string | null): Language {
		const match = languageFromLocale(locale);
		if (!choices.some((language) => language.locale === match.locale)) return sourceLanguage;
		return match;
	}

	async function run(language: Language, gesture: boolean) {
		const id = ++request;
		runningTag = language.tag;
		busy = language.tag !== 'en';
		download = language.tag === 'en' ? null : 0;
		const result = await translatePage(language, gesture);
		if (id !== request) return;
		runningTag = null;
		busy = false;
		download = null;
		needsGesture = result === 'needs-gesture';
	}

	function selectLanguage(locale: string) {
		const next = choiceFrom(locale);
		optimistic = next.locale;
		needsGesture = false;
		download = null;
		if (next.tag !== 'en') primeTranslator(next.tag, true);
		const url = new URL(currentUrl().href);
		if (url.searchParams.get('lang') !== next.locale) {
			url.searchParams.set('lang', next.locale);
			const href = `${url.pathname}${url.search}${url.hash}` as PathnameWithSearchOrHash;
			void goto(resolve(href), { shallow: true, reset: false });
		}
		void run(next, true);
	}

	beforeNavigate((nav) => {
		if (nav.type === 'popstate' || nav.willUnload || !nav.to) return;
		const lang = optimistic ?? currentUrl().searchParams.get('lang');
		if (!lang || nav.to.url.searchParams.has('lang')) return;
		nav.to.url.searchParams.set('lang', lang);
	});

	afterNavigate(() => {
		optimistic = null;
		if (choices.length === 0) return;
		const language = choiceFrom(currentUrl().searchParams.get('lang'));
		// The click already started this translation. A second run would cancel it.
		if (runningTag === language.tag) return;
		void run(language, false);
	});

	onMount(() => {
		if (!translatorSupported()) return;
		choices = [...languages];
		const stopProgress = onDownloadProgress((ratio) => {
			download = ratio;
		});
		if (currentUrl().searchParams.has('lang')) {
			void run(choiceFrom(currentUrl().searchParams.get('lang')), false);
		}
		return stopProgress;
	});
</script>

{#if choices.length > 0}
	<div class="notranslate" dir="ltr" translate="no">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={cn(buttonVariants({ variant: 'ghost' }), 'lang-progress-trigger gap-1.5 px-2.5')}
				aria-label={needsGesture
					? `Translate page to ${active.label}`
					: busy && download !== null
						? `Translating page, ${Math.round(download * 100)} percent`
						: `Language: ${active.label}`}
				aria-busy={busy}
				aria-valuenow={busy && download !== null ? Math.round(download * 100) : undefined}
				aria-valuemin={busy && download !== null ? 0 : undefined}
				aria-valuemax={busy && download !== null ? 100 : undefined}
				title={needsGesture ? `Translate this page to ${active.label}` : undefined}
				onclick={() => {
					if (active.tag === 'en' || (!needsGesture && !busy)) return;
					download = 0;
					primeTranslator(active.tag, true);
					void run(active, true);
				}}
			>
				<span
					class={cn(
						'lang-progress',
						!showProgressRing && 'lang-progress--idle',
						busy && download === null && '[&_.lang-progress__label]:animate-pulse'
					)}
					style="--lang-progress: {download ?? 0}"
				>
					<span class="lang-progress__label tracking-wide">{active.label}</span>
				</span>
				<ChevronDown class="size-3.5 opacity-70" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				align="end"
				sideOffset={6}
				class="notranslate z-50 max-h-80 min-w-24 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
				translate="no"
			>
				<DropdownMenu.RadioGroup value={active.locale}>
					{#each choices as language (language.locale)}
						<DropdownMenu.RadioItem
							value={language.locale}
							class="flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none data-highlighted:bg-muted data-[state=checked]:font-medium"
							onSelect={() => selectLanguage(language.locale)}
						>
							<span class="w-6">{language.label}</span>
							{#if language.locale === active.locale}
								<Check class="size-3.5" />
							{/if}
						</DropdownMenu.RadioItem>
					{/each}
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
