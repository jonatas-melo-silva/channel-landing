import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SIZES = [16, 32, 48, 96, 128];
const PNG_SIGNATURE = '89504e470d0a1a0a';

describe('ícones da extensão', () => {
  it.each(SIZES)('icon/%i.png é um PNG quadrado desse tamanho', (size) => {
    const file = readFileSync(join(process.cwd(), 'public', 'icon', `${size}.png`));
    expect(file.subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE);
    // O cabeçalho IHDR guarda largura e altura logo depois da assinatura.
    expect(file.readUInt32BE(16)).toBe(size);
    expect(file.readUInt32BE(20)).toBe(size);
  });

  it('o wxt.config declara os mesmos tamanhos', () => {
    const config = readFileSync(join(process.cwd(), 'wxt.config.ts'), 'utf-8');
    for (const size of SIZES) expect(config).toContain(`${size}: 'icon/${size}.png'`);
  });
});
