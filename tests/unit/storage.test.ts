import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { loadPreferences, savePreference } from '@/lib/storage';

beforeEach(() => {
  fakeBrowser.reset();
});

describe('storage', () => {
  it('começa vazio', async () => {
    expect(await loadPreferences()).toEqual({});
  });

  it('salva e lê a preferência, normalizando o handle', async () => {
    await savePreference('@KipperDev', 'streams');
    expect(await loadPreferences()).toEqual({ '@kipperdev': 'streams' });
  });

  it('guarda uma preferência por canal', async () => {
    await savePreference('@x', 'streams');
    await savePreference('@y', 'posts');
    expect(await loadPreferences()).toEqual({ '@x': 'streams', '@y': 'posts' });
  });

  it('escolher Vídeos remove a entrada do canal', async () => {
    await savePreference('@x', 'streams');
    await savePreference('@x', 'videos');
    expect(await loadPreferences()).toEqual({});
  });

  it('ignora lixo que estiver no storage', async () => {
    await fakeBrowser.storage.local.set({
      preferences: { '@x': 'nope', '@y': 'posts', lixo: 'streams' },
    });
    expect(await loadPreferences()).toEqual({ '@y': 'posts' });
  });

  it('recusa handle inválido', async () => {
    await expect(savePreference('kipperdev', 'streams')).rejects.toThrow();
  });
});
