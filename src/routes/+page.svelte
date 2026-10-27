<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';
	import { Button } from '#lib/components/ui/button';
	import { Separator } from '#lib/components/ui/separator';
	import IframeLightbox from '#lib/components/iframe-lightbox.svelte';
	import ProjectCard from '#lib/components/project-card.svelte';
	import {
		earlier,
		education,
		featured,
		further,
		languages,
		person,
		roles,
		site,
		skillGroups,
		teaching,
		tracks
	} from '#lib/profile';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: person.name,
		jobTitle: 'Design-trained full-stack developer',
		email: person.email,
		telephone: '+420775275004',
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Třebíč',
			addressCountry: 'CZ'
		},
		sameAs: [
			person.linkedin,
			'https://huba.sk',
			'https://globe.rgb.sk',
			'https://partnercheck.huba.sk'
		]
	};
	const jsonLdText = JSON.stringify(jsonLd);
	let tour = $state(false);

</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<script type="application/ld+json">
		{jsonLdText}
	</script>
</svelte:head>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-20 px-5 py-12">
	<section
		data-home-hero
		class="grid scroll-mt-24 items-end gap-10 md:grid-cols-[1.4fr_0.8fr]"
	>
		<div class="flex flex-col gap-6">
			<p class="text-sm tracking-wide text-muted-foreground uppercase">
				Available for senior roles
			</p>
			<h1 class="notranslate font-serif text-5xl tracking-tight text-balance sm:text-6xl">
				Peter Huba
			</h1>
			<p class="max-w-xl font-serif text-3xl leading-tight text-balance text-foreground/90">
				Design-trained full-stack developer. AI-assisted, still accountable for the work.
			</p>
			<p class="max-w-xl text-lg leading-relaxed text-foreground/80">
				On the web since 1997, shipping client work since 2000. I came through art school in
				Bratislava and Amsterdam, taught designers how a layout becomes software, and now build
				product interfaces and the systems behind them. Huba means mushroom, in Slovak.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each tracks as track (track.id)}
					<Badge variant="outline" class="notranslate">{track.title}</Badge>
				{/each}
				<Badge variant="outline" class="notranslate">Remote · Třebíč</Badge>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button href="#work">Selected work</Button>
				<Button variant="outline" href={`mailto:${person.email}`}>hire@huba.sk</Button>
			</div>
		</div>
		<figure class="flex flex-col gap-3">
			<button
				type="button"
				class="group aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl"
				aria-label="Open a 360° view of Peter Huba at home in the Třebíč Jewish quarter"
				onclick={() => (tour = true)}
			>
				<img
					src={person.portrait}
					alt=""
					class="h-full w-full object-cover object-[30%_center] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
				/>
			</button>
			<figcaption class="text-sm text-muted-foreground">
				At home in Třebíč Jewish quarter, a UNESCO site.
			</figcaption>
		</figure>
	</section>

	<section id="work" class="flex scroll-mt-24 flex-col gap-8">
		<div class="flex max-w-2xl flex-col gap-3">
			<h2 class="font-serif text-4xl">Selected work</h2>
			<p class="leading-relaxed text-foreground/80">
				Four pieces that carry a senior brief: a multi-tenant product, a data desk, a voting tool,
				and a company site I lived with for a decade. Each one has its own page.
			</p>
		</div>
		<div class="grid gap-5 md:grid-cols-2">
			{#each featured as project (project.slug)}
				<ProjectCard {project} />
			{/each}
		</div>
	</section>

	<section id="work-further" class="flex scroll-mt-24 flex-col gap-8">
		<div class="flex max-w-2xl flex-col gap-3">
			<h2 class="font-serif text-4xl">Further range</h2>
			<p class="leading-relaxed text-foreground/80">
				Shipped mobile work, two personal tools, and a first game in Lua. Where I only styled an
				app, the page says so.
			</p>
		</div>
		<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each further as project (project.slug)}
				<ProjectCard {project} />
			{/each}
		</div>
	</section>

	<Separator />

	<section id="practice" class="flex scroll-mt-24 flex-col gap-10">
		<div class="flex max-w-2xl flex-col gap-3">
			<h2 class="font-serif text-4xl">How I fit a senior role</h2>
			<p class="leading-relaxed text-foreground/80">
				One practice, three ways a team usually hires. I am not three different people.
			</p>
		</div>
		<div class="grid gap-5 md:grid-cols-3">
			{#each tracks as track (track.id)}
				<article class="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
					<h3 class="notranslate font-serif text-2xl">{track.title}</h3>
					<p class="leading-relaxed text-foreground/80">{track.text}</p>
					<a class="mt-auto border-b-4 border-highlight text-sm font-medium" href="/#work"
						>See the work</a
					>
				</article>
			{/each}
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			{#each skillGroups as group (group.title)}
				<div class="flex flex-col gap-3">
					<h3 class="font-serif text-2xl">{group.title}</h3>
					<div class="flex flex-wrap gap-1.5">
						{#each group.items as item (item)}
							<Badge variant="secondary" class="notranslate">{item}</Badge>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section id="experience" class="flex scroll-mt-24 flex-col gap-8">
		<h2 class="font-serif text-4xl">Experience</h2>
		<ol class="flex flex-col">
			{#each roles as role (role.org)}
				<li class="grid gap-2 border-t py-6 md:grid-cols-[14rem_1fr] md:gap-8">
					<p class="text-sm text-muted-foreground">{role.when}</p>
					<div class="flex flex-col gap-1">
						<h3 class="notranslate font-serif text-2xl">{role.org}</h3>
						<p class="text-sm">
							{role.title}
							<span class="text-muted-foreground">· {role.place}</span>
						</p>
						<p class="max-w-2xl leading-relaxed text-foreground/80">{role.text}</p>
					</div>
				</li>
			{/each}
		</ol>

		<div class="grid gap-10 md:grid-cols-2">
			<div class="flex flex-col gap-4">
				<h3 class="font-serif text-2xl">Teaching</h3>
				<p class="leading-relaxed text-foreground/80">
					From 2002 to 2018 I taught web and multimedia at art and design schools. The brief was to
					make a bridge: what a designer draws, and what an engineer can ship. I still know a few
					hundred of those people.
				</p>
				<ul class="flex flex-col gap-3">
					{#each teaching as post (post.org)}
						<li>
							<p class="font-medium">{post.org}</p>
							<p class="text-sm text-muted-foreground">{post.when} · {post.text}</p>
						</li>
					{/each}
				</ul>
			</div>
			<div class="flex flex-col gap-4">
				<h3 class="font-serif text-2xl">Education</h3>
				<ul class="flex flex-col gap-3">
					{#each education as school (school.school)}
						<li>
							<p class="font-medium">{school.school}</p>
							<p class="text-sm text-muted-foreground">{school.when} · {school.detail}</p>
						</li>
					{/each}
				</ul>
				<h3 class="mt-4 font-serif text-2xl">Languages</h3>
				<ul class="flex flex-col gap-1 text-sm">
					{#each languages as [language, level] (language)}
						<li class="flex justify-between gap-4 border-b py-2">
							<span>{language}</span>
							<span class="text-muted-foreground">{level}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="flex flex-col gap-3">
			<h3 class="font-serif text-2xl">Earlier websites</h3>
			<p class="max-w-2xl leading-relaxed text-foreground/80">
				ExpressionEngine from 2008. Where the note says design, that was mine too. These are the
				sites from that period. Lots of them are changed or gone, but these are still alive.
			</p>
			<ul class="grid gap-2 md:grid-cols-2 md:gap-x-8">
				{#each earlier as site (site.href)}
					<li>
						<a
							class="border-b-4 border-highlight font-medium"
							href={site.href}
							target="_blank"
							rel="noreferrer">{site.label}</a
						>
						<span class="text-sm text-muted-foreground"> — {site.note}</span>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section
		id="contact"
		class="grid scroll-mt-24 gap-8 rounded-2xl bg-primary px-6 py-8 text-primary-foreground md:grid-cols-[1.2fr_0.8fr] md:px-10"
	>
		<div class="flex flex-col gap-4">
			<h2 class="font-serif text-4xl">What I am looking for</h2>
			<ul class="flex list-disc flex-col gap-2 ps-5 leading-relaxed">
				<li>
					A long-term, full-time seat. Design, full-stack, or AI-assisted product engineering.
				</li>
				<li>Remote, with a daily standup. I live in Třebíč.</li>
				<li>Colleagues who will argue about the work.</li>
			</ul>
			<p class="leading-relaxed text-primary-foreground/80">
				I prefer employment to a string of short contracts. I have been independent since 2000, and
				I am ready to stay with one team.
			</p>
		</div>
		<div class="flex flex-col justify-end gap-3 text-lg">
			<a class="w-fit border-b-4 border-highlight" href={`mailto:${person.email}`}>{person.email}</a
			>
			<a class="w-fit border-b-4 border-highlight" href={person.phoneHref}>{person.phone}</a>
			<a
				class="w-fit border-b-4 border-highlight"
				href={person.linkedin}
				target="_blank"
				rel="noreferrer">{person.linkedinLabel}</a
			>
			<p class="text-sm text-primary-foreground/75">{person.place}</p>
		</div>
	</section>
</div>

<IframeLightbox
	bind:open={tour}
	src="https://360.huba.sk"
	title="360° view of the Třebíč Jewish quarter"
/>
