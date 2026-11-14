import { t } from '@/lib/i18n';
import { AUTHOR_NAME, REPOSITORY_URL } from '@/lib/author';

export function Footer() {
  return (
    <footer className="text-muted-foreground flex flex-col gap-2 p-4 text-xs">
      <p>{t('popupHowItWorks')}</p>
      <p>
        {t('popupMadeBy')}{' '}
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-2"
        >
          {AUTHOR_NAME}
        </a>
      </p>
    </footer>
  );
}
