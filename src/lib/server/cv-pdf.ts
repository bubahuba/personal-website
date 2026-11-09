import { chromium, type Page } from 'playwright';

async function setPageHtml(page: Page, html: string) {
	await page.setContent(html, { waitUntil: 'networkidle' });
}

export async function renderCvPdf(html: string): Promise<Buffer> {
	const browser = await chromium.launch({ headless: true });
	try {
		const page = await browser.newPage();
		await setPageHtml(page, html);
		await page.emulateMedia({ media: 'print' });
		const pdf = await page.pdf({
			format: 'A4',
			printBackground: false,
			preferCSSPageSize: true,
			margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
		});
		return Buffer.from(pdf);
	} finally {
		await browser.close();
	}
}
