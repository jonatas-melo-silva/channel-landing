import type { PageKey } from './pages';

/**
 * Caminho para onde ir quando a página escolhida não existe no canal, ou null para ficar.
 * Só age quando a lista de abas é confiável (ao menos duas, incluindo Vídeos), para nunca
 * redirecionar por causa de uma leitura incompleta. Início e Vídeos nunca são redirecionados:
 * o primeiro sempre existe e o segundo é o destino da saída.
 */
export function missingTabTarget(
  page: PageKey | null,
  tabs: readonly PageKey[] | null,
  rawHandle: string,
): string | null {
  if (page === null || page === 'home' || page === 'videos') return null;
  if (tabs === null || tabs.length < 2 || !tabs.includes('videos')) return null;
  if (tabs.includes(page)) return null;
  return `/${rawHandle}/videos`;
}
