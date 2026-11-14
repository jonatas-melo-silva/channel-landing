import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageList } from '@/components/popup/PageList';
import { PAGE_KEYS, type PageKey } from '@/lib/pages';

// Os textos viram a própria chave, para o teste não depender do idioma do navegador.
vi.mock('@/lib/i18n', () => ({ t: (key: string) => key }));

const labels = () => screen.getAllByRole('switch').map((node) => node.id);

describe('PageList', () => {
  it('sem lista de abas mostra só as cinco páginas padrão', () => {
    render(<PageList tabs={null} active="videos" onSelect={() => {}} />);
    expect(labels()).toEqual([
      'page-home',
      'page-videos',
      'page-streams',
      'page-playlists',
      'page-posts',
    ]);
  });

  it('mostra as páginas opcionais só quando o canal as tem', () => {
    render(
      <PageList
        tabs={['home', 'videos', 'podcasts', 'store']}
        active="videos"
        onSelect={() => {}}
      />,
    );
    expect(labels()).toEqual([
      'page-home',
      'page-videos',
      'page-streams',
      'page-playlists',
      'page-posts',
      'page-podcasts',
      'page-store',
    ]);
    expect(screen.queryByRole('switch', { name: 'pageCourses' })).not.toBeInTheDocument();
  });

  it('com todas as abas mostra as oito páginas', () => {
    render(<PageList tabs={[...PAGE_KEYS]} active="videos" onSelect={() => {}} />);
    expect(screen.getAllByRole('switch')).toHaveLength(8);
  });

  it('só a página ativa fica ligada', () => {
    render(<PageList tabs={null} active="streams" onSelect={() => {}} />);
    expect(screen.getByRole('switch', { name: 'pageStreams' })).toBeChecked();
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(1);
  });

  it('ligar outra página avisa qual foi escolhida', () => {
    const onSelect = vi.fn();
    render(<PageList tabs={null} active="videos" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('switch', { name: 'pagePosts' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('posts');
  });

  it('clicar na página que já está ligada não faz nada', () => {
    const onSelect = vi.fn();
    render(<PageList tabs={null} active="videos" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('switch', { name: 'pageVideos' }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'pageVideos' })).toBeChecked();
  });

  it('só um switch fica ligado por vez ao trocar de página', () => {
    function Controlled() {
      const [active, setActive] = useState<PageKey>('videos');
      return <PageList tabs={null} active={active} onSelect={setActive} />;
    }
    render(<Controlled />);

    fireEvent.click(screen.getByRole('switch', { name: 'pageStreams' }));
    expect(screen.getByRole('switch', { name: 'pageStreams' })).toBeChecked();
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(1);

    fireEvent.click(screen.getByRole('switch', { name: 'pagePlaylists' }));
    expect(screen.getByRole('switch', { name: 'pagePlaylists' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'pageStreams' })).not.toBeChecked();
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(1);
  });

  it('o rótulo também liga a página', () => {
    const onSelect = vi.fn();
    render(<PageList tabs={null} active="videos" onSelect={onSelect} />);

    fireEvent.click(screen.getByText('pageStreams'));

    expect(onSelect).toHaveBeenCalledWith('streams');
  });
});
