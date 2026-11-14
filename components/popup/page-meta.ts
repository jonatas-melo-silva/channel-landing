import {
  GraduationCap,
  Home,
  ListVideo,
  MessageSquare,
  Podcast,
  Radio,
  Store,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { PageKey } from '@/lib/pages';

/** Ícone e chave de texto de cada página do canal. */
export const PAGE_META: Record<PageKey, { icon: LucideIcon; label: string }> = {
  home: { icon: Home, label: 'pageHome' },
  videos: { icon: Video, label: 'pageVideos' },
  streams: { icon: Radio, label: 'pageStreams' },
  playlists: { icon: ListVideo, label: 'pagePlaylists' },
  posts: { icon: MessageSquare, label: 'pagePosts' },
  podcasts: { icon: Podcast, label: 'pagePodcasts' },
  courses: { icon: GraduationCap, label: 'pageCourses' },
  store: { icon: Store, label: 'pageStore' },
};
