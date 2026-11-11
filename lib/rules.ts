import { normalizeHandle } from './handle';
import { DEFAULT_PAGE, getPage, type PageKey } from './pages';
import { getChannelPage, type Preferences } from './preferences';

export const BASE_RULE_ID = 1;
const BASE_PRIORITY = 1;
const CHANNEL_PRIORITY = 2;

const HOST = '^https://www\\.youtube\\.com/';
const ANY_HANDLE = '@[^/?#]+';
// Entrada do canal: `/featured` e a barra final são opcionais. O grupo 2 guarda a query
// string (sempre participa da correspondência, mesmo vazio) e o fragmento é descartado.
const LANDING_TAIL = '(?:/featured)?/?(\\?[^#]*|)(?:#.*)?$';

export type LandingRuleAction =
  { type: 'allow' } | { type: 'redirect'; redirect: { regexSubstitution: string } };

/** Mesmo formato de uma regra dinâmica do declarativeNetRequest. */
export interface LandingRule {
  id: number;
  priority: number;
  action: LandingRuleAction;
  condition: {
    regexFilter: string;
    isUrlFilterCaseSensitive: false;
    resourceTypes: ['main_frame'];
  };
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Trecho do regex que casa com o handle de um canal, do jeito que aparece na URL
 * (`@caf%C3%A9`). A flag de maiúsculas do regex cobre as letras ASCII e a caixa do
 * código hexadecimal (`%c3` e `%C3`), mas não as letras fora do ASCII: `é` é `%C3%A9`
 * e `É` é `%C3%89`. Por isso cada caractere não ASCII vira uma alternativa entre as
 * suas formas minúscula e maiúscula. Os grupos são sem captura para não mexer em `\1` e `\2`.
 */
function channelPattern(key: string): string {
  const parts = Array.from(key.slice(1), (char) => {
    if (char.charCodeAt(0) < 128) return escapeRegex(encodeURIComponent(char));
    const forms = new Set([char, char.toLowerCase(), char.toUpperCase()]);
    const encoded = [...forms].map((form) => escapeRegex(encodeURIComponent(form)));
    return encoded.length === 1 ? (encoded[0] ?? '') : `(?:${encoded.join('|')})`;
  });
  return `@${parts.join('')}`;
}

function landingCondition(handlePattern: string): LandingRule['condition'] {
  return {
    regexFilter: `${HOST}(${handlePattern})${LANDING_TAIL}`,
    isUrlFilterCaseSensitive: false,
    resourceTypes: ['main_frame'],
  };
}

// \1 é o handle como veio na URL e \2 é a query string.
function redirectTo(page: PageKey): LandingRuleAction {
  return {
    type: 'redirect',
    redirect: { regexSubstitution: `https://www.youtube.com/\\1/${getPage(page).path}\\2` },
  };
}

/**
 * Monta as regras de redirecionamento para carga completa de página.
 *
 * Uma regra base leva qualquer canal para a página padrão. Cada canal com preferência
 * diferente do padrão ganha uma regra de prioridade maior: redireciona para a aba escolhida
 * ou, no caso do Início, usa `allow` para impedir o redirecionamento da regra base.
 *
 * As chaves de `prefs` precisam estar normalizadas (ver `sanitizePreferences`). Chaves fora
 * disso são ignoradas. O Chrome aceita no máximo 1000 regras com regex no total.
 */
export function buildRules(prefs: Preferences): LandingRule[] {
  const rules: LandingRule[] = [
    {
      id: BASE_RULE_ID,
      priority: BASE_PRIORITY,
      action: redirectTo(DEFAULT_PAGE),
      condition: landingCondition(ANY_HANDLE),
    },
  ];

  let nextId = BASE_RULE_ID + 1;
  for (const key of Object.keys(prefs).sort()) {
    if (normalizeHandle(key) !== key) continue;

    const page = getChannelPage(prefs, key);
    if (page === DEFAULT_PAGE) continue;

    rules.push({
      id: nextId++,
      priority: CHANNEL_PRIORITY,
      action: page === 'home' ? { type: 'allow' } : redirectTo(page),
      condition: landingCondition(channelPattern(key)),
    });
  }
  return rules;
}
