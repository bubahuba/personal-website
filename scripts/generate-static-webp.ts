import { readdir, stat, unlink } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
export const STATIC_ROOT = join(ROOT, 'static');

const CONVERT_DIRS = ['portfolio', 'img'] as const;
const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png']);
const WEBP_QUALITY = 82;

async function walkFiles(dir: string): Promise<string[]> {
	const out: string[] = [];
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await walkFiles(path)));
		} else if (entry.isFile()) {
			out.push(path);
		}
	}
	return out;
}

async function convertToWebp(source: string, force: boolean): Promise<'wrote' | 'skipped'> {
	const ext = extname(source).toLowerCase();
	if (!RASTER_EXT.has(ext)) return 'skipped';

	const target = source.replace(/\.(jpe?g|png)$/i, '.webp');
	const srcStat = await stat(source);

	if (!force) {
		try {
			const outStat = await stat(target);
			if (outStat.mtimeMs >= srcStat.mtimeMs) return 'skipped';
		} catch {
			/* no webp yet */
		}
	}

	await sharp(source).webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(target);
	return 'wrote';
}

export async function generateStaticWebp(options?: { force?: boolean }) {
	const force = options?.force ?? false;
	let wrote = 0;
	let skipped = 0;

	for (const dir of CONVERT_DIRS) {
		const base = join(STATIC_ROOT, dir);
		const files = await walkFiles(base);
		for (const file of files) {
			const result = await convertToWebp(file, force);
			if (result === 'wrote') wrote += 1;
			else if (RASTER_EXT.has(extname(file).toLowerCase())) skipped += 1;
		}
	}

	return { wrote, skipped };
}

export async function pruneStaticRasters(root: string) {
	let removed = 0;
	for (const dir of CONVERT_DIRS) {
		const base = join(root, dir);
		const files = await walkFiles(base);
		for (const file of files) {
			const ext = extname(file).toLowerCase();
			if (!RASTER_EXT.has(ext)) continue;
			const webp = file.replace(/\.(jpe?g|png)$/i, '.webp');
			try {
				await stat(webp);
				await unlink(file);
				removed += 1;
			} catch {
				/* keep raster if no webp */
			}
		}
	}
	return removed;
}

const isCli =
	process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
	const force = process.argv.includes('--force');
	const pruneDir = process.argv.find((a) => a.startsWith('--prune='))?.slice(8);

	if (pruneDir) {
		const removed = await pruneStaticRasters(join(ROOT, pruneDir));
		console.log(`pruned ${removed} raster file(s) from ${pruneDir}`);
	} else {
		const { wrote, skipped } = await generateStaticWebp({ force });
		console.log(`static webp: wrote ${wrote}, up to date ${skipped}`);
	}
}
