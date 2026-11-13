import { useEffect, useState } from 'react';
import { getActiveChannel } from '@/lib/channel-client';
import type { GetChannelResponse } from '@/lib/messages';

// Casca com painel de depuração. Header, lista de páginas e rodapé entram na fase 4.
export default function App() {
  const [result, setResult] = useState<GetChannelResponse | null>(null);

  useEffect(() => {
    void getActiveChannel().then(setResult);
  }, []);

  return (
    <main className="w-80 p-4">
      <h1 className="text-base font-semibold">{browser.i18n.getMessage('extName')}</h1>
      {import.meta.env.DEV && (
        <pre className="mt-3 max-h-60 overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
      )}
    </main>
  );
}
