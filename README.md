# Channel Landing

Extensão para Brave, Chrome e Firefox que abre direto a aba que você escolheu quando você entra no perfil de um canal do YouTube. Hoje o YouTube abre sempre o Início do canal. Com a extensão, `https://www.youtube.com/@kipperdev` leva você para `https://www.youtube.com/@kipperdev/videos`, ou para qualquer outra aba que você tenha definido para aquele canal.

## Status

Em desenvolvimento, sem versão publicada. O trabalho está dividido em fases e o projeto está na fase 4: o popup já mostra o canal aberto (nome, avatar, inscritos e vídeos), deixa escolher a página que cada canal abre e guarda a escolha por canal. Falta a bateria final de testes de integração e a publicação (fases 5 a 7). O plano completo, com decisões e critérios de aceite de cada fase, está em [docs/PRP.md](docs/PRP.md).

## Como vai funcionar

Cada canal guarda a própria preferência, e Vídeos é o padrão. O popup da extensão lista as abas do canal aberto (Início, Vídeos, Ao vivo, Playlists, Posts e, quando o canal tiver, Podcasts, Cursos e Loja) e só uma pode ficar escolhida por vez. Se a aba escolhida não existir em algum canal, a extensão leva para Vídeos.

## Rodar em desenvolvimento

Precisa de Node 22 (a versão está em [.nvmrc](.nvmrc)) e de pnpm.

```bash
pnpm install
pnpm dev            # abre o Brave com a extensão carregada
pnpm dev:firefox    # abre o Firefox com a extensão carregada
```

O `pnpm dev` procura o Brave em `/usr/bin/brave-browser`. Se o seu estiver em outro lugar, defina `BRAVE_PATH` antes de rodar. Para o Firefox existe `FIREFOX_PATH`.

Outros comandos:

| Comando          | O que faz                                     |
| ---------------- | --------------------------------------------- |
| `pnpm lint`      | Roda o ESLint                                 |
| `pnpm typecheck` | Confere os tipos com o TypeScript             |
| `pnpm test`      | Roda os testes unitários (Vitest)             |
| `pnpm test:e2e`  | Gera o build e roda os testes e2e             |
| `pnpm build`     | Gera o build para Chromium em `.output`       |
| `pnpm zip`       | Gera o `.zip` do build (`zip:firefox` também) |

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

## Contribuição

O trabalho acontece em branches `feat/*` com pull request para a `main`. Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), e um hook do Husky recusa mensagens fora do padrão. Bugs e sugestões vão em [issues](https://github.com/jonatas-melo-silva/channel-landing/issues).

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).

## Autor

[Jonatas Melo Silva](https://github.com/jonatas-melo-silva)
