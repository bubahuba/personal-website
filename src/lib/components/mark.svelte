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
		clipSuffix = '0'
	}: { class?: string; clipSuffix?: string } = $props();

	const clipId = $derived(`mark-disc-${clipSuffix}`);
	const discCx = MARK_LAYOUT_SIZE / 2;
	const discCy = MARK_LAYOUT_SIZE / 2;
</script>

<svg
	class={cn('mark', className)}
	viewBox={MARK_VIEW_BOX}
	aria-hidden="true"
	role="img"
>
	<defs>
		<clipPath id={clipId}>
			<circle cx={discCx} cy={discCy} r={MARK_DISC_RADIUS} />
		</clipPath>
	</defs>
	<circle class="mark__disc" cx={discCx} cy={discCy} r={MARK_DISC_RADIUS} />
	<g clip-path={`url(#${clipId})`}>
		<g transform={MARK_ART_TRANSFORM}>
			<path class="mark__art-light" d={MARK_ART_LIGHT} />
			<path class="mark__art-dark" d={MARK_ART_DARK} />
		</g>
	</g>
</svg>
