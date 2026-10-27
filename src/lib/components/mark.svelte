<script lang="ts">
	import { cn } from '#lib/utils';
	import {
		MARK_ART_DARK,
		MARK_ART_LIGHT,
		MARK_ART_TRANSFORM,
		MARK_DISC_RADIUS,
		MARK_LAYOUT_SIZE,
		MARK_VIEW_BOX
	} from '#lib/mark-art';

	let {
		class: className = '',
		clipSuffix = '0',
		portrait = ''
	}: { class?: string; clipSuffix?: string; portrait?: string } = $props();

	const clipId = $derived(`mark-disc-${clipSuffix}`);
	const portraitClipId = $derived(`mark-disc-${clipSuffix}-portrait`);
	const discCx = MARK_LAYOUT_SIZE / 2;
	const discCy = MARK_LAYOUT_SIZE / 2;
	const flip = $derived(Boolean(portrait));
</script>

{#snippet mushroom(id: string)}
	<svg class={['mark', !flip && className]} viewBox={MARK_VIEW_BOX} aria-hidden="true" role="img">
		<defs>
			<clipPath {id}>
				<circle cx={discCx} cy={discCy} r={MARK_DISC_RADIUS} />
			</clipPath>
		</defs>
		<circle class="mark__disc" cx={discCx} cy={discCy} r={MARK_DISC_RADIUS} />
		<g clip-path={`url(#${id})`}>
			<g transform={MARK_ART_TRANSFORM}>
				<path class="mark__art-light" d={MARK_ART_LIGHT} />
				<path class="mark__art-dark" d={MARK_ART_DARK} />
			</g>
		</g>
	</svg>
{/snippet}

{#if flip}
	<span class={cn('mark mark-coin', className)}>
		<span class="mark-coin__inner">
			<span class="mark-coin__face mark-coin__face--front">
				{@render mushroom(clipId)}
			</span>
			<span class="mark-coin__face mark-coin__face--back">
				<svg class="mark" viewBox={MARK_VIEW_BOX} aria-hidden="true">
					<defs>
						<clipPath id={portraitClipId}>
							<circle cx={discCx} cy={discCy} r={MARK_DISC_RADIUS} />
						</clipPath>
					</defs>
					<circle class="mark__disc" cx={discCx} cy={discCy} r={MARK_DISC_RADIUS} />
					<image
						href={portrait}
						x={-60}
						y={-40}
						width={200}
						height={200}
						preserveAspectRatio="xMinYMid slice"
						clip-path={`url(#${portraitClipId})`}
					/>
				</svg>
			</span>
		</span>
	</span>
{:else}
	{@render mushroom(clipId)}
{/if}
