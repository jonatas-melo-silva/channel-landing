import { applyMissingTabFallback, loadCurrentChannel } from '@/lib/channel-loader';
import { isGetChannelRequest } from '@/lib/messages';

export default defineContentScript({
  matches: ['https://www.youtube.com/*'],
  runAt: 'document_idle',
  main() {
    const fallback = () => {
      applyMissingTabFallback().catch(() => {
        // Sem os dados do canal a pessoa fica onde está, que é o comportamento do YouTube.
      });
    };

    fallback();
    // O YouTube dispara este evento ao fim de cada navegação interna.
    document.addEventListener('yt-navigate-finish', fallback);

    // Chrome não aceita Promise como retorno do listener: a resposta vai por sendResponse
    // e `return true` mantém o canal aberto até ela chegar.
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isGetChannelRequest(message)) return false;
      loadCurrentChannel()
        .then(sendResponse)
        .catch(() => sendResponse({ ok: false, reason: 'unavailable' }));
      return true;
    });
  },
});
