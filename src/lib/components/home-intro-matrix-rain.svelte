<script lang="ts">
	import { onMount, tick } from 'svelte';

	let {
		active = true,
		fade = 1
	}: {
		active?: boolean;
		/** 0–1, multiplied into layer opacity (e.g. intro scroll progress). */
		fade?: number;
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);

	const CHARSET_LETTERS = 'peterhubaPHUBAéíščžýáäôľťďňúůęąćłńóśźż';
	const CHARSET_DIGITS = '0123456789';
	const CHARSET_SYMBOLS = `!?@#$%&*+-=<>[]{}()/\\|:;,.^~_'"\`´°§±×÷≠≈∞∑√∫∂∆πΩµ¢€£¥•…–—·«»„‚`;

	type Column = {
		x: number;
		y: number;
		speed: number;
		length: number;
		glyphs: string[];
		/** Click/tap spawn — drawn on top without side-band clip. */
		userPlaced?: boolean;
	};

	type LayerDef = {
		id: string;
		fontScale: number;
		speedScale: number;
		density: number;
		headAlpha: number;
		trailAlphaBase: number;
		trailAlphaFalloff: number;
		flickerChance: number;
		skewX: number;
		depthScale: number;
		/** Perspective pivot X/Y as fraction of viewport. */
		originX: number;
		originY: number;
		/** Horizontal band where columns spawn (fractions of width). */
		regionStart: number;
		regionEnd: number;
		/** Optional side bands (e.g. left + right flanks); overrides single region for layout + clip. */
		regionBands?: [number, number][];
		trailMin: number;
		trailMax: number;
		/** Fixed column count; when set, density is ignored. */
		columnCount?: number;
		columnStepMul: number;
	};

	type RainLayer = LayerDef & {
		columns: Column[];
		fontSize: number;
		columnStep: number;
	};

	const LAYER_DEFS: LayerDef[] = [
		{
			id: 'back',
			fontScale: 0.7,
			speedScale: 0.5,
			density: 1.4,
			headAlpha: 0.2,
			trailAlphaBase: 0.05,
			trailAlphaFalloff: 0.14,
			flickerChance: 0.26,
			skewX: 0,
			depthScale: 1,
			originX: 0.5,
			originY: 0.5,
			regionStart: 0,
			regionEnd: 1,
			trailMin: 8,
			trailMax: 22,
			columnStepMul: 1.05
		},
		{
			id: 'mid',
			fontScale: 1,
			speedScale: 1,
			density: 0.75,
			headAlpha: 0.36,
			trailAlphaBase: 0.08,
			trailAlphaFalloff: 0.2,
			flickerChance: 0.34,
			skewX: -0.035,
			depthScale: 1.04,
			originX: 0.5,
			originY: 0.72,
			regionStart: 0,
			regionEnd: 1,
			trailMin: 8,
			trailMax: 22,
			columnStepMul: 1.05
		},
		{
			id: 'front',
			fontScale: 2.55,
			speedScale: 1.45,
			density: 1.05,
			headAlpha: 0.58,
			trailAlphaBase: 0.1,
			trailAlphaFalloff: 0.26,
			flickerChance: 0.42,
			skewX: -0.035,
			depthScale: 1.1,
			originX: 0.5,
			originY: 0.92,
			regionStart: 0,
			regionEnd: 1,
			regionBands: [[0, 0.42], [0.58, 1]],
			trailMin: 5,
			trailMax: 12,
			columnStepMul: 1.12
		},
		{
			id: 'closest',
			fontScale: 3.85,
			speedScale: 1.75,
			density: 1,
			headAlpha: 0.72,
			trailAlphaBase: 0.14,
			trailAlphaFalloff: 0.3,
			flickerChance: 0.48,
			skewX: -0.08,
			depthScale: 1.16,
			originX: 0.14,
			originY: 1,
			regionStart: 0,
			regionEnd: 0.28,
			trailMin: 3,
			trailMax: 6,
			columnCount: 4,
			columnStepMul: 1.05
		},
		{
			id: 'giant',
			fontScale: 6.4,
			speedScale: 2.05,
			density: 1,
			headAlpha: 0.84,
			trailAlphaBase: 0.18,
			trailAlphaFalloff: 0.34,
			flickerChance: 0.52,
			skewX: -0.13,
			depthScale: 1.26,
			originX: 0.5,
			originY: 1,
			regionStart: 0,
			regionEnd: 1,
			regionBands: [[0, 0.36], [0.64, 1]],
			trailMin: 2,
			trailMax: 4,
			columnCount: 3,
			columnStepMul: 1
		}
	];

	let layers: RainLayer[] = [];
	let width = 0;
	let height = 0;
	let raf = 0;
	let running = false;
	let reduceMotion = false;
	let mounted = false;
	let cameraReady = false;

	/** Smoothed camera offset in px (shifts column field / perspective). */
	let camX = 0;
	let camY = 0;
	let targetCamX = 0;
	let targetCamY = 0;
	let dragPointerId: number | null = null;
	let lastPointerX = 0;
	let lastPointerY = 0;
	let pointerDownX = 0;
	let pointerDownY = 0;
	/** Pause rain fall + glyph flicker while pointer is down on the canvas. */
	let dragAnimPaused = false;
	const TAP_SPAWN_PX = 10;

	const USER_COLUMN_CAP = 64;

	const PARALLAX: Record<string, number> = {
		back: 0.2,
		mid: 0.46,
		front: 0.88,
		closest: 1.18,
		giant: 1.52
	};

	function pickChar(): string {
		const roll = Math.random();
		const pool =
			roll < 0.34
				? CHARSET_DIGITS
				: roll < 0.68
					? CHARSET_SYMBOLS
					: CHARSET_LETTERS;
		return pool[Math.floor(Math.random() * pool.length)] ?? '0';
	}

	/** Inverse pan + perspective: screen click → layer coords for column head. */
	function layerPointFromScreen(
		screenX: number,
		screenY: number,
		layer: RainLayer,
		w: number,
		h: number
	): { x: number; y: number } {
		const parallax = PARALLAX[layer.id] ?? 0.5;
		const panX = camX * parallax;
		const panY = camY * parallax;
		const ox = w * layer.originX;
		const oy = h * layer.originY;
		const s = layer.depthScale;
		const k = layer.skewX;

		const ly = oy + (screenY - panY - oy) / s;
		const lx = ox + (screenX - panX - ox - k * (ly - oy)) / s;
		return { x: lx, y: ly };
	}

	function spawnUserColumn(screenX: number, screenY: number, w = width, h = height) {
		const layer = layers.find((l) => l.id === 'giant');
		if (!layer || w < 1 || h < 1) return;

		const { x, y } = layerPointFromScreen(screenX, screenY, layer, w, h);
		const length = Math.min(4, randomTrailLength(layer));
		layer.columns.push({
			x,
			y,
			speed: (0.55 + Math.random() * 0.7) * layer.speedScale,
			length,
			glyphs: freshGlyphs(length),
			userPlaced: true
		});

		while (layer.columns.filter((c) => c.userPlaced).length > USER_COLUMN_CAP) {
			const idx = layer.columns.findIndex((c) => c.userPlaced);
			if (idx < 0) break;
			layer.columns.splice(idx, 1);
		}
	}

	function freshGlyphs(length: number): string[] {
		return Array.from({ length }, () => pickChar());
	}

	function randomTrailLength(def: LayerDef): number {
		return def.trailMin + Math.floor(Math.random() * (def.trailMax - def.trailMin + 1));
	}

	function tickGlyphs(col: Column, flickerChance: number) {
		const n = col.glyphs.length;
		if (n === 0) return;
		if (Math.random() > flickerChance) return;

		const changes = Math.random() < 0.22 ? 2 : 1;
		for (let c = 0; c < changes; c++) {
			const idx = Math.random() < 0.4 ? 0 : Math.floor(Math.random() * n);
			col.glyphs[idx] = pickChar();
		}
	}

	function baseFontForWidth(w: number): number {
		return w < 380 ? 14 : w < 640 ? 16 : w < 1024 ? 18 : 20;
	}

	function randomColumnX(layer: RainLayer, w: number): number {
		const bands = layer.regionBands ?? [[layer.regionStart, layer.regionEnd]];
		const band = bands[Math.floor(Math.random() * bands.length)] ?? bands[0];
		const [start, end] = band;
		const regionStart = start * w;
		const regionEnd = end * w;
		const regionW = Math.max(layer.columnStep, regionEnd - regionStart);
		const tightBand = layer.id === 'closest' || layer.id === 'giant';
		const bandInset = regionW < w * 0.95 ? regionW * (tightBand ? 0.05 : 0.08) : 0;
		const innerStart = regionStart + bandInset;
		const innerW = Math.max(layer.columnStep, regionW - bandInset * 2);
		const jitter =
			(Math.random() - 0.5) *
			layer.columnStep *
			(layer.id === 'giant' ? 0.08 : layer.id === 'closest' ? 0.12 : 0.22);
		return innerStart + Math.random() * innerW + jitter;
	}

	function columnCountForLayer(w: number, def: LayerDef, regionW: number, columnStep: number): number {
		if (def.columnCount != null) {
			if (w < 380) return Math.max(2, def.columnCount - 2);
			if (w < 640) return Math.max(3, def.columnCount - 1);
			return def.columnCount;
		}
		const partial = regionW < w * 0.95;
		const min = partial ? 3 : 6;
		return Math.max(min, Math.ceil((regionW / columnStep) * def.density) + 1);
	}

	function columnsForBand(
		w: number,
		h: number,
		def: LayerDef,
		fontSize: number,
		columnStep: number,
		bandStart: number,
		bandEnd: number
	): Column[] {
		const regionStart = bandStart * w;
		const regionEnd = bandEnd * w;
		const regionW = Math.max(columnStep, regionEnd - regionStart);
		const count = columnCountForLayer(w, def, regionW, columnStep);
		const tightBand = def.id === 'closest' || def.id === 'giant';
		const bandInset = regionW < w * 0.95 ? regionW * (tightBand ? 0.05 : 0.08) : 0;
		const innerStart = regionStart + bandInset;
		const innerW = Math.max(columnStep, regionW - bandInset * 2);

		return Array.from({ length: count }, (_, i) => {
			const length = randomTrailLength(def);
			const spawn = spawnColumn(h, length, def.speedScale);
			const slot = count <= 1 ? 0.5 : i / (count - 1);
			const jitter =
				(Math.random() - 0.5) *
				columnStep *
				(def.id === 'giant' ? 0.08 : def.id === 'closest' ? 0.12 : 0.22);
			const x = innerStart + slot * innerW + jitter;
			return { x, ...spawn };
		});
	}

	function spawnColumn(h: number, length: number, speedScale: number): Omit<Column, 'x'> {
		return {
			y: Math.random() * h,
			speed: (0.35 + Math.random() * 0.85) * speedScale,
			length,
			glyphs: freshGlyphs(length)
		};
	}

	function layoutLayer(w: number, h: number, def: LayerDef): RainLayer {
		const fontSize = Math.round(baseFontForWidth(w) * def.fontScale);
		const columnStep = Math.round(fontSize * def.columnStepMul);
		const bands = def.regionBands ?? [[def.regionStart, def.regionEnd]];
		const columns = bands.flatMap(([start, end]) =>
			columnsForBand(w, h, def, fontSize, columnStep, start, end)
		);

		return { ...def, columns, fontSize, columnStep };
	}

	function layoutAll(w: number, h: number) {
		layers = LAYER_DEFS.map((def) => layoutLayer(w, h, def));
		if (!cameraReady && w > 0) {
			targetCamX = -w * 0.24;
			camX = targetCamX;
			cameraReady = true;
		}
	}

	function clampCamera(w: number, h: number) {
		const maxX = w * 0.48;
		const maxY = h * 0.2;
		targetCamX = Math.max(-maxX, Math.min(maxX, targetCamX));
		targetCamY = Math.max(-maxY, Math.min(maxY, targetCamY));
	}

	function tickCamera(w: number, h: number) {
		camX += (targetCamX - camX) * 0.14;
		camY += (targetCamY - camY) * 0.14;
		clampCamera(w, h);
	}

	function bindCameraInput(surface: HTMLElement) {
		const rectOf = () => surface.getBoundingClientRect();

		const endDrag = () => {
			dragPointerId = null;
			dragAnimPaused = false;
		};

		const onPointerDown = (e: PointerEvent) => {
			if (!active) return;
			dragPointerId = e.pointerId;
			dragAnimPaused = true;
			pointerDownX = e.clientX;
			pointerDownY = e.clientY;
			lastPointerX = e.clientX;
			lastPointerY = e.clientY;
			surface.setPointerCapture(e.pointerId);
		};

		const aimFromClient = (clientX: number, clientY: number) => {
			const rect = rectOf();
			const w = rect.width || 1;
			const h = rect.height || 1;
			const nx = (clientX - rect.left) / w - 0.5;
			const ny = (clientY - rect.top) / h - 0.5;
			targetCamX = nx * w * 0.42;
			targetCamY = ny * h * 0.14;
			clampCamera(w, h);
		};

		const onPointerMove = (e: PointerEvent) => {
			if (!active) return;
			const rect = rectOf();
			const w = rect.width || 1;
			const h = rect.height || 1;

			if (e.pointerType === 'touch' || e.pointerType === 'pen') {
				if (dragPointerId !== e.pointerId) return;
				targetCamX += (e.clientX - lastPointerX) * 1.35;
				targetCamY += (e.clientY - lastPointerY) * 0.55;
				lastPointerX = e.clientX;
				lastPointerY = e.clientY;
				clampCamera(w, h);
				return;
			}

			if (dragPointerId === e.pointerId) {
				targetCamX += (e.clientX - lastPointerX) * 1.35;
				targetCamY += (e.clientY - lastPointerY) * 0.55;
				lastPointerX = e.clientX;
				lastPointerY = e.clientY;
				clampCamera(w, h);
				return;
			}

			aimFromClient(e.clientX, e.clientY);
		};

		const onWindowPointerMove = (e: PointerEvent) => {
			if (!active || e.pointerType !== 'mouse') return;
			aimFromClient(e.clientX, e.clientY);
		};

		const onPointerUp = (e: PointerEvent) => {
			if (dragPointerId !== e.pointerId) return;

			const moved = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
			if (moved < TAP_SPAWN_PX && e.currentTarget === surface) {
				const rect = rectOf();
				const w = width > 0 ? width : rect.width;
				const h = height > 0 ? height : rect.height;
				const scaleX = rect.width > 0 ? w / rect.width : 1;
				const scaleY = rect.height > 0 ? h / rect.height : 1;
				spawnUserColumn(e.offsetX * scaleX, e.offsetY * scaleY, w, h);
			}

			endDrag();
			try {
				surface.releasePointerCapture(e.pointerId);
			} catch {
				/* already released */
			}
		};

		surface.addEventListener('pointerdown', onPointerDown);
		surface.addEventListener('pointermove', onPointerMove);
		surface.addEventListener('pointerup', onPointerUp);
		surface.addEventListener('pointercancel', onPointerUp);
		window.addEventListener('pointermove', onWindowPointerMove);

		return () => {
			surface.removeEventListener('pointerdown', onPointerDown);
			surface.removeEventListener('pointermove', onPointerMove);
			surface.removeEventListener('pointerup', onPointerUp);
			surface.removeEventListener('pointercancel', onPointerUp);
			window.removeEventListener('pointermove', onWindowPointerMove);
		};
	}

	function readThemeColors(el: HTMLElement) {
		const style = getComputedStyle(el);
		const trail = style.getPropertyValue('--muted-foreground').trim() || 'oklch(0.48 0.02 70)';
		const head = style.getPropertyValue('--chart-1').trim() || 'oklch(0.62 0.11 230)';
		return { trail, head };
	}

	function vignetteStops(): [string, string] {
		const dark = document.documentElement.classList.contains('dark');
		return dark
			? ['rgba(18, 16, 14, 0)', 'rgba(18, 16, 14, 0.55)']
			: ['rgba(250, 247, 240, 0)', 'rgba(250, 247, 240, 0.62)'];
	}

	function fitCanvas(el: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		const parent = el.parentElement;
		if (!parent) return { w: 0, h: 0 };

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = Math.max(1, parent.clientWidth);
		const h = Math.max(1, parent.clientHeight);

		el.width = Math.floor(w * dpr);
		el.height = Math.floor(h * dpr);
		el.style.width = `${w}px`;
		el.style.height = `${h}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		if (w !== width || h !== height) {
			width = w;
			height = h;
			layoutAll(w, h);
		}

		return { w, h };
	}

	function isNearLayer(id: string): boolean {
		return id === 'front' || id === 'closest' || id === 'giant';
	}

	function depthBoostCap(id: string): number {
		if (id === 'giant') return 1.7;
		if (id === 'closest') return 1.5;
		return 1.35;
	}

	function advanceColumns(layer: RainLayer, w: number, h: number) {
		for (const col of layer.columns) {
			col.y += col.speed * (layer.fontSize * 0.08);
			if (col.y > h + col.length * layer.fontSize) {
				if (!col.userPlaced) {
					col.x = randomColumnX(layer, w);
					col.y = -col.length * layer.fontSize * Math.random();
					col.speed = (0.35 + Math.random() * 0.85) * layer.speedScale;
					col.length = randomTrailLength(layer);
					col.glyphs = freshGlyphs(col.length);
				}
			}
			tickGlyphs(col, layer.flickerChance);
		}
		layer.columns = layer.columns.filter(
			(col) => !col.userPlaced || col.y <= h + col.length * layer.fontSize
		);
	}

	function paintColumns(
		ctx: CanvasRenderingContext2D,
		layer: RainLayer,
		cols: Column[],
		w: number,
		h: number,
		opacity: number,
		trail: string,
		head: string
	) {
		for (const col of cols) {
			for (let i = 0; i < col.length; i++) {
				const y = col.y - i * layer.fontSize;
				if (y < -layer.fontSize || y > h + layer.fontSize) continue;

				const t = i / col.length;
				const isHead = i === 0;
				const depthBoost =
					isNearLayer(layer.id) && y > h * 0.5 ? 1 + (y - h * 0.5) / h * 0.45 : 1;
				const alpha =
					(isHead ? layer.headAlpha : layer.trailAlphaBase + (1 - t) * layer.trailAlphaFalloff) *
					opacity *
					Math.min(depthBoost, depthBoostCap(layer.id));

				ctx.fillStyle = isHead ? head : trail;
				ctx.globalAlpha = alpha;
				ctx.fillText(col.glyphs[i] ?? pickChar(), col.x, y);
			}
		}
	}

	function applyLayerTransform(
		ctx: CanvasRenderingContext2D,
		layer: RainLayer,
		w: number,
		h: number,
		layerPanX: number,
		layerPanY: number
	) {
		const originX = w * layer.originX;
		const originY = h * layer.originY;
		ctx.translate(layerPanX, layerPanY);
		ctx.translate(originX, originY);
		ctx.transform(layer.depthScale, 0, layer.skewX, layer.depthScale, 0, 0);
		ctx.translate(-originX, -originY);
		ctx.font = `${layer.fontSize}px Huba, cursive`;
		ctx.textBaseline = 'top';
	}

	function drawLayer(
		ctx: CanvasRenderingContext2D,
		layer: RainLayer,
		w: number,
		h: number,
		opacity: number,
		trail: string,
		head: string
	) {
		const parallax = PARALLAX[layer.id] ?? 0.5;
		const layerPanX = camX * parallax;
		const layerPanY = camY * parallax;
		const clipBands = layer.regionBands ?? (layer.regionEnd < 1 ? [[layer.regionStart, layer.regionEnd]] : null);

		const regular = layer.columns.filter((c) => !c.userPlaced);
		const userCols = layer.columns.filter((c) => c.userPlaced);

		if (!dragAnimPaused) {
			advanceColumns(layer, w, h);
		}

		ctx.save();
		applyLayerTransform(ctx, layer, w, h, layerPanX, layerPanY);
		if (clipBands && regular.length > 0) {
			ctx.save();
			ctx.beginPath();
			for (const [start, end] of clipBands) {
				ctx.rect(start * w, 0, (end - start) * w, h);
			}
			ctx.clip();
			paintColumns(ctx, layer, regular, w, h, opacity, trail, head);
			ctx.restore();
		} else {
			paintColumns(ctx, layer, regular, w, h, opacity, trail, head);
		}
		paintColumns(ctx, layer, userCols, w, h, opacity, trail, head);
		ctx.restore();
	}

	function frame() {
		raf = 0;
		if (!canvas || !running || !active || reduceMotion) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { w, h } = fitCanvas(canvas, ctx);
		if (w < 1 || h < 1) {
			schedule();
			return;
		}

		const opacity = Math.max(0, Math.min(1, fade));
		if (opacity <= 0.01) {
			ctx.clearRect(0, 0, w, h);
			schedule();
			return;
		}

		const { trail, head } = readThemeColors(canvas);
		ctx.clearRect(0, 0, w, h);
		tickCamera(w, h);

		for (const layer of layers) {
			drawLayer(ctx, layer, w, h, opacity, trail, head);
		}

		ctx.globalAlpha = 1;

		const [inner, outer] = vignetteStops();
		const vignette = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.1, w * 0.5, h * 0.48, w * 0.78);
		vignette.addColorStop(0, inner);
		vignette.addColorStop(0.5, inner);
		vignette.addColorStop(1, outer);
		ctx.fillStyle = vignette;
		ctx.fillRect(0, 0, w, h);

		schedule();
	}

	function schedule() {
		if (!running) return;
		raf = requestAnimationFrame(frame);
	}

	function start() {
		if (running || reduceMotion || !canvas) return;
		running = true;
		schedule();
	}

	function stop() {
		running = false;
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
	}

	onMount(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		mounted = true;

		if (reduceMotion) return;

		let unbindCamera = () => {};
		let ro: ResizeObserver | null = null;

		void tick().then(() => {
			if (!canvas) return;

			unbindCamera = bindCameraInput(canvas);

			const parent = canvas.parentElement;
			ro = new ResizeObserver(() => {
				if (!canvas) return;
				const ctx = canvas.getContext('2d');
				if (ctx) fitCanvas(canvas, ctx);
			});
			if (parent) ro.observe(parent);

			const maxScale = Math.max(...LAYER_DEFS.map((d) => d.fontScale));
			const maxFont = Math.round(baseFontForWidth(window.innerWidth) * maxScale);
			void document.fonts.load(`${maxFont}px Huba`).catch(() => undefined).then(() => {
				if (active && fade > 0.01) start();
			});
		});

		return () => {
			unbindCamera();
			stop();
			ro?.disconnect();
		};
	});

	$effect(() => {
		if (!mounted || reduceMotion || !canvas) return;
		if (active && fade > 0.01) start();
		else stop();
	});
</script>

<canvas bind:this={canvas} class="home-intro-rain" aria-hidden="true"></canvas>
