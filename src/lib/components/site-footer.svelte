<script lang="ts">
	import Mark from './mark.svelte';
	import { person } from '#lib/profile';
</script>

<footer class="border-t">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10">
		<p class="sign text-5xl text-foreground sm:text-6xl notranslate">{person.name}</p>
		<div class="flex flex-wrap items-end justify-between gap-4 text-sm text-muted-foreground">
			<p class="flex items-center gap-2">
				<Mark clipSuffix="footer" class="mark--hero text-4xl" />
				<span>huba means mushroom, in Slovak.</span>
			</p>
			<p>
				<a class="border-b-4 border-highlight text-foreground" href={`mailto:${person.email}`}
					>{person.email}</a
				>
				<span class="px-2">·</span>
				<a class="border-b-4 border-highlight text-foreground" href={person.phoneHref}
					>{person.phone}</a
				>
			</p>
		</div>
	</div>
</footer>
