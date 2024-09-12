export const locale = import.meta.env.SITE_LANG || 'en';

/**
 * about dynamic import, refer to:
 * https://github.com/withastro/astro/issues/3373#issuecomment-1132309775
 */
const langs = import.meta.glob('./*.json'); // import all json files in the current directory
export const localeData = <{ [key: string]: string}>await langs[`./${locale}.json`](); // load the target language file

export const getLocalString = (key: string): string => {
    return localeData[key] || key;
}
