import { tabPageKey, type RawTab } from '@/lib/channel';

/**
 * Painel de teste, só no modo de desenvolvimento: mostra todas as abas que o YouTube informou
 * para o canal e se a extensão as reconhece. Serve para conferir a leitura em canais reais.
 */
export function DebugTabs({ rawTabs }: { rawTabs: readonly RawTab[] | null | undefined }) {
  return (
    <section className="border-t p-4 text-xs" data-testid="debug-tabs">
      <h2 className="mb-2 font-semibold">Abas informadas pelo YouTube (teste)</h2>
      {!rawTabs || rawTabs.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma aba lida.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rawTabs.map((tab) => {
            const page = tabPageKey(tab.url);
            return (
              <li key={tab.url} className="flex flex-col">
                <span className="font-medium">
                  {tab.title ?? '(sem título)'}
                  {tab.selected && ' (aberta)'}
                </span>
                <span className="text-muted-foreground break-all">{tab.url}</span>
                <span className={page ? 'text-foreground' : 'text-muted-foreground'}>
                  {page ? `vira a página "${page}"` : 'não entra na lista do popup'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
