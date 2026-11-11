import { describe, expect, it } from 'vitest';
import {
  getChannelPage,
  sanitizePreferences,
  setChannelPage,
  type Preferences,
} from '@/lib/preferences';

describe('getChannelPage', () => {
  it('usa Vídeos para canal sem preferência', () => {
    expect(getChannelPage({}, '@x')).toBe('videos');
  });

  it('devolve a página salva', () => {
    expect(getChannelPage({ '@x': 'posts' }, '@x')).toBe('posts');
  });

  it('usa Vídeos quando o valor salvo é inválido', () => {
    expect(getChannelPage({ '@x': 'nope' } as unknown as Preferences, '@x')).toBe('videos');
  });

  it('não confunde o nome de um canal com propriedades de objeto', () => {
    expect(getChannelPage({}, 'constructor')).toBe('videos');
  });
});

describe('setChannelPage', () => {
  it('grava a escolha de um canal', () => {
    expect(setChannelPage({}, '@x', 'streams')).toEqual({ '@x': 'streams' });
  });

  it('troca a escolha anterior do mesmo canal', () => {
    expect(setChannelPage({ '@x': 'streams' }, '@x', 'posts')).toEqual({ '@x': 'posts' });
  });

  it('escolher Vídeos remove a entrada do canal', () => {
    expect(setChannelPage({ '@x': 'streams', '@y': 'posts' }, '@x', 'videos')).toEqual({
      '@y': 'posts',
    });
  });

  it('guardar Início conta como preferência', () => {
    expect(setChannelPage({}, '@x', 'home')).toEqual({ '@x': 'home' });
  });

  it('não altera o objeto original', () => {
    const original: Preferences = { '@x': 'streams' };
    setChannelPage(original, '@x', 'videos');
    setChannelPage(original, '@y', 'posts');
    expect(original).toEqual({ '@x': 'streams' });
  });
});

describe('sanitizePreferences', () => {
  it.each([undefined, null, 'texto', 42, true, ['@x']])('devolve {} para %j', (raw) => {
    expect(sanitizePreferences(raw)).toEqual({});
  });

  it('mantém entradas válidas', () => {
    expect(sanitizePreferences({ '@x': 'streams', '@y': 'home' })).toEqual({
      '@x': 'streams',
      '@y': 'home',
    });
  });

  it('descarta páginas desconhecidas e chaves que não são handle', () => {
    expect(sanitizePreferences({ '@x': 'nope', lixo: 'streams', '@y': 'posts', '@z': 3 })).toEqual({
      '@y': 'posts',
    });
  });

  it('descarta Vídeos, que é o padrão e não precisa ficar salvo', () => {
    expect(sanitizePreferences({ '@x': 'videos', '@y': 'posts' })).toEqual({ '@y': 'posts' });
  });

  it('normaliza as chaves', () => {
    expect(sanitizePreferences({ '@KipperDev': 'streams', '@caf%C3%A9': 'posts' })).toEqual({
      '@kipperdev': 'streams',
      '@café': 'posts',
    });
  });
});
