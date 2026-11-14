import { useEffect, useState } from 'react';
import { ChannelHeader } from '@/components/popup/ChannelHeader';
import { Footer } from '@/components/popup/Footer';
import { PageList } from '@/components/popup/PageList';
import { Separator } from '@/components/ui/separator';
import { getActiveChannel } from '@/lib/channel-client';
import { t } from '@/lib/i18n';
import type { PageKey } from '@/lib/pages';
import { activePage, toViewState, type ViewState } from '@/lib/popup-state';
import { getChannelPage, type Preferences } from '@/lib/preferences';
import { loadPreferences, savePreference, watchPreferences } from '@/lib/storage';

function StatusMessage({ text }: { text: string }) {
  return (
    <section className="flex flex-col gap-1 p-4">
      <h1 className="text-base font-semibold">{t('extName')}</h1>
      <p className="text-muted-foreground text-sm">{text}</p>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getActiveChannel().then((response) => {
      if (!cancelled) setView(toViewState(response));
    });
    void loadPreferences().then((loaded) => {
      if (!cancelled) setPrefs(loaded);
    });
    const stopWatching = watchPreferences(setPrefs);
    return () => {
      cancelled = true;
      stopWatching();
    };
  }, []);

  const select = (key: string, page: PageKey) => {
    void savePreference(key, page).then(setPrefs);
  };

  return (
    <main className="w-80">
      {view.status === 'ready' && prefs !== null ? (
        <>
          <ChannelHeader channel={view.channel} />
          <Separator />
          <PageList
            tabs={view.channel.tabs}
            active={activePage(getChannelPage(prefs, view.channel.key), view.channel.tabs)}
            onSelect={(page) => select(view.channel.key, page)}
          />
        </>
      ) : (
        <StatusMessage
          text={
            view.status === 'not-channel'
              ? t('popupNotChannel')
              : view.status === 'error'
                ? t('popupError')
                : t('popupLoading')
          }
        />
      )}
      <Separator />
      <Footer />
    </main>
  );
}
