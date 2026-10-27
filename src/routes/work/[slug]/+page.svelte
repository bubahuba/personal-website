<script lang="ts">
	import PhotoLightbox from '#lib/components/photo-lightbox.svelte';
	import { Badge } from '#lib/components/ui/badge';
	import { Button } from '#lib/components/ui/button';
	import { Separator } from '#lib/components/ui/separator';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const project = $derived(data.project);
	const shots = $derived([project.image, ...project.gallery]);
	let photo = $state<number | null>(null);
</script>

<svelte:head>
	<title>{project.title} — Peter Huba</title>
	<meta name="description" content={project.summary} />
</svelte:head>

<article class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10">
	<header class="flex max-w-3xl flex-col gap-4">
		<p class="text-xs tracking-wide text-muted-foreground uppercase">{project.eyebrow}</p>
		<h1 class="font-serif text-5xl tracking-tight text-balance notranslate">{project.title}</h1>
		<p class="text-lg leading-relaxed text-foreground/85">{project.summary}</p>
	</header>

	<figure class="flex flex-col gap-2">
		<button
			type="button"
			class="overflow-hidden rounded-xl border text-left"
			aria-label="View larger: {project.image.alt}"
			onclick={() => (photo = 0)}
		>
			<img src={project.image.src} alt="" class="w-full" />
		</button>
		<figcaption class="text-sm leading-relaxed text-muted-foreground">{project.image.alt}</figcaption>
	</figure>

	<div class="grid gap-10 md:grid-cols-[16rem_1fr]">
		<div class="flex flex-col gap-6 text-sm">
			<div class="flex flex-col gap-1">
				<p class="text-muted-foreground">Role</p>
				<p>{project.role}</p>
			</div>
			<div class="flex flex-col gap-1">
				<p class="text-muted-foreground">When</p>
				<p>{project.when}</p>
			</div>
			<div class="flex flex-col gap-1">
				<p class="text-muted-foreground">Context</p>
				<p>{project.context}</p>
			</div>
			{#if project.href}
				<Button href={project.href} target="_blank" rel="noreferrer">{project.hrefLabel}</Button>
			{/if}
		</div>

		<div class="flex flex-col gap-8">
			<section class="flex flex-col gap-3">
				<h2 class="font-serif text-3xl">What I did</h2>
				<ul class="flex list-disc flex-col gap-2 ps-5 leading-relaxed">
					{#each project.did as item (item)}
						<li>{item}</li>
					{/each}
				</ul>
			</section>

			{#if project.note}
				<p class="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed">{project.note}</p>
			{/if}

			<div class="flex flex-col gap-3">
				<h2 class="font-serif text-2xl">Technologies</h2>
				<div class="flex flex-wrap gap-1.5 notranslate">
					{#each project.stack as item (item)}
						<Badge variant="secondary" class="notranslate">{item}</Badge>
					{/each}
				</div>
			</div>
		</div>
	</div>

	{#if project.gallery.length}
		<Separator />
		<div class="grid gap-6 md:grid-cols-2">
			{#each project.gallery as shot, i (shot.src)}
				<figure class="flex flex-col gap-2">
					<button
						type="button"
						class="overflow-hidden rounded-xl border text-left cursor-pointer group"
						aria-label="View larger: {shot.alt}"
						onclick={() => (photo = i + 1)}
					>
						<img src={shot.src} alt="" class="max-h-[32rem] w-full bg-muted object-cover group-hover:scale-105 transition-transform duration-500 object-center" />
					</button>
					<figcaption class="text-sm leading-relaxed text-muted-foreground">{shot.alt}</figcaption>
				</figure>
			{/each}
		</div>
	{/if}

	<PhotoLightbox {shots} bind:index={photo} />
</article>
