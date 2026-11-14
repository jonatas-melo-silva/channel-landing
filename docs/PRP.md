# PRP: Extensão "Channel Landing" (nome provisório)

Revisão 3. Estado: aguardando aprovação. Nenhum código será escrito antes disso.

## 1. Objetivo

Extensão de navegador que, ao abrir o perfil de um canal do YouTube (por exemplo `https://www.youtube.com/@kipperdev`), redireciona para a aba escolhida para aquele canal. Cada canal tem a sua preferência, e "Vídeos" é o padrão de todos. Exemplo:

`https://www.youtube.com/@kipperdev` vira `https://www.youtube.com/@kipperdev/videos`

O projeto nasce com padrão profissional: ambiente reproduzível, testes, Git, GitHub, CI e release.

## 2. Decisões já fechadas

| Tema | Decisão |
| --- | --- |
| Escopo da preferência | Por canal. Canal sem preferência salva usa "Vídeos". |
| Navegadores | Brave (Chromium) como principal e Firefox. Mesmo código, dois builds. |
| Páginas opcionais | Podcasts, Cursos e Loja só aparecem no popup quando o canal tem a aba. |
| Páginas padrão | Início, Vídeos, Ao vivo, Playlists e Posts aparecem sempre. |
| Página inexistente no canal | Se a aba escolhida não existir, vai para Vídeos. |
| Idioma | Segue o idioma do navegador (português do Brasil e inglês). |
| Licença | MIT. |
| Nome e repositório | Nome provisório "Channel Landing", repositório `channel-landing`. Trocar agora custa pouco, depois custa mais. |
| Persistência | `storage.local`. Não sincroniza entre Brave e Firefox (ver riscos). |

## 3. Mapa de páginas

| Chave | Rótulo | Caminho após `/@handle` | Tipo |
| --- | --- | --- | --- |
| home | Início | (vazio) ou `/featured` | padrão |
| videos | Vídeos | `/videos` | padrão (valor de fábrica) |
| streams | Ao vivo | `/streams` | padrão |
| playlists | Playlists | `/playlists` | padrão |
| posts | Posts | `/posts` | padrão |
| podcasts | Podcasts | `/podcasts` | opcional (só se o canal tiver) |
| courses | Cursos | `/courses` | opcional (só se o canal tiver) |
| store | Loja | `/store` | opcional (só se o canal tiver) |

Regra de seleção: exatamente uma página ativa por vez, por canal. Ativar uma desativa a anterior.

## 4. Stack e decisões técnicas

- Framework de extensão: WXT (Manifest V3, React, TypeScript, builds para Chromium e Firefox).
- UI: React, Tailwind, shadcn/ui (Switch, Badge, Avatar, Separator, Label), lucide-react.
- i18n: `_locales` nativo do navegador (`pt_BR` e `en`) com `browser.i18n.getMessage`.
- Gerenciador de pacotes: pnpm. Node fixado em `.nvmrc`.
- Testes: Vitest e React Testing Library (unidade e componentes), Playwright (e2e em Chromium).
- Qualidade: ESLint, Prettier, `tsc --noEmit`, Husky, lint-staged, commitlint (Conventional Commits).
- CI: GitHub Actions.

Chave de um canal: o handle em minúsculas e decodificado (`@KipperDev` e `@kipperdev` são o mesmo canal).

Como o redirecionamento funciona:

1. Carga completa da página (digitar URL, link de fora, favorito): regras dinâmicas de `declarativeNetRequest`, só para `main_frame`. Uma regra base manda qualquer `/@handle` ou `/@handle/featured` para `/videos`. Para cada canal com preferência diferente de Vídeos existe uma regra específica de prioridade maior (redirecionando para a aba escolhida, ou apenas permitindo no caso de Início). Todas as regras são geradas por uma função pura `buildRules(prefs)` e reconstruídas sempre que o storage muda.
2. Navegação interna do YouTube (clicar no canal dentro do site): o YouTube é uma SPA e não faz requisição de rede, então a regra acima não dispara. O service worker escuta `webNavigation.onHistoryStateUpdated` e redireciona usando a mesma função `resolveTarget`. O redirecionamento troca a entrada atual do histórico (`scripting.executeScript` com `location.replace`), para o botão Voltar não cair de novo na entrada do canal. Se a injeção falhar, usa `tabs.update`.
3. Anti-prisão: se a aba já estava em outra página do mesmo canal e o usuário clica em "Início" dentro do canal, não redireciona. A regra de SPA só age quando o handle anterior da aba é diferente do atual.
4. Aba inexistente: o content script, ao chegar na página do canal, lê a lista de abas que o canal tem. Se a aba atual não está nela, faz `location.replace` para `/videos`. Se a própria aba Vídeos não existir, não redireciona de novo (evita loop).

Dados do canal e abas disponíveis vêm da própria página, por content script em `youtube.com`, sem chave de API e sem servidor.

## 5. Estrutura de pastas prevista

