<script lang="ts">
	import { mediaUrl } from '#lib/media-url';
	import {
		earlier,
		education,
		languages,
		person,
		projects,
		roles,
		site,
		skillGroups,
		teaching,
		tracks
	} from '#lib/profile';

	const allProjects = projects;
	const skillGroupsCore = skillGroups.filter((group) => group.title !== 'With AI');
	const withAiSkills = skillGroups.find((group) => group.title === 'With AI');
</script>

<svelte:head>
	<title>CV — {person.name}</title>
	<meta name="description" content="Print-friendly CV for {person.name}. {site.description}" />
	<meta name="robots" content="noindex" />
</svelte:head>

<article class="cv-doc">
	<header class="cv-avoid-break flex flex-col gap-2">
		<p class="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
			Available for senior roles · Remote · Třebíč
		</p>
		<h1 class="notranslate">{person.name}</h1>
		<p class="cv-doc__lead">
			Design-trained full-stack developer. AI-assisted, still accountable for the work.
		</p>
		<p class="text-foreground/80">
			On the web since 1997, shipping client work since 2000. Art school in Bratislava and
			Amsterdam, years teaching designers how a layout becomes software, now building product
			interfaces and the systems behind them.
		</p>
		<div class="cv-doc__meta notranslate">
			<a class="cv-link" href={`mailto:${person.email}`}>{person.email}</a>
			<a class="cv-link" href={person.phoneHref}>{person.phone}</a>
			<a class="cv-link" href={person.linkedin} target="_blank" rel="noreferrer"
				>{person.linkedinLabel}</a
			>
			<a class="cv-link" href={site.origin} target="_blank" rel="noreferrer">huba.sk</a>
			<span>{person.place}</span>
		</div>
	</header>

	<section class="cv-doc__section cv-work-section" aria-labelledby="cv-work">
		<h2 id="cv-work">Selected work &amp; range</h2>
		<div>
			{#each allProjects as project (project.slug)}
				<article class="cv-project">
					<a href="/work/{project.slug}" class="cv-project__thumb-link shrink-0">
						<img
							class="cv-project__thumb"
							src={mediaUrl(project.image.src)}
							alt=""
							loading="lazy"
							decoding="async"
						/>
					</a>
					<div>
						<h3 class="notranslate">
							<a class="cv-link" href="/work/{project.slug}">{project.title}</a>
						</h3>
						<p class="cv-project__eyebrow">{project.eyebrow}</p>
						<p class="cv-project__summary">{project.summary}</p>
						{#if project.href || (project.extraLinks?.length ?? 0) > 0}
							<p class="cv-project__links">
								{#if project.href}
									<a
										class="cv-link"
										href={project.href}
										target="_blank"
										rel="noreferrer"
									>
										{project.hrefLabel ?? 'Live site'}
									</a>
								{/if}
								{#each project.extraLinks ?? [] as link, i (link.href)}
									<span class="text-muted-foreground"> · </span>
									<a class="cv-link" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
								{/each}
								<span class="text-muted-foreground"> · </span>
								<a class="cv-link" href="/work/{project.slug}">Case study</a>
							</p>
						{:else}
							<p class="cv-project__links">
								<a class="cv-link" href="/work/{project.slug}">Case study</a>
							</p>
						{/if}
						{#if project.demoCredentials}
							<p class="cv-project__credentials notranslate">
								login: {project.demoCredentials.user} · pass: {project.demoCredentials.password}
							</p>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section class="cv-doc__section cv-practice-section" aria-labelledby="cv-practice">
		<h2 id="cv-practice">How I fit a senior role</h2>
		<div class="cv-doc__grid-3">
			{#each tracks as track (track.id)}
				<div class="cv-track">
					<h3 class="notranslate">{track.title}</h3>
					<p class="mt-1 text-foreground/80">{track.text}</p>
				</div>
			{/each}
		</div>
		<div class="cv-doc__grid-2 mt-1">
			{#each skillGroupsCore as group (group.title)}
				<div>
					<h3>{group.title}</h3>
					<div class="cv-badges mt-1">
						{#each group.items as item (item)}
							<span class="cv-badge notranslate">{item}</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	{#if withAiSkills}
		<div class="cv-with-ai-block cv-doc__section">
			<h3>{withAiSkills.title}</h3>
			<div class="cv-badges mt-1">
				{#each withAiSkills.items as item (item)}
					<span class="cv-badge notranslate">{item}</span>
				{/each}
			</div>
		</div>
	{/if}

	<section class="cv-doc__section cv-experience-section" aria-labelledby="cv-experience">
		<h2 id="cv-experience">Experience</h2>
		{#each roles as role (role.org)}
			<div class="cv-role">
				<p class="cv-role__when">{role.when}</p>
				<div>
					<h3 class="notranslate">{role.org}</h3>
					<p class="text-[0.7rem]">
						{role.title}
						<span class="text-muted-foreground">· {role.place}</span>
					</p>
					<p class="mt-0.5 text-foreground/80">{role.text}</p>
				</div>
			</div>
		{/each}

		<div class="cv-doc__grid-2 mt-2">
			<div>
				<h3>Teaching</h3>
				<p class="mt-1 text-foreground/80">
					From 2002 to 2018, web and multimedia at art and design schools — bridging what a
					designer draws and what an engineer can ship.
				</p>
				<ul class="mt-2 flex flex-col gap-1.5 ps-0 list-none">
					{#each teaching as post (post.org)}
						<li>
							<p class="font-medium">{post.org}</p>
							<p class="text-[0.7rem] text-muted-foreground">{post.when} · {post.text}</p>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h3>Education</h3>
				<ul class="mt-1 flex flex-col gap-1.5 ps-0 list-none">
					{#each education as school (school.school)}
						<li>
							<p class="font-medium">{school.school}</p>
							<p class="text-[0.7rem] text-muted-foreground">
								{school.when} · {school.detail}
							</p>
						</li>
					{/each}
				</ul>
				<h3 class="mt-3">Languages</h3>
				<ul class="mt-1 flex flex-col gap-0.5 ps-0 list-none text-[0.75rem]">
					{#each languages as [language, level] (language)}
						<li class="flex justify-between gap-3 border-b border-foreground/10 py-0.5">
							<span>{language}</span>
							<span class="text-muted-foreground">{level}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="mt-2">
			<h3>Earlier websites</h3>
			<p class="mt-1 text-foreground/80">
				ExpressionEngine from 2008. A sample of sites from that period that are still online.
			</p>
			<ul class="mt-1 columns-1 gap-x-6 ps-4 text-[0.72rem] sm:columns-2">
				{#each earlier as item (item.href)}
					<li>
						<a
							class="cv-link font-medium notranslate"
							href={item.href}
							target="_blank"
							rel="noreferrer">{item.label}</a
						>
						<span class="text-muted-foreground"> — {item.note}</span>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="cv-contact cv-avoid-break" aria-labelledby="cv-contact">
		<h2 id="cv-contact" class="text-base">What I am looking for</h2>
		<ul class="mt-2 flex list-disc flex-col gap-1">
			<li>A long-term, full-time seat — design, full-stack, or AI-assisted product engineering.</li>
			<li>Remote, with a daily standup. I live in Třebíč.</li>
			<li>Colleagues who will argue about the work.</li>
		</ul>
		<p class="mt-2 text-[0.75rem] opacity-90">
			I prefer employment to a string of short contracts. Independent since 2000; ready to stay with
			one team.
		</p>
		<div class="cv-doc__meta mt-3 notranslate">
			<a class="cv-link" href={`mailto:${person.email}`}>{person.email}</a>
			<a class="cv-link" href={person.phoneHref}>{person.phone}</a>
			<a class="cv-link" href={person.linkedin} target="_blank" rel="noreferrer"
				>{person.linkedinLabel}</a
			>
		</div>
	</section>
</article>
