import { buildRules } from './rules';
import { loadPreferences } from './storage';

type UpdateOptions = Parameters<typeof browser.declarativeNetRequest.updateDynamicRules>[0];
type DnrRule = NonNullable<UpdateOptions['addRules']>[number];

/**
 * Troca as regras dinâmicas do navegador pelas que correspondem às preferências salvas.
 * Remoção e inclusão acontecem na mesma chamada, então nunca há um momento sem regras.
 */
export async function syncRules(): Promise<void> {
  const rules = buildRules(await loadPreferences());
  const existing = await browser.declarativeNetRequest.getDynamicRules();

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((rule) => rule.id),
    // `LandingRule` tem o mesmo formato de uma regra do declarativeNetRequest, mas com
    // strings literais no lugar dos enums dos tipos do navegador.
    addRules: rules as unknown as DnrRule[],
  });
}
