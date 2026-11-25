import {
  GraduationCap,
  Home,
  LayoutGrid,
  ListVideo,
  MessageSquare,
  Podcast,
  Radio,
  Store,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { PAGE_KEYS, type KnownPageKey, type PageKey } from '@/lib/pages';

/** Ícone e chave de texto de cada página do canal. */
export const PAGE_META: Record<KnownPageKey, { icon: LucideIcon; label: string }> = {
  home: { icon: Home, label: 'pageHome' },
  videos: { icon: Video, label: 'pageVideos' },
  streams: { icon: Radio, label: 'pageStreams' },
  playlists: { icon: ListVideo, label: 'pagePlaylists' },
  posts: { icon: MessageSquare, label: 'pagePosts' },
  podcasts: { icon: Podcast, label: 'pagePodcasts' },
  courses: { icon: GraduationCap, label: 'pageCourses' },
  store: { icon: Store, label: 'pageStore' },
};

/** Ícone usado nas abas que a extensão não conhece. */
export const UNKNOWN_PAGE_ICON: LucideIcon = LayoutGrid;

/** Ícone e texto de uma página. Abas desconhecidas usam o nome que o YouTube dá a elas. */
export function describePage(
  key: PageKey,
  title: string | null,
): { icon: LucideIcon; label: string | null; fallbackLabel: string } {
  const known = (PAGE_KEYS as readonly string[]).includes(key)
    ? PAGE_META[key as KnownPageKey]
    : null;
  return known
    ? { icon: known.icon, label: known.label, fallbackLabel: key }
    : { icon: UNKNOWN_PAGE_ICON, label: null, fallbackLabel: title ?? key };
}
