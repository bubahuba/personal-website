const IMG_SRC = /\ssrc="(\/[^"?#]+\.(?:jpg|jpeg|png|webp|gif|svg))"/gi;

function mimeFromPath(path: string): string {
	if (path.endsWith('.png')) return 'image/png';
	if (path.endsWith('.webp')) return 'image/webp';
	if (path.endsWith('.gif')) return 'image/gif';
	if (path.endsWith('.svg')) return 'image/svg+xml';
	return 'image/jpeg';
}

type FetchFn = (input: RequestInfo | URL) => Promise<Response>;

function isStylesheetLink(tag: string): boolean {
	return /\brel=["']stylesheet["']/i.test(tag);
}

function hrefFromLinkTag(tag: string): string | null {
	const match = tag.match(/\bhref=["']([^"']+)["']/i);
	return match?.[1] ?? null;
}

/** Resolve ./_app/… from prerendered /cv HTML to /_app/… for SvelteKit fetch during build. */
export function resolveCvAssetHref(href: string, pagePath = '/cv'): string {
	if (/^https?:\/\//i.test(href)) return href;
	if (href.startsWith('/')) return href;
	if (href.startsWith('./')) {
		const rel = href.slice(2);
		if (rel.startsWith('_app/')) return `/${rel}`;
		return new URL(href, `http://local${pagePath.endsWith('/') ? pagePath : `${pagePath}/`}`)
			.pathname;
	}
	return href.startsWith('_app/') ? `/${href}` : `/${href.replace(/^\//, '')}`;
}

const LINK_TAG = /<link\b[^>]*>/gi;

async function toDataUrl(path: string, fetchFn: FetchFn): Promise<string | null> {
	const res = await fetchFn(path);
	if (!res.ok) return null;
	const mime =
		res.headers.get('content-type')?.split(';')[0]?.trim() ?? mimeFromPath(path);
	const b64 = Buffer.from(await res.arrayBuffer()).toString('base64');
	return `data:${mime};base64,${b64}`;
}

/** Playwright cannot load assets from the prerender host; inline them for PDF rendering. */
export async function prepareCvHtmlForPdf(
	html: string,
	fetchFn: FetchFn,
	pagePath = '/cv'
): Promise<string> {
	let out = html;

	const imagePaths = new Set<string>();
	for (const match of html.matchAll(IMG_SRC)) {
		imagePaths.add(match[1]);
	}

	for (const path of imagePaths) {
		const dataUrl = await toDataUrl(path, fetchFn);
		if (!dataUrl) continue;
		out = out.replaceAll(`src="${path}"`, `src="${dataUrl}"`);
	}

	const stylesheetTags: { full: string; href: string }[] = [];
	for (const match of html.matchAll(LINK_TAG)) {
		const full = match[0];
		if (!isStylesheetLink(full)) continue;
		const href = hrefFromLinkTag(full);
		if (!href || href.startsWith('data:')) continue;
		stylesheetTags.push({ full, href });
	}

	for (const { full, href } of stylesheetTags) {
		if (/^https?:\/\//i.test(href)) continue;
		const resolved = resolveCvAssetHref(href, pagePath);
		const res = await fetchFn(resolved);
		if (!res.ok) continue;
		const css = await res.text();
		out = out.replace(full, `<style>${css}</style>`);
	}

	return forceCvPdfDocumentMode(out);
}

/** Keep prerendered markup; block client hydration from replacing CV content before print. */
export function forceCvPdfDocumentMode(html: string): string {
	let out = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
	out = out.replace(/<html\b([^>]*)>/i, (match, attrs) => {
		const cleaned = attrs
			.replace(/\sclass="[^"]*"/i, '')
			.replace(/\sstyle="[^"]*"/i, '');
		return `<html${cleaned} class="light" style="color-scheme: light">`;
	});
	return out;
}

/** PDF link annotations need absolute URLs (relative /work/… links are not clickable). */
export function absolutizeDocumentLinks(html: string, origin: string): string {
	const base = origin.replace(/\/$/, '');
	return html.replace(/\bhref="(\/[^"]*)"/g, (_, path: string) => `href="${base}${path}"`);
}
