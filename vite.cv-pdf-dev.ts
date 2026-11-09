import type { Plugin } from 'vite';
import {
	CV_PDF_FILENAME,
	generateCvPdfFromLiveSite
} from './src/lib/server/cv-pdf-generate.ts';

/** Serves /cv/pdf in dev by rendering the live /cv page (production uses the post-build static file). */
export function cvPdfDev(): Plugin {
	return {
		name: 'cv-pdf-dev',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				const pathname = req.url?.split('?')[0];
				if (pathname !== '/cv/pdf') return next();

				try {
					const host = req.headers.host;
					if (!host) {
						res.statusCode = 500;
						res.end('Missing Host header');
						return;
					}
					const pdf = await generateCvPdfFromLiveSite(`http://${host}`);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/pdf');
					res.setHeader(
						'Content-Disposition',
						`attachment; filename="${CV_PDF_FILENAME}"`
					);
					res.setHeader('Cache-Control', 'no-store');
					res.end(pdf);
				} catch (error) {
					next(error);
				}
			});
		}
	};
}
