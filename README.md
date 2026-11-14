# Channel Landing

[![CI](https://github.com/jonatas-melo-silva/channel-landing/actions/workflows/ci.yml/badge.svg)](https://github.com/jonatas-melo-silva/channel-landing/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

Extensão para Brave, Chrome e Firefox que abre direto a aba que você escolheu quando você entra no perfil de um canal do YouTube. Hoje o YouTube abre sempre o Início do canal. Com a extensão, `https://www.youtube.com/@kipperdev` leva você para `https://www.youtube.com/@kipperdev/videos`, ou para qualquer outra aba que você tenha definido para aquele canal.

## Status

Em desenvolvimento, sem versão publicada. O trabalho está dividido em fases e o projeto está na fase 7: a extensão funciona (redirecionamento, leitura do canal e popup) e os materiais de publicação estão prontos: ícone, política de privacidade, textos das lojas e guia de envio. O plano completo, com decisões e critérios de aceite de cada fase, está em [docs/PRP.md](docs/PRP.md).

## Como vai funcionar

Cada canal guarda a própria preferência, e Vídeos é o padrão. O popup da extensão lista as abas do canal aberto (Início, Vídeos, Ao vivo, Playlists, Posts e, quando o canal tiver, Podcasts, Cursos e Loja) e só uma pode ficar escolhida por vez. Se a aba escolhida não existir em algum canal, a extensão leva para Vídeos.

## Instalação

Enquanto a extensão não está nas lojas, ela se instala pelos arquivos da página de [Releases](https://github.com/jonatas-melo-silva/channel-landing/releases).

**Brave e Chrome**

1. Baixe `channel-landing-<versão>-chrome.zip` e extraia numa pasta que você vá manter.
2. Abra `brave://extensions` (no Chrome, `chrome://extensions`) e ligue o "Modo do desenvolvedor".
3. Clique em "Carregar sem compactação" e escolha a pasta extraída.

**Firefox**

1. Baixe `channel-landing-<versão>-firefox.zip`.
2. Abra `about:debugging#/runtime/this-firefox` e clique em "Carregar extensão temporária".
3. Escolha o arquivo `.zip`. O Firefox remove extensões temporárias quando fecha, então a instalação definitiva depende da versão assinada pela loja do Firefox.

## Uso

Abra o perfil de um canal e clique no ícone da extensão. Ligue a aba em que aquele canal deve abrir. A partir daí, entrar no canal por um link, pela busca ou por um clique dentro do YouTube leva direto a ela. Para voltar ao padrão, ligue Vídeos.

## Rodar em desenvolvimento

Precisa de Node 22 (a versão está em [.nvmrc](.nvmrc)) e de pnpm.

```bash
pnpm install
pnpm dev            # abre o Brave com a extensão carregada
pnpm dev:firefox    # abre o Firefox com a extensão carregada
```

O `pnpm dev` procura o Brave em `/usr/bin/brave-browser`. Se o seu estiver em outro lugar, defina `BRAVE_PATH` antes de rodar. Para o Firefox existe `FIREFOX_PATH`.

Outros comandos:

| Comando            | O que faz                                     |
| ------------------ | --------------------------------------------- |
| `pnpm lint`        | Roda o ESLint                                 |
| `pnpm typecheck`   | Confere os tipos com o TypeScript             |
| `pnpm test`        | Roda os testes unitários (Vitest)             |
| `pnpm test:e2e`    | Gera o build e roda os testes e2e             |
| `pnpm screenshots` | Gera as capturas de tela das lojas            |
| `pnpm build`       | Gera o build para Chromium em `.output`       |
| `pnpm zip`         | Gera o `.zip` do build (`zip:firefox` também) |

Os testes e2e abrem um Chromium de verdade com a extensão carregada e um servidor HTTPS local no lugar do YouTube, então não acessam a internet. Na primeira vez, instale o navegador do Playwright com `pnpm exec playwright install chromium`. Eles também precisam do `openssl` no sistema. O Firefox não entra nos testes automáticos, porque o Playwright não carrega extensões nele, e segue o [checklist manual](docs/checklist-manual.md).

## Permissões

| Permissão                   | Para que serve                                                           |
| --------------------------- | ------------------------------------------------------------------------ |
| `storage`                   | Guardar a página escolhida para cada canal.                              |
| `declarativeNetRequest`     | Redirecionar ao abrir o canal, antes de a página de início aparecer.     |
| `webNavigation`             | Perceber quando você entra num canal clicando dentro do próprio YouTube. |
| `scripting`                 | Trocar o endereço da aba, sem deixar a página de início no botão Voltar. |
| `https://www.youtube.com/*` | Aplicar tudo isso somente no YouTube.                                    |

O navegador descreve a permissão `webNavigation` como "ler o histórico de navegação". A extensão só olha endereços de `www.youtube.com` e não envia nada para fora do navegador.

## Privacidade

A extensão não coleta nem envia dados. A única coisa guardada é a aba escolhida para cada canal, no seu navegador. A política completa, em português e inglês, está em [docs/PRIVACY.md](docs/PRIVACY.md).

## Gerar os arquivos para publicação

Ambiente: Linux, Node 22 (versão em [.nvmrc](.nvmrc)) e pnpm 9 ou mais novo (o projeto é desenvolvido com pnpm 11). Os comandos abaixo geram, em `.output/`, o zip da extensão e, no Firefox, também o zip do código-fonte:

```bash
pnpm install --frozen-lockfile
pnpm zip            # Chrome e Brave
pnpm zip:firefox    # Firefox
```

Os textos, o ícone e o passo a passo de envio para as lojas estão em [docs/publicacao](docs/publicacao/guia-de-envio.md).

## Contribuição

O trabalho acontece em branches `feat/*` com pull request para a `main`. Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), e um hook do Husky recusa mensagens fora do padrão. O CI do GitHub Actions roda formatação, lint, tipos, testes unitários, os dois builds e os testes e2e em cada PR. As mudanças ficam registradas no [CHANGELOG](CHANGELOG.md) e o passo a passo de uma versão está em [docs/release.md](docs/release.md). Bugs e sugestões vão em [issues](https://github.com/jonatas-melo-silva/channel-landing/issues).

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).

## Autor

[Jonatas Melo Silva](https://github.com/jonatas-melo-silva)

Channel Landing não tem relação com o YouTube nem com o Google. YouTube é marca registrada do Google LLC.
