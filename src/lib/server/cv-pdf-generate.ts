import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../profile.ts';
import { absolutizeDocumentLinks, prepareCvHtmlForPdf } from './cv-pdf-html.ts';
import { renderCvPdf } from './cv-pdf.ts';

type FetchFn = (input: RequestInfo | URL) => Promise<Response>;

function contentType(path: string): string {
	if (path.endsWith('.css')) return 'text/css';
	if (path.endsWith('.png')) return 'image/png';
	if (path.endsWith('.webp')) return 'image/webp';
	if (path.endsWith('.gif')) return 'image/gif';
	if (path.endsWith('.svg')) return 'image/svg+xml';
	if (/\.jpe?g$/i.test(path)) return 'image/jpeg';
	return 'application/octet-stream';
}

export function createBuildDirFetch(buildDir: string): FetchFn {
	return async (input) => {
		const path = typeof input === 'string' ? input : input.toString();
		if (/^https?:\/\//i.test(path)) {
			return fetch(path);
		}
		const file = join(buildDir, path.replace(/^\//, ''));
		const body = readFileSync(file);
		return new Response(body, { headers: { 'content-type': contentType(path) } });
	};
}

export async function generateCvPdfBytes(html: string, fetchFn: FetchFn): Promise<Buffer> {
	const prepared = absolutizeDocumentLinks(
		await prepareCvHtmlForPdf(html, fetchFn),
		site.origin
	);
	return renderCvPdf(prepared);
}

export async function generateCvPdfFromBuildDir(buildDir = 'build'): Promise<Buffer> {
	const html = readFileSync(join(buildDir, 'cv.html'), 'utf8');
	return generateCvPdfBytes(html, createBuildDirFetch(buildDir));
}

export async function generateCvPdfFromLiveSite(baseUrl: string): Promise<Buffer> {
	const origin = baseUrl.replace(/\/$/, '');
	const cvResponse = await fetch(`${origin}/cv`);
	if (!cvResponse.ok) {
		throw new Error(`Failed to fetch /cv for PDF (${cvResponse.status})`);
	}
	const html = await cvResponse.text();
	const fetchFn: FetchFn = (input) => {
		const path = typeof input === 'string' ? input : input.toString();
		return fetch(new URL(path, `${origin}/`));
	};
	return generateCvPdfBytes(html, fetchFn);
}

export const CV_PDF_FILENAME = 'peter-huba-cv.pdf';
export const CV_PDF_OUT_PATH = join('build', 'cv', 'pdf');
