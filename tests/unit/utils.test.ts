import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('junta classes e ignora valores falsos', () => {
    expect(cn('a', { b: false }, undefined, 'c')).toBe('a c');
  });

  it('resolve conflitos do Tailwind mantendo a última classe', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