```
channel-landing/
  entrypoints/
    background.ts
    youtube.content.ts
    popup/
      index.html
      main.tsx
      App.tsx
  components/
    ui/                  (shadcn)
    ChannelHeader.tsx
    PageList.tsx
    Footer.tsx
  lib/
    pages.ts             (catálogo de páginas)
    handle.ts            (normalização do handle)
    redirect.ts          (resolveTarget: função pura)
    rules.ts             (buildRules: função pura)
    preferences.ts       (mapa handle -> página: funções puras)
    storage.ts           (leitura e escrita em storage.local)
    channel.ts           (extração de dados e abas do canal)
    author.ts            (nome e URL do repositório do rodapé)
  public/_locales/
    en/messages.json
    pt_BR/messages.json
  tests/
    unit/
    e2e/
  .github/
    workflows/ci.yml
    workflows/release.yml
    pull_request_template.md
  commitlint.config.ts
  eslint.config.js
  vitest.config.ts
  playwright.config.ts
  wxt.config.ts
  LICENSE
  README.md
```

## 6. Fases de desenvolvimento

Cada fase termina com um critério de aceite. A seguinte só começa depois dele.

### Fase 0: Repositório e ambiente

Tarefas:
- `git init`, repositório no GitHub, `main` protegida, trabalho em `feat/*` com PR.
- Projeto WXT com React e TypeScript, Tailwind, `shadcn init`, lucide-react.
- Manifest com `default_locale`, `browser_specific_settings.gecko.id` para o Firefox.
- ESLint, Prettier, EditorConfig, Husky com lint-staged, commitlint.
- `.nvmrc`, `.gitignore`, LICENSE (MIT), README inicial, template de PR.
- Scripts: `dev`, `dev:firefox`, `build`, `build:firefox`, `zip`, `lint`, `typecheck`, `test`, `test:e2e`.

Aceite: `pnpm dev` abre o Brave com a extensão carregada e `pnpm dev:firefox` faz o mesmo no Firefox; lint, typecheck e test passam; commit fora do padrão é recusado.

### Fase 1: Núcleo lógico (sem UI)

Tarefas:
- `pages.ts` com o catálogo da seção 3, marcando quais são padrão e quais opcionais.
- `handle.ts`: extrai e normaliza o handle de uma URL.
- `redirect.ts`: `resolveTarget(url, prefs, previousHandle?)` devolve a URL de destino ou `null`.
- `rules.ts`: `buildRules(prefs)` devolve a lista de regras dinâmicas (base mais uma por canal).
- `storage.ts`: leitura e escrita do mapa de preferências. Escolher Vídeos remove a entrada do canal (é o padrão, não precisa guardar).

Casos de teste obrigatórios:
- `/@x`, `/@x/`, `/@x/featured` e `/@x?si=abc` vão para a página preferida do canal ou para `/videos` se não houver preferência.
- `/@x/videos` com preferência `videos` não redireciona (sem loop).
- `/watch`, `/shorts`, `/@x/about`, `/@x/community` e demais caminhos não são tocados.
- Handle com caracteres codificados (`%C3%A9`) e variações de maiúscula/minúscula caem na mesma chave.
- Preferência `home` devolve `null`.
- Mesmo canal de origem devolve `null` (anti-prisão).
- `buildRules` gera uma regra base, uma regra por canal com prioridade maior e nenhuma regra para canais em Vídeos.

Aceite: testes unitários verdes cobrindo todos os casos acima.

### Fase 2: Redirecionamento

Tarefas:
- Service worker sincroniza as regras dinâmicas com o storage (na instalação, na inicialização e a cada mudança).
- Listener de `webNavigation.onHistoryStateUpdated` para navegação interna.
- Permissões mínimas: `storage`, `declarativeNetRequest`, `webNavigation`, `scripting`, host `https://www.youtube.com/*` (só https, que é o que a lógica reconhece).
- O listener de `webNavigation` também escuta `onCommitted` (carga completa) e funciona como plano B das regras: se o navegador não aplicar o `declarativeNetRequest`, o redirecionamento ainda acontece, com um piscar da página de início.
- Primeiro passo da fase: validar no Firefox que `regexSubstitution` se comporta como no Brave. Se não, o build do Firefox usa somente `webNavigation` (mais simples, com um piscar da página antes do redirect).

Aceite: no Brave e no Firefox, abrir um canal por link externo, por digitação e por clique interno leva à aba certa daquele canal. Clicar em "Início" dentro do canal funciona. Dois canais com preferências diferentes se comportam de forma independente.

### Fase 3: Dados e abas do canal

