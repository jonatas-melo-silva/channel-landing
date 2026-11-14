# Guia de envio para as lojas

Passo a passo para publicar a v0.1.0 na Chrome Web Store (que o Brave também usa) e no Firefox Add-ons. Os textos prontos estão em [listagem.md](listagem.md) e a política de privacidade em [../PRIVACY.md](../PRIVACY.md).

## Antes de enviar

1. Todas as fases anteriores mergeadas na `main`, com `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm test:e2e` verdes.
2. A [checklist manual](../checklist-manual.md) feita inteira no Brave e no Firefox, com canais reais. É ela que confirma a leitura dos dados no YouTube de verdade.
3. O ícone aparece na barra do navegador nos dois navegadores (os arquivos estão em `public/icon`).
4. Versão em `package.json` e no `CHANGELOG.md` no valor que vai sair (a loja recusa reenviar a mesma versão). O passo a passo de lançar a versão, com a tag, está em [../release.md](../release.md).

## Gerar os arquivos

```bash
pnpm zip            # Chrome e Brave
pnpm zip:firefox    # Firefox: gera o zip da extensão e o zip do código-fonte
```

Os arquivos saem em `.output/`. Os mesmos três zips ficam anexados ao release do GitHub quando a tag é publicada, então dá para baixá-los de lá em vez de gerar de novo. O nome segue o padrão `channel-landing-<versão>-<navegador>.zip`, e o código-fonte do Firefox termina em `-sources.zip`. Confira os nomes na saída do comando.

## Capturas de tela

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm screenshots
```

As imagens saem em `docs/publicacao/capturas` com 1280x800 px, o tamanho que a Chrome Web Store prefere. Abra as três e confira se o visual está bom. Se quiser outras, edite `tests/e2e/screenshots.spec.ts`.

## Chrome Web Store

1. Entre no [painel de desenvolvedores](https://chrome.google.com/webstore/devconsole) com uma conta Google. A primeira vez pede o cadastro de desenvolvedor, com uma taxa única de registro. Confira o valor atual no painel.
2. Crie um item novo e envie `channel-landing-<versão>-chrome.zip`.
3. Aba Store listing: cole o nome, o resumo e a descrição de [listagem.md](listagem.md), escolha a categoria, envie `docs/publicacao/icone-loja-128.png` e as capturas de tela. Marque o idioma padrão como inglês e adicione a tradução em português do Brasil.
4. Aba Privacy: cole a finalidade única e a justificativa de cada permissão, informe que não usa código remoto, marque que não coleta dados e as três declarações de conformidade. Em "Privacy policy" coloque o link do `PRIVACY.md` no GitHub.
5. Aba Distribution: público e todos os países, ou só link direto se quiser testar primeiro.
6. Envie para revisão. Como a extensão pede acesso a `www.youtube.com`, a revisão pode demorar mais que a de uma extensão sem acesso a sites.

## Firefox Add-ons

1. Entre no [Centro de Desenvolvedores](https://addons.mozilla.org/developers/) com uma conta Firefox, que é gratuita.
2. "Submit a New Add-on" e escolha publicar na loja (listed).
3. Envie `channel-landing-<versão>-firefox.zip`.
4. Quando perguntar se o código usa ferramentas de build, responda que sim e envie `channel-landing-<versão>-sources.zip`. O revisor roda `pnpm install --frozen-lockfile && pnpm zip:firefox` e compara com o que você enviou, então os passos do README ("Gerar os arquivos para publicação") precisam estar certos.
5. Preencha nome, resumo, descrição, categorias, licença (MIT), link da política de privacidade, link de suporte e as notas para o revisor de [listagem.md](listagem.md). O `manifest` já declara que a extensão não coleta dados.
6. Envie e acompanhe o resultado da revisão por e-mail.

## Depois de publicar

- Atualizações: suba a versão no `package.json`, gere os zips de novo e envie como nova versão em cada loja.
- Se uma loja recusar, o motivo vem por e-mail. Os casos mais prováveis são a justificativa de permissões (ajuste em [listagem.md](listagem.md)) e o build do Firefox que não bate com o código enviado.
- Quando o YouTube mudar o formato interno dos dados do canal, a leitura de abas pode falhar. A extensão continua redirecionando (isso só depende da URL), e o fallback para Vídeos fica desligado até a leitura ser corrigida.
