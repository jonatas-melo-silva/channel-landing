import { Switch } from '@/components/ui/switch';
import { t } from '@/lib/i18n';
import type { PageKey } from '@/lib/pages';
import type { PopupPage } from '@/lib/popup-state';
import { describePage } from './page-meta';

interface PageListProps {
  pages: readonly PopupPage[];
  active: PageKey;
  onSelect: (page: PageKey) => void;
}

/**
 * Uma página escolhida por vez. Ligar uma troca a escolha; desligar a que está ligada não
 * faz nada, porque o canal sempre precisa de uma página (o switch continua ligado).
 */
export function PageList({ pages, active, onSelect }: PageListProps) {
  return (
    <ul aria-label={t('popupPagesLabel')} className="flex flex-col py-2">
      {pages.map(({ key, title }) => {
        const { icon: Icon, label, fallbackLabel } = describePage(key, title);
        const id = `page-${key}`;
        return (
          <li key={key} className="flex items-center justify-between gap-3 px-4 py-1.5">
            <label htmlFor={id} className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
              <Icon className="text-muted-foreground size-4" aria-hidden="true" />
              {label === null ? fallbackLabel : t(label)}
            </label>
            <Switch
              id={id}
              checked={key === active}
              onCheckedChange={(checked) => {
                if (checked) onSelect(key);
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
