# Changelog

Todas as mudanças relevantes do projeto ficam neste arquivo. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o [versionamento semântico](https://semver.org/lang/pt-BR/).

## [0.2.0] - 2026-11-25

### Alterado

- O popup lista as abas que o YouTube informa para o canal, na ordem dele, e não só as oito conhecidas. Abas como Shorts e Programas aparecem com o nome que o YouTube dá a elas e podem ser escolhidas como destino. A busca do canal não aparece.

### Corrigido

- Em canais que o YouTube mostra com endereço antigo, sem `@` (como `/adrenaline/videos`), clicar em Início levava de volta para Vídeos e a página inicial nunca carregava.

## [0.1.0] - 2026-11-14

Primeira versão.

### Adicionado

- Redirecionamento ao abrir o perfil de um canal do YouTube (`/@canal`) para a página escolhida, com Vídeos como padrão, por carga completa da página e por clique dentro do YouTube.
- Uma preferência por canal. Início, Vídeos, Ao vivo, Playlists e Posts sempre disponíveis; Podcasts, Cursos e Loja só nos canais que os têm.
- Fallback para Vídeos quando a página escolhida não existe no canal.
- Popup com avatar, nome, inscritos e total de vídeos do canal, um switch por página (só um ligado por vez) e rodapé com o link do projeto.
- Textos em português do Brasil e inglês.
- Funciona no Brave, Chrome e Firefox (Manifest V3).
- Ícone, política de privacidade e materiais para as lojas.
- Testes unitários, de componentes e e2e em Chromium real, e CI no GitHub Actions.