Tarefas:
- Content script lê nome, avatar, inscritos e total de vídeos.
- Content script lê quais abas o canal tem.
- Troca de mensagens com o popup; resposta controlada fora de página de canal.
- Fallback para `/videos` quando a aba escolhida não existe (regra 4 da seção 4). Só age na página que é a preferência do canal e só quando a lista de abas lida tem ao menos duas abas e inclui Vídeos, para nunca desviar por causa de uma leitura incompleta.
- Os números aparecem como o YouTube escreve (por exemplo "1,2 mi de inscritos"), já no idioma da pessoa. A extensão não converte nem recalcula nada.
- Fonte dos dados: o JSON `ytInitialData` da página (nome, avatar, inscritos, vídeos e lista de abas). Numa navegação interna, em que a página ainda tem os dados do canal anterior, a extensão baixa a página do canal e lê o mesmo JSON.

Aceite: em canais com e sem Podcasts, Cursos, Loja e Ao vivo, a lista de abas detectada está certa, o fallback leva a Vídeos sem loop e não há erro no console.

### Fase 4: Popup (UI)

Estrutura de cima para baixo, com `Separator` do shadcn entre cada bloco:

1. Header: avatar e nome do canal, duas `Badge` (inscritos e vídeos), ícones lucide-react.
2. Main: lista de páginas do canal atual, cada item com ícone, rótulo e `Switch`. Padrão sempre visíveis, opcionais só se detectadas. Só um ativo por vez (ligar um desliga o outro; tentar desligar o único ativo não faz nada).
3. Footer: texto curto de como a extensão funciona e link com seu nome para o repositório no GitHub (valores vindos de `lib/author.ts`).

Textos vêm de `_locales`. Estados cobertos: popup aberto fora de um canal, carregando, erro ao ler o canal.

Detalhes de implementação:
- Componentes `Separator`, `Switch` e `Badge` do shadcn em `components/ui`. O `Badge` não tem `asChild`, porque nada no popup precisa dele.
- Quando a preferência salva é de uma aba que o canal não tem, o popup mostra Vídeos ligado (é para onde a extensão leva), sem apagar a preferência.
- Os testes e2e abrem `popup.html?tab=ID` numa aba comum, porque o Playwright não clica no ícone da extensão. Sem `?tab`, o popup usa a aba ativa.

Aceite: os três blocos renderizados conforme o desenho, escolha persistida por canal ao fechar e reabrir, navegação por teclado nos switches, textos em português e em inglês conforme o navegador.

### Fase 5: Testes de integração e e2e

Tarefas:
- Componentes com React Testing Library: exclusividade dos switches, itens opcionais, estado vazio.
- Playwright em Chromium carregando a extensão: redirecionamento por URL direta, por clique interno e fallback para Vídeos.
- Mock de `chrome.*` nos testes unitários.
- Checklist manual escrito para Brave e Firefox (o Playwright não cobre extensões no Firefox).

Aceite: `pnpm test` e `pnpm test:e2e` verdes; checklist manual executado nos dois navegadores.

### Fase 6: CI e release

Tarefas:
- GitHub Actions em PRs e em `main`: instalar, lint, typecheck, test, build Chromium e build Firefox.
- Workflow de release por tag: gera os dois `.zip` e anexa ao release.
- CHANGELOG e README completo (instalação em modo desenvolvedor nos dois navegadores, uso, desenvolvimento, contribuição).

Aceite: PR de teste passa no CI; tag `v0.1.0` gera release com os dois `.zip`.

### Fase 7 (opcional): Publicação

Chrome Web Store (que o Brave também usa) e Firefox Add-ons: ícones, descrição, política de privacidade (a extensão não coleta dados), capturas de tela.

## 7. Fora de escopo da v1

- Preferência global ou "padrão geral" configurável (o padrão é fixo em Vídeos).
- Sincronização entre navegadores e exportar/importar preferências.
- Canais por URL antiga (`/c/nome`, `/user/nome`, `/channel/UC...`).
- `youtube.com` sem `www` e `m.youtube.com`.
- Qualquer coleta de dados ou servidor próprio.

## 8. Riscos

- O YouTube muda o DOM com frequência. A leitura de dados e de abas (fase 3) é a parte mais frágil, e o fallback para Vídeos depende dela. O redirecionamento em si depende só da URL e é estável.
- Recarregar a página (F5) em "Início" por escolha explícita redireciona de novo, porque a regra de carga completa não conhece o histórico da aba. Para canais com preferência `home` isso não acontece, pois eles têm regra de permitir. A limitação vale só para canais em Vídeos ou outra aba que o usuário abriu manualmente em Início.
- Com `storage.local`, as preferências ficam em cada navegador separadamente. `storage.sync` tem limites de tamanho e de quantidade de itens que não combinam com um mapa que cresce a cada canal.
- Detectar a aba inexistente só acontece depois que a página carrega, então no primeiro acesso a um canal sem a aba há um redirecionamento a mais.
- O `declarativeNetRequest` no Firefox foi confirmado na fase 2: o redirecionamento acontece direto, sem piscar.

## 9. Dados do rodapé (recebidos)

- Nome: Jonatas Melo Silva
- Link: https://github.com/jonatas-melo-silva/channel-landing

Ficam em `lib/author.ts`. Sem pendências abertas, falta apenas a aprovação para iniciar a fase 0.
