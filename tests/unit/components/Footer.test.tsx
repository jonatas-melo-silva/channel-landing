import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/popup/Footer';

vi.mock('@/lib/i18n', () => ({ t: (key: string) => key }));

describe('Footer', () => {
  it('explica como funciona', () => {
    render(<Footer />);
    expect(screen.getByText('popupHowItWorks')).toBeInTheDocument();
  });

  it('tem o link com o nome do autor para o repositório, em nova aba', () => {
    render(<Footer />);

    const link = screen.getByRole('link', { name: 'Jonatas Melo Silva' });

    expect(link).toHaveAttribute('href', 'https://github.com/jonatas-melo-silva/channel-landing');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });
});
