import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import App from '@/entrypoints/popup/App';
import { getActiveChannel } from '@/lib/channel-client';
import type { ChannelInfo } from '@/lib/channel';

vi.mock('@/lib/i18n', () => ({ t: (key: string) => key }));
vi.mock('@/lib/channel-client', () => ({ getActiveChannel: vi.fn() }));

const channel: ChannelInfo = {
  key: '@x',
  name: 'Canal X',
  avatar: null,
  subscribers: '1 mil inscritos',
  videos: '10 vídeos',
  tabs: ['home', 'videos', 'streams', 'playlists', 'posts'],
};

const storedPreferences = async () =>
  (await fakeBrowser.storage.local.get('preferences')).preferences;

beforeEach(() => {
  fakeBrowser.reset();
  vi.mocked(getActiveChannel).mockReset();
});

describe('App (popup)', () => {
  it('enquanto lê o canal mostra a mensagem de carregamento', () => {
    vi.mocked(getActiveChannel).mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText('popupLoading')).toBeInTheDocument();
  });

  it('fora de um canal explica o que fazer, sem switches, e mantém o rodapé', async () => {
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: false, reason: 'not-channel' });
    render(<App />);

    expect(await screen.findByText('popupNotChannel')).toBeInTheDocument();
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Jonatas Melo Silva' })).toBeInTheDocument();
  });

  it('quando não consegue ler o canal mostra o erro', async () => {
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: false, reason: 'unavailable' });
    render(<App />);

    expect(await screen.findByText('popupError')).toBeInTheDocument();
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
  });

  it('mostra o canal com Vídeos ligado quando não há preferência', async () => {
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: true, channel });
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Canal X' })).toBeInTheDocument();
    expect(await screen.findByRole('switch', { name: 'pageVideos' })).toBeChecked();
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(1);
  });

  it('mostra a preferência salva do canal', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'posts' } });
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: true, channel });
    render(<App />);

    await waitFor(() => expect(screen.getByRole('switch', { name: 'pagePosts' })).toBeChecked());
    expect(screen.getByRole('switch', { name: 'pageVideos' })).not.toBeChecked();
  });

  it('preferência por uma aba que o canal não tem aparece como Vídeos', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'podcasts' } });
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: true, channel });
    render(<App />);

    expect(await screen.findByRole('switch', { name: 'pageVideos' })).toBeChecked();
  });

  it('escolher uma página salva a preferência do canal', async () => {
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: true, channel });
    render(<App />);

    fireEvent.click(await screen.findByRole('switch', { name: 'pageStreams' }));

    await waitFor(async () => expect(await storedPreferences()).toEqual({ '@x': 'streams' }));
    await waitFor(() => expect(screen.getByRole('switch', { name: 'pageStreams' })).toBeChecked());
    expect(screen.getByRole('switch', { name: 'pageVideos' })).not.toBeChecked();
  });

  it('voltar para Vídeos remove a entrada do canal', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'streams' } });
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: true, channel });
    render(<App />);
    await waitFor(() => expect(screen.getByRole('switch', { name: 'pageStreams' })).toBeChecked());

    fireEvent.click(screen.getByRole('switch', { name: 'pageVideos' }));

    await waitFor(async () => expect(await storedPreferences()).toEqual({}));
  });

  it('a escolha de um canal não muda o de outro', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@outro': 'posts' } });
    vi.mocked(getActiveChannel).mockResolvedValue({ ok: true, channel });
    render(<App />);

    fireEvent.click(await screen.findByRole('switch', { name: 'pageStreams' }));

    await waitFor(async () =>
      expect(await storedPreferences()).toEqual({ '@outro': 'posts', '@x': 'streams' }),
    );
  });
});
