import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChannelHeader } from '@/components/popup/ChannelHeader';
import type { ChannelInfo } from '@/lib/channel';

const channel: ChannelInfo = {
  key: '@kipperdev',
  name: 'Kipper Dev',
  avatar: 'https://img.example/avatar.png',
  subscribers: '12,3 mil inscritos',
  videos: '245 vídeos',
  tabs: null,
};

describe('ChannelHeader', () => {
  it('mostra o nome, o avatar e as duas badges', () => {
    const { container } = render(<ChannelHeader channel={channel} />);

    expect(screen.getByRole('heading', { name: 'Kipper Dev' })).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://img.example/avatar.png');
    expect(screen.getByTestId('badge-subscribers')).toHaveTextContent('12,3 mil inscritos');
    expect(screen.getByTestId('badge-videos')).toHaveTextContent('245 vídeos');
  });

  it('usa o handle quando o canal não tem nome', () => {
    render(<ChannelHeader channel={{ ...channel, name: null }} />);
    expect(screen.getByRole('heading', { name: '@kipperdev' })).toBeInTheDocument();
  });

  it('esconde a badge de um número que não foi lido', () => {
    render(<ChannelHeader channel={{ ...channel, subscribers: null }} />);
    expect(screen.queryByTestId('badge-subscribers')).not.toBeInTheDocument();
    expect(screen.getByTestId('badge-videos')).toBeInTheDocument();
  });

  it('sem nenhum número não mostra badge', () => {
    render(<ChannelHeader channel={{ ...channel, subscribers: null, videos: null }} />);
    expect(screen.queryByTestId('badge-subscribers')).not.toBeInTheDocument();
    expect(screen.queryByTestId('badge-videos')).not.toBeInTheDocument();
  });

  it('troca o avatar por um ícone quando a imagem não carrega', () => {
    const { container } = render(<ChannelHeader channel={channel} />);

    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).toBeNull();
  });

  it('sem avatar mostra o ícone no lugar', () => {
    const { container } = render(<ChannelHeader channel={{ ...channel, avatar: null }} />);
    expect(container.querySelector('img')).toBeNull();
  });
});
