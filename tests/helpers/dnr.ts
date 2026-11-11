import type { LandingRule } from '@/lib/rules';

/**
 * Simula como o navegador aplicaria as regras a uma navegação de página inteira: pega as
 * regras que casam com a URL, fica com a de maior prioridade e devolve o destino do
 * redirecionamento (ou null se nada casa ou se a regra vencedora é `allow`).
 */
export function applyRules(rules: readonly LandingRule[], rawUrl: string): string | null {
  const url = new URL(rawUrl).href;

  const matches = rules
    .map((rule) => ({ rule, match: new RegExp(rule.condition.regexFilter, 'i').exec(url) }))
    .filter((entry): entry is { rule: LandingRule; match: RegExpExecArray } => entry.match !== null)
    .sort((a, b) => b.rule.priority - a.rule.priority);

  const top = matches[0];
  if (top === undefined || top.rule.action.type === 'allow') return null;

  return top.rule.action.redirect.regexSubstitution.replace(
    /\\(\d)/g,
    (_, index: string) => top.match[Number(index)] ?? '',
  );
}
