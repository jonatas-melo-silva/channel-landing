# Checklist manual

Para conferir à mão, no Brave e no Firefox, depois de mudanças no redirecionamento ou no popup. O Playwright só automatiza Chromium (`pnpm test:e2e`), então o Firefox depende deste roteiro.

## Preparação

1. Rode `pnpm dev` para o Brave ou `pnpm dev:firefox` para o Firefox.
2. No Brave, abra `brave://extensions` e confira que Channel Landing está ativa, sem erros.
3. No Firefox, abra `about:addons`, entre em Channel Landing, aba Permissões, e confira que o acesso a `www.youtube.com` está ligado. No Firefox as permissões de site podem vir desligadas e, sem elas, nada é redirecionado.
4. Abra o console do background. No Brave, `brave://extensions`, link "service worker", Inspect. No Firefox, `about:debugging#/runtime/this-firefox`, Inspect. Não pode haver erro em vermelho ao iniciar.

## Cenários

Sem preferência salva, o padrão é Vídeos.

| #   | Ação                                                                            | Resultado esperado                                  |
| --- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Colar `https://www.youtube.com/@kipperdev` na barra de endereço                 | Abre `/@kipperdev/videos`                           |
| 2   | Clicar em um link para o canal vindo de outro site                              | Abre `/@kipperdev/videos`                           |
| 3   | Numa página de vídeo, clicar no nome do canal                                   | Cai em Vídeos                                       |
| 4   | Dentro do canal, em Vídeos, clicar em Início                                    | Fica no Início, sem voltar para Vídeos              |
| 5   | Depois do cenário 3, clicar em Voltar                                           | Volta para o vídeo, sem passar pelo Início do canal |
| 6   | Abrir `/@kipperdev/about`, `/@kipperdev/streams`, `/shorts/...`, `/watch?v=...` | Nada muda                                           |
| 7   | Abrir `https://www.youtube.com/@kipperdev?si=abc`                               | Abre `/@kipperdev/videos?si=abc`                    |

## Com preferências

Para testar um valor específico, grave as preferências pelo console de uma página da própria extensão (o popup faz o mesmo ao ligar um switch). O console de uma página comum, como a aba do YouTube, não tem `chrome.storage` nem `browser.storage`.

- No Brave, copie o ID da extensão em `brave://extensions` (com o modo do desenvolvedor ligado), abra `chrome-extension://ID/popup.html` numa aba e aperte F12.
- No Firefox, copie o "UUID interno" da extensão em `about:debugging#/runtime/this-firefox`, abra `moz-extension://UUID/popup.html` numa aba e aperte F12.

No Console dessa aba, rode o comando abaixo (no Firefox troque `chrome` por `browser`):

```js
chrome.storage.local.set({ preferences: { '@kipperdev': 'streams', '@outrocanal': 'home' } });
```

Repita os cenários 1 a 4 e confira:

- `@kipperdev` abre em `/streams`.
- `@outrocanal` abre no Início, sem redirecionar.
- Qualquer outro canal abre em Vídeos.

Para voltar ao normal, grave `{ preferences: {} }`. Tudo volta a Vídeos.

## Popup e dados do canal (fases 3 e 4)

A leitura dos dados depende do formato interno do YouTube, que só se confirma em canais de verdade. Com um canal aberto, clique no ícone da extensão e confira:

| #   | Situação                                           | Esperado                                                                    |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Um canal comum, por exemplo `@kipperdev`           | Nome, avatar, inscritos e vídeos iguais ao que a página mostra              |
| 2   | Um canal com Podcasts, Cursos ou Loja              | Os switches dessas abas aparecem                                            |
| 3   | Um canal sem Podcasts, Cursos e Loja               | Só aparecem Início, Vídeos, Ao vivo, Playlists e Posts                      |
| 4   | De um canal, clicar em outro pelo YouTube          | O popup mostra o segundo canal, não o primeiro                              |
| 5   | Numa página de vídeo ou na página inicial          | Mensagem pedindo para abrir um canal, com o rodapé                          |
| 6   | Ligar Ao vivo                                      | Só Ao vivo fica ligado; clicar nele de novo não desliga                     |
| 7   | Fechar o popup, reabrir e abrir o canal pela busca | O canal abre em Ao vivo; outro canal continua em Vídeos                     |
| 8   | Navegar só com Tab e Espaço                        | Cada switch recebe foco visível e Espaço escolhe a página                   |
| 9   | Tema escuro e claro do navegador                   | O popup acompanha, sem texto ilegível                                       |
| 10  | Idioma do navegador em português e em inglês       | Textos do popup no idioma certo (Início/Home, Ao vivo/Live, Cursos/Courses) |
| 11  | Clicar em "Jonatas Melo Silva" no rodapé           | Abre o repositório do GitHub em uma nova aba                                |

Se algum campo vier vazio num canal que o mostra na página (por exemplo, sem inscritos), anote o canal e o campo no PR: o formato mudou e a leitura precisa de ajuste.

Fallback: grave `{ '@canalsempodcast': 'podcasts' }` pelo procedimento da seção anterior (use um canal real que não tenha Podcasts) e abra o canal. Ele deve terminar em `/videos`, sem ficar recarregando, e o Console da aba do YouTube não deve ter erros da extensão. No popup desse canal, Vídeos aparece ligado.

## Só no Firefox

As regras de `declarativeNetRequest` redirecionam antes de a página aparecer. Se no cenário 1 a página de início aparece por um instante e só depois vai para Vídeos, as regras não estão valendo no Firefox e o listener de navegação está cobrindo (o redirecionamento funciona, mas com um piscar). Para ver se as regras foram registradas, rode no console da página da extensão:

```js
await browser.declarativeNetRequest.getDynamicRules();
```

A lista deve ter ao menos uma regra. Se vier vazia, ou se houver erro no console, anote a mensagem no PR: isso decide se o build do Firefox mantém as regras ou usa só o listener.
