/** Texto da extensão no idioma do navegador (`public/_locales`). */
export function t(key: string): string {
  return browser.i18n.getMessage(key as Parameters<typeof browser.i18n.getMessage>[0]);
}
