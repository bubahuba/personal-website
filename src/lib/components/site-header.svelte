<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button';
	import { cn } from '#lib/utils';
	import { layoutNavIndicator, observeNavIndicator } from '#lib/nav-indicator';
	import LanguageMenu from './language-menu.svelte';
	import Mark from './mark.svelte';
	import ThemeToggle from './theme-toggle.svelte';
	import { person } from '#lib/profile';
	import { scrollToHomeHero, scrollToHomeIntro } from '#lib/home-intro';
	import { watchSectionNav } from '#lib/section-nav-spy';

	let {
		introProgress = 1,
		introScrollActive = false
	}: {
		introProgress?: number;
		introScrollActive?: boolean;
	} = $props();

	const navItems = [
		{ id: 'work', label: 'Work', sections: ['work', 'work-further'] },
		{ id: 'practice', label: 'Practice', sections: ['practice'] },
		{ id: 'experience', label: 'Experience', sections: ['experience'] },
		{ id: 'contact', label: 'Contact', sections: ['contact'] }
	] as const;

	type SectionId = (typeof navItems)[number]['id'];

	const navSegments = navItems.flatMap((item) =>
		item.sections.map((sectionId) => ({ sectionId, navId: item.id }))
	);

	const home = $derived(page.url.pathname === '/');

	const projectPage = $derived(
		page.data.project as { title: string } | undefined
	);
	const isProjectDetail = $derived(projectPage != null && page.url.pathname.startsWith('/work/'));

	let scrolledSection = $state<SectionId | null>(null);
	let pinnedSection = $state<SectionId | null>(null);

	const activeSection = $derived.by((): SectionId | null => {
		if (!home) return null;
		return pinnedSection ?? scrolledSection;
	});

	function isSectionId(value: string): value is SectionId {
		return navItems.some((item) => item.id === value);
	}

	function pinSection(id: SectionId) {
		pinnedSection = id;
	}

	const brandShrinked = $derived(!introScrollActive || introProgress >= 0.98);

	let desktopNav = $state<HTMLElement | null>(null);
	let mobileNav = $state<HTMLElement | null>(null);
	let desktopBreadcrumbNav = $state<HTMLElement | null>(null);
	let mobileBreadcrumbNav = $state<HTMLElement | null>(null);

	let desktopIndicator = $state({ x: 0, width: 0, visible: false });
	let mobileIndicator = $state({ x: 0, width: 0, visible: false });
	let desktopBreadcrumbIndicator = $state({ x: 0, width: 0, visible: false });
	let mobileBreadcrumbIndicator = $state({ x: 0, width: 0, visible: false });

	let breadcrumbPin = $state<'work' | 'project' | null>(null);
	const breadcrumbIndicatorId = $derived(breadcrumbPin ?? 'project');

	function href(id: SectionId) {
		return home ? `#${id}` : `/#${id}`;
	}

	function navLinkClass(hover = true) {
		return cn('site-nav-link', hover && 'site-nav-link--hover');
	}

	function indicatorStyle(layout: { x: number; width: number; visible: boolean }) {
		return `--nav-x:${layout.x}px;--nav-w:${layout.width}px`;
	}

	function onBrandClick(event: MouseEvent) {
		if (!home) return;
		event.preventDefault();
		pinnedSection = null;
		const { pathname, search, hash } = window.location;
		if (hash) {
			history.replaceState(history.state, '', `${pathname}${search}`);
		}
		if (brandShrinked) {
			scrollToHomeIntro(true);
		} else {
			scrollToHomeHero(true);
		}
	}

	$effect(() => {
		if (!home) {
			scrolledSection = null;
			pinnedSection = null;
			return;
		}

		const hash = page.url.hash.replace(/^#/, '');
		if (isSectionId(hash)) pinnedSection = hash;

		return watchSectionNav(navSegments, (id) => {
			scrolledSection = id;
			if (pinnedSection && id === pinnedSection) pinnedSection = null;
		});
	});

	$effect(() => {
		if (isProjectDetail) return;
		const active = activeSection;
		const nav = desktopNav;
		if (!nav) return;

		const apply = () => {
			desktopIndicator = layoutNavIndicator(nav, active);
		};

		apply();
		return observeNavIndicator(nav, apply);
	});

	$effect(() => {
		if (isProjectDetail) return;
		const active = activeSection;
		const nav = mobileNav;
		if (!nav) return;

		const apply = () => {
			mobileIndicator = layoutNavIndicator(nav, active);
		};

		apply();
		return observeNavIndicator(nav, apply);
	});

	$effect(() => {
		if (!isProjectDetail) {
			breadcrumbPin = null;
			return;
		}
		breadcrumbIndicatorId;
		page.url.pathname;
		projectPage?.title;
		const nav = desktopBreadcrumbNav;
		if (!nav) return;

		const target = breadcrumbIndicatorId;
		const apply = () => {
			desktopBreadcrumbIndicator = layoutNavIndicator(nav, target);
		};

		void tick().then(apply);
		return observeNavIndicator(nav, apply);
	});

	$effect(() => {
		if (!isProjectDetail) return;
		breadcrumbIndicatorId;
		page.url.pathname;
		projectPage?.title;
		const nav = mobileBreadcrumbNav;
		if (!nav) return;

		const target = breadcrumbIndicatorId;
		const apply = () => {
			mobileBreadcrumbIndicator = layoutNavIndicator(nav, target);
		};

		void tick().then(apply);
		return observeNavIndicator(nav, apply);
	});
</script>

<header
	class={cn(
		'sticky top-0 z-20 border-b bg-background/50 backdrop-blur-md',
		introScrollActive && 'site-header--intro-scrub'
	)}

>
	<div class="site-header__bar mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3">
		<div class="site-header__brand-wrap relative shrink-0">
			<div data-site-header-brand-slot class="site-header__brand-slot" aria-hidden="true"></div>
			<a
				href="/"
				data-site-header-brand
				class="site-header__brand flex items-center gap-3"
				onclick={onBrandClick}
			>
			<span class="site-header__brand-mark-wrap inline-flex shrink-0 items-center justify-center">
				<Mark clipSuffix="brand" class="site-header__brand-mark mark--hero text-4xl" />
			</span>
			<span class="site-header__brand-titles flex flex-col leading-none">
				<span
					class="site-header__brand-name font-serif tracking-tight sign notranslate text-2xl"
					>{person.name}</span
				>
				<span
					class="site-header__brand-tagline mt-1 text-xs tracking-wide text-muted-foreground"
					>Design-trained full-stack developer</span
				>
			</span>
			</a>
		</div>
		<div class="site-header__chrome ms-auto flex min-w-0 items-center gap-2">
			{#if isProjectDetail && projectPage}
				<nav
					bind:this={desktopBreadcrumbNav}
					class="site-nav-rail hidden min-w-0 items-center gap-5 text-sm md:flex"
					aria-label="Breadcrumb"
				>
					<a class={navLinkClass()} data-nav="work" href="/#work" onclick={() => (breadcrumbPin = 'work')}
						>Work</a
					>
					<span
						class="site-nav-link min-w-0 truncate font-medium notranslate"
						data-nav="project"
						aria-current="page"
					>
						{projectPage.title}
					</span>
					<span
						class="site-nav-indicator"
						class:site-nav-indicator--hidden={!desktopBreadcrumbIndicator.visible}
						style={indicatorStyle(desktopBreadcrumbIndicator)}
						aria-hidden="true"
					></span>
				</nav>
				<Button href={person.email ? `mailto:${person.email}` : '/#contact'} size="sm" class="hidden md:inline-flex"
					>Hire me</Button
				>
			{:else}
				<nav
					bind:this={desktopNav}
					class="site-nav-rail hidden items-center gap-5 text-sm md:flex"
					aria-label="Page"
				>
					{#each navItems as item (item.id)}
						<a
							class={navLinkClass()}
							data-nav={item.id}
							href={href(item.id)}
							aria-current={activeSection === item.id ? 'page' : undefined}
							onclick={() => pinSection(item.id)}
						>
							{item.label}
						</a>
					{/each}
					<span
						class="site-nav-indicator"
						class:site-nav-indicator--hidden={!desktopIndicator.visible}
						style={indicatorStyle(desktopIndicator)}
						aria-hidden="true"
					></span>
					<Button href={person.email ? `mailto:${person.email}` : '/#contact'} size="sm"
						>Hire me</Button
					>
				</nav>
			{/if}
			<LanguageMenu />
			<ThemeToggle />
			<div class="md:hidden">
				<Button href={`mailto:${person.email}`} size="sm">Hire me</Button>
			</div>
		</div>
	</div>
	{#if isProjectDetail && projectPage}
		<nav
			bind:this={mobileBreadcrumbNav}
			class="site-header__mobile-nav site-nav-rail mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-5 pb-3 text-sm md:hidden"
			aria-label="Breadcrumb"
		>
			<a
				class={navLinkClass(false)}
				data-nav="work"
				href="/#work"
				onclick={() => (breadcrumbPin = 'work')}>Work</a
			>
			<span
				class="site-nav-link min-w-0 truncate font-medium notranslate"
				data-nav="project"
				aria-current="page"
			>
				{projectPage.title}
			</span>
			<span
				class="site-nav-indicator"
				class:site-nav-indicator--hidden={!mobileBreadcrumbIndicator.visible}
				style={indicatorStyle(mobileBreadcrumbIndicator)}
				aria-hidden="true"
			></span>
		</nav>
	{:else}
		<nav
			bind:this={mobileNav}
			class="site-header__mobile-nav site-nav-rail mx-auto flex w-full max-w-6xl gap-3 overflow-x-auto px-5 pb-3 text-sm md:hidden"
			aria-label="Page"
		>
			{#each navItems as item (item.id)}
				<a
					class={navLinkClass(false)}
					data-nav={item.id}
					href={href(item.id)}
					aria-current={activeSection === item.id ? 'page' : undefined}
					onclick={() => pinSection(item.id)}
				>
					{item.label}
				</a>
			{/each}
			<span
				class="site-nav-indicator"
				class:site-nav-indicator--hidden={!mobileIndicator.visible}
				style={indicatorStyle(mobileIndicator)}
				aria-hidden="true"
			></span>
		</nav>
	{/if}
</header>
