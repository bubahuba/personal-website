import { join } from 'node:path';
import type { Plugin } from 'vite';
import { generateStaticWebp, STATIC_ROOT } from './scripts/generate-static-webp.ts';

export function staticWebp(): Plugin {
	return {
		name: 'static-webp',

		async buildStart() {
			const { wrote, skipped } = await generateStaticWebp();
			if (wrote > 0) {
				this.info(`generated ${wrote} webp under static/ (${skipped} unchanged)`);
			}
		},

		configureServer(server) {
			void generateStaticWebp().then(({ wrote }) => {
				if (wrote > 0) {
					server.config.logger.info(`static webp: generated ${wrote} file(s)`, {
						timestamp: true
					});
				}
			});

			server.watcher.add(join(STATIC_ROOT, 'portfolio'));
			server.watcher.add(join(STATIC_ROOT, 'img'));

			const regen = async (file: string) => {
				if (!/\.(jpe?g|png)$/i.test(file)) return;
				const { wrote } = await generateStaticWebp();
				if (wrote > 0) {
					server.ws.send({ type: 'full-reload', path: '*' });
				}
			};

			server.watcher.on('add', regen);
			server.watcher.on('change', regen);
		}
	};
}
