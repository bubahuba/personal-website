<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card';
	import type { Project } from '#lib/profile';

	let { project }: { project: Project } = $props();
</script>

<a href="/work/{project.slug}" class="group block h-full">
	<Card class="h-full pt-0!">
		<div class="aspect-[16/10] overflow-hidden">
			<img
				src={project.image.src}
				alt={project.image.alt}
				class="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105 {project.image.focus ===
				'center'
					? 'object-center'
					: 'object-top'}"
			/>
		</div>
		<CardHeader>
			<p class="text-xs tracking-wide text-muted-foreground uppercase">{project.eyebrow}</p>
			<CardTitle class="font-serif text-2xl notranslate">{project.title}</CardTitle>
			<CardDescription>{project.summary}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-1.5">
				{#each project.stack.slice(0, 4) as item (item)}
					<Badge variant="secondary" class="notranslate">{item}</Badge>
				{/each}
			</div>
		</CardContent>
	</Card>
</a>
