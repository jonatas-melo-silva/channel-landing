import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageList } from '@/components/popup/PageList';
import type { PageKey } from '@/lib/pages';
import type { PopupPage } from '@/lib/popup-state';

// Os textos viram a própria chave, para o teste não depender do idioma do navegador.
vi.mock('@/lib/i18n', () => ({ t: (key: string) => key }));

const standard: PopupPage[] = [
  { key: 'home', title: null },
  { key: 'videos', title: null },
  { key: 'streams', title: null },
  { key: 'playlists', title: null },
  { key: 'posts', title: null },
];

const ids = () => screen.getAllByRole('switch').map((node) => node.id);

describe('PageList', () => {
  it('mostra uma linha por página, na ordem recebida', () => {
    render(<PageList pages={standard} active="videos" onSelect={() => {}} />);
    expect(ids()).toEqual([
      'page-home',
      'page-videos',
      'page-streams',
      'page-playlists',
      'page-posts',
    ]);
  });

  it('páginas conhecidas usam o texto da extensão e as desconhecidas o nome do YouTube', () => {
    render(
      <PageList
        pages={[
          { key: 'videos', title: 'Vídeos' },
          { key: 'shorts', title: 'Shorts' },
          { key: 'shows', title: 'Programas' },
        ]}
        active="videos"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole('switch', { name: 'pageVideos' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Shorts' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Programas' })).toBeInTheDocument();
  });

  it('aba desconhecida sem nome mostra a própria chave', () => {
    render(<PageList pages={[{ key: 'shows', title: null }]} active="shows" onSelect={() => {}} />);
    expect(screen.getByRole('switch', { name: 'shows' })).toBeChecked();
  });

  it('só a página ativa fica ligada', () => {
    render(<PageList pages={standard} active="streams" onSelect={() => {}} />);
    expect(screen.getByRole('switch', { name: 'pageStreams' })).toBeChecked();
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(1);
  });

  it('ligar outra página avisa qual foi escolhida', () => {
    const onSelect = vi.fn();
    render(<PageList pages={standard} active="videos" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('switch', { name: 'pagePosts' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('posts');
  });

  it('clicar na página que já está ligada não faz nada', () => {
    const onSelect = vi.fn();
    render(<PageList pages={standard} active="videos" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('switch', { name: 'pageVideos' }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'pageVideos' })).toBeChecked();
  });

  it('só um switch fica ligado por vez ao trocar de página', () => {
    function Controlled() {
      const [active, setActive] = useState<PageKey>('videos');
      return <PageList pages={standard} active={active} onSelect={setActive} />;
    }
    render(<Controlled />);

    fireEvent.click(screen.getByRole('switch', { name: 'pageStreams' }));
    fireEvent.click(screen.getByRole('switch', { name: 'pagePlaylists' }));

    expect(screen.getByRole('switch', { name: 'pagePlaylists' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'pageStreams' })).not.toBeChecked();
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(1);
  });

  it('o rótulo também liga a página', () => {
    const onSelect = vi.fn();
    render(<PageList pages={standard} active="videos" onSelect={onSelect} />);

    fireEvent.click(screen.getByText('pageStreams'));

    expect(onSelect).toHaveBeenCalledWith('streams');
  });
});
