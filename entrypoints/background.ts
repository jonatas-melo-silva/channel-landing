import { syncRules } from '@/lib/dnr';
import { createSerialQueue } from '@/lib/serial-queue';
import { watchPreferences } from '@/lib/storage';
import { handleNavigation } from '@/lib/tab-redirect';
import { clearTabChannel } from '@/lib/tab-state';

export default defineBackground(() => {
  // Uma tarefa por vez: várias leem e depois gravam o mesmo storage.
  const enqueue = createSerialQueue();

  // O background roda a cada vez que o navegador o acorda: na instalação, ao abrir o
  // navegador e quando chega um evento. Sincronizar aqui cobre os três casos.
  void enqueue(syncRules);
  watchPreferences(() => void enqueue(syncRules));

  // Carga completa de página: as regras de declarativeNetRequest já redirecionam sem piscar.
  // Este listener cobre o que elas não alcançam (por exemplo, se o navegador não aplicar
  // as regras). Navegação interna do YouTube não passa pela rede, só por aqui.
  const youtube = { url: [{ hostEquals: 'www.youtube.com', schemes: ['https'] }] };

  browser.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return;
    void enqueue(() => handleNavigation(details.tabId, details.url, 'load'));
  }, youtube);

  browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId !== 0) return;
    void enqueue(() => handleNavigation(details.tabId, details.url, 'history'));
  }, youtube);

  browser.tabs.onRemoved.addListener((tabId) => {
    void enqueue(() => clearTabChannel(tabId));
  });
});
