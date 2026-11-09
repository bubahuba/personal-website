const RASTER_RE = /\.(jpe?g|png)$/i;

/** Map authored static raster paths to webp generated under `static/` at build/dev start. */
export function mediaUrl(src: string): string {
	return RASTER_RE.test(src) ? src.replace(RASTER_RE, '.webp') : src;
}
