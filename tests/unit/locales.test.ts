import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const localesDir = join(process.cwd(), 'public', '_locales');

type Messages = Record<string, { message: string }>;

function readMessages(locale: string): Messages {
  return JSON.parse(readFileSync(join(localesDir, locale, 'messages.json'), 'utf-8')) as Messages;
}

const locales = readdirSync(localesDir);
const baseKeys = Object.keys(readMessages('en')).sort();

describe('locales', () => {
  it('inclui en e pt_BR', () => {
    expect(locales).toEqual(expect.arrayContaining(['en', 'pt_BR']));
  });

  it.each(locales)('%s tem as mesmas chaves que en', (locale) => {
    expect(Object.keys(readMessages(locale)).sort()).toEqual(baseKeys);
  });

  it.each(locales)('%s não tem mensagem vazia', (locale) => {
    for (const { message } of Object.values(readMessages(locale))) {
      expect(message.trim()).not.toBe('');
    }
  });

  // A loja do Chrome rejeita descrição do manifest com mais de 132 caracteres.
  it.each(locales)('%s tem extDescription com no máximo 132 caracteres', (locale) => {
    const length = readMessages(locale).extDescription?.message.length ?? 0;
    expect(length).toBeGreaterThan(0);
    expect(length).toBeLessThanOrEqual(132);
  });
});
