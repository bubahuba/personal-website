/**
 * Page copy is English. Labels match PartnerCheck’s language menu.
 * Locales are BCP 47; tags are what Chrome’s Translator API accepts.
 * PartnerCheck uses `cz` and `ua` in its paths; the translator wants `cs` and `uk`.
 */
export const sourceLanguage = {
	label: 'EN',
	locale: 'en-US',
	tag: 'en'
} as const;

export const languages = [
	sourceLanguage,
	{ label: 'CZ', locale: 'cs-CZ', tag: 'cs' },
	{ label: 'SK', locale: 'sk-SK', tag: 'sk' },
	{ label: 'PL', locale: 'pl-PL', tag: 'pl' },
	{ label: 'HU', locale: 'hu-HU', tag: 'hu' },
	{ label: 'FR', locale: 'fr-FR', tag: 'fr' },
	{ label: 'IT', locale: 'it-IT', tag: 'it' },
	{ label: 'ES', locale: 'es-ES', tag: 'es' },
	{ label: 'JA', locale: 'ja-JP', tag: 'ja' },
	{ label: 'ZH', locale: 'zh-CN', tag: 'zh' },
	{ label: 'HI', locale: 'hi-IN', tag: 'hi' },
	{ label: 'NL', locale: 'nl-NL', tag: 'nl' },
	{ label: 'DE', locale: 'de-DE', tag: 'de' },
	{ label: 'PT', locale: 'pt-PT', tag: 'pt' },
	{ label: 'UA', locale: 'uk-UA', tag: 'uk' },
	{ label: 'AR', locale: 'ar', tag: 'ar' },
	{ label: 'HE', locale: 'he-IL', tag: 'he' }
] as const;

export type Language = (typeof languages)[number];

const rtlTags = new Set<string>(['ar', 'he']);

export function languageDirection(language: Language): 'ltr' | 'rtl' {
	return rtlTags.has(language.tag) ? 'rtl' : 'ltr';
}

/** Sync `<html lang>` and `dir` with the active page language. */
export function applyDocumentLanguage(language: Language) {
	if (typeof document === 'undefined') return;
	document.documentElement.lang = language.locale;
	document.documentElement.dir = languageDirection(language);
}

export function languageFromLocale(value: string | null | undefined): Language {
	if (!value) return sourceLanguage;
	const needle = value.toLowerCase();
	return languages.find((language) => language.locale.toLowerCase() === needle) ?? sourceLanguage;
}
