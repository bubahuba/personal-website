import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
	CV_PDF_OUT_PATH,
	generateCvPdfFromBuildDir
} from '../src/lib/server/cv-pdf-generate.ts';

const pdf = await generateCvPdfFromBuildDir('build');
mkdirSync(dirname(CV_PDF_OUT_PATH), { recursive: true });
writeFileSync(CV_PDF_OUT_PATH, pdf);
console.log(`Wrote ${CV_PDF_OUT_PATH} (${pdf.length} bytes)`);
