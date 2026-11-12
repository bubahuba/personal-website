<script lang="ts">
	import { page } from '$app/state';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import { Button } from '#lib/components/ui/button';
	import CvPdfDownload from './cv-pdf-download.svelte';
	import LanguageMenu from './language-menu.svelte';
	import ThemeToggle from './theme-toggle.svelte';
	import { cn } from '#lib/utils';
	import { person } from '#lib/profile';

	type SectionId = 'work' | 'practice' | 'experience' | 'contact';

	type NavItem = {
		id: SectionId;
		label: string;
	};

	let {
		navItems,
		activeSection,
		href,
		onPinSection,
		isProjectDetail = false,
		projectTitle = '',
		onBreadcrumbWork,
		menuOpen = $bindable(false)
	}: {
		navItems: readonly NavItem[];
		activeSection: SectionId | null;
		href: (id: SectionId) => string;
		onPinSection: (id: SectionId) => void;
		isProjectDetail?: boolean;
		projectTitle?: string;
		onBreadcrumbWork?: () => void;
		menuOpen?: boolean;
	} = $props();

	const open = $derived(menuOpen);

	function setOpen(next: boolean) {
		menuOpen = next;
	}
	let panelId = 'site-mobile-menu';

	function closeMenu() {
		setOpen(false);
	}

	function toggleMenu() {
		setOpen(!menuOpen);
	}

	$effect(() => {
		const header = document.querySelector<HTMLElement>('.site-header');
		if (!header) return;

		const syncHeight = () => {
			header.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
		};

		syncHeight();
		const observer = new ResizeObserver(syncHeight);
		observer.observe(header);
		return () => observer.disconnect();
	});

	function onNavClick(id: SectionId) {
		onPinSection(id);
		closeMenu();
	}

	function onWorkBreadcrumbClick() {
		onBreadcrumbWork?.();
		closeMenu();
	}

	$effect(() => {
		page.url.pathname;
		page.url.hash;
		closeMenu();
	});

	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	$effect(() => {
		if (!open) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeMenu();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="mobile-header relative z-10 flex items-center gap-1 md:hidden">
	<ThemeToggle />
	<Button
		variant="ghost"
		size="icon"
		type="button"
		aria-expanded={open}
		aria-controls={panelId}
		aria-label={open ? 'Close menu' : 'Open menu'}
		onclick={toggleMenu}
	>
		{#if open}
			<X class="size-5" />
		{:else}
			<Menu class="size-5" />
		{/if}
	</Button>
</div>

{#if open}
	<button
		type="button"
		class="mobile-header__backdrop fixed inset-x-0 bottom-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
		style="top: var(--site-header-height, 3.75rem)"
		aria-label="Close menu"
		onclick={closeMenu}
	></button>
	<nav
		id={panelId}
		class="mobile-header__panel fixed inset-x-0 top-[var(--site-header-height,3.5rem)] z-50 max-h-[calc(100dvh-var(--site-header-height,3.5rem))] overflow-y-auto border-b bg-background px-5 py-4 shadow-lg md:hidden"
		aria-label="Mobile navigation"
	>
		<ul class="flex flex-col gap-1 text-base">
			{#if isProjectDetail && projectTitle}
				<li>
					<a
						class="mobile-header__link block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-muted"
						href="/#work"
						onclick={onWorkBreadcrumbClick}
					>
						Work
					</a>
				</li>
				<li>
					<span
						class="block truncate px-3 py-2.5 font-medium text-muted-foreground notranslate"
						aria-current="page"
					>
						{projectTitle}
					</span>
				</li>
			{:else}
				{#each navItems as item (item.id)}
					<li>
						<a
							class={cn(
								'mobile-header__link block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-muted',
								activeSection === item.id && 'bg-muted text-foreground'
							)}
							href={href(item.id)}
							aria-current={activeSection === item.id ? 'page' : undefined}
							onclick={() => onNavClick(item.id)}
						>
							{item.label}
						</a>
					</li>
				{/each}
			{/if}
		</ul>

		<div class="mt-4 flex flex-col gap-3 border-t pt-4">
			<Button
				href={person.email ? `mailto:${person.email}` : '/#contact'}
				class="w-full"
				size="sm"
				onclick={closeMenu}
			>
				Hire me
			</Button>
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-1.5">
					<span class="text-sm text-muted-foreground">CV</span>
					<CvPdfDownload />
				</div>
				<LanguageMenu />
			</div>
		</div>
	</nav>
{/if}
