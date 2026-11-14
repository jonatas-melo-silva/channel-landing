# Textos para as lojas

Tudo o que as lojas pedem no formulário de envio, pronto para copiar. O ícone da loja é `icone-loja-128.png` (arte de 96 px com margem transparente de 16 px, como a Chrome Web Store pede). O desenho original é `icone.svg`.

## Dados básicos

| Campo                   | Valor                                                                           |
| ----------------------- | ------------------------------------------------------------------------------- |
| Nome                    | Channel Landing                                                                 |
| Categoria sugerida      | Produtividade (Chrome) / Social e comunicação ou Outros (Firefox)               |
| Idiomas                 | Inglês (padrão) e português do Brasil                                           |
| Política de privacidade | https://github.com/jonatas-melo-silva/channel-landing/blob/main/docs/PRIVACY.md |
| Site e suporte          | https://github.com/jonatas-melo-silva/channel-landing e a aba de issues         |
| Licença (Firefox)       | MIT                                                                             |

## Resumo curto (até 132 caracteres)

Inglês:

> Opens the tab you choose (Videos, Live, Playlists...) when you visit a YouTube channel. One preference per channel.

Português:

> Abre a aba que você escolher (Vídeos, Ao vivo, Playlists...) ao entrar em um canal do YouTube. Uma preferência por canal.

São os mesmos textos de `extDescription` em `public/_locales`.

## Descrição detalhada

Inglês:

```text
Channel Landing opens the tab you prefer when you visit a YouTube channel.

By default YouTube opens a channel's Home page. With this extension, https://www.youtube.com/@handle goes straight to /@handle/videos, or to any other tab you picked for that channel.

How it works
- Open a channel and click the extension icon.
- Choose the tab that channel should open on: Home, Videos, Live, Playlists, Posts and, when the channel has them, Podcasts, Courses or Store.
- Each channel remembers its own choice. Channels you never configured open on Videos.
- If the chosen tab does not exist on a channel, Videos opens instead.
- Clicking Home inside a channel is respected, so you can still see it when you want.

Private by design
- No account, no tracking, no analytics, no remote code.
- The only thing stored is the tab chosen for each channel, in your browser.
- It only runs on www.youtube.com.

Channel Landing is open source (MIT): https://github.com/jonatas-melo-silva/channel-landing
Not affiliated with YouTube or Google. YouTube is a trademark of Google LLC.
```

Português:

```text
O Channel Landing abre a aba que você prefere quando você entra em um canal do YouTube.

Por padrão o YouTube abre o Início do canal. Com a extensão, https://www.youtube.com/@canal leva direto para /@canal/videos, ou para qualquer outra aba que você tenha escolhido para aquele canal.

Como funciona
- Abra um canal e clique no ícone da extensão.
- Escolha a aba em que aquele canal deve abrir: Início, Vídeos, Ao vivo, Playlists, Posts e, quando o canal tiver, Podcasts, Cursos ou Loja.
- Cada canal guarda a própria escolha. Canais que você nunca configurou abrem em Vídeos.
- Se a aba escolhida não existir em um canal, abre Vídeos.
- Clicar em Início dentro de um canal é respeitado, então você ainda vê o Início quando quiser.

Privado por construção
- Sem conta, sem rastreamento, sem analytics, sem código remoto.
- O único dado guardado é a aba escolhida para cada canal, no seu navegador.
- Só funciona em www.youtube.com.

O Channel Landing tem código aberto (MIT): https://github.com/jonatas-melo-silva/channel-landing
Sem relação com o YouTube ou o Google. YouTube é marca registrada do Google LLC.
```

## Chrome Web Store: aba Práticas de privacidade

Finalidade única:

> Open the tab the user chose for each YouTube channel when a channel profile is visited.

Justificativa de cada permissão (o painel pede uma por permissão):

| Permissão                        | Justificativa                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `storage`                        | Stores the tab the user picked for each channel, locally in the browser.                                                                                                                         |
| `declarativeNetRequest`          | Redirects the channel profile URL to the chosen tab before the page loads, so the Home page does not flash.                                                                                      |
| `webNavigation`                  | Detects in-site navigation inside YouTube (which does not reload the page) so the redirect also works when the user clicks a channel inside YouTube.                                             |
| `scripting`                      | Replaces the tab address with `location.replace`, so the Home page does not stay in the Back button history.                                                                                     |
| Host `https://www.youtube.com/*` | The extension only works on YouTube. It reads the channel name, avatar, counts and tab list from the page to show them in the popup and to fall back to Videos when a chosen tab does not exist. |

Código remoto: **não** (todo o código está no pacote).

Uso de dados: não coleta nenhuma das categorias listadas. Marque as três declarações de conformidade: não vende dados a terceiros, não usa nem transfere dados para fins alheios à finalidade única e não usa nem transfere dados para avaliar crédito ou empréstimo.

## Firefox Add-ons (AMO)

- Resumo (até 250 caracteres): use o resumo curto acima.
- Descrição: use a descrição detalhada acima.
- Permissões de dados: o `manifest` já declara `data_collection_permissions: { required: ['none'] }`.
- Código-fonte: obrigatório, porque o build é empacotado (ver [guia-de-envio.md](guia-de-envio.md)).
- Notas para o revisor:

```text
The extension needs no account. To test: install it, open any channel such as
https://www.youtube.com/@kipperdev, and it lands on /videos. Click the toolbar icon on a
channel page, switch the toggle to "Live", close the popup and open the channel again from a
link: it opens /streams. Channels without Podcasts, Courses or Store do not show those
toggles. Build steps are in the README of the source package ("Gerar os arquivos para publicação").
```

## Capturas de tela

A Chrome Web Store exige ao menos 1 (até 5) de 1280x800 px, com cantos retos e sem margem. O `pnpm screenshots` gera as imagens em `docs/publicacao/capturas` (ver o guia). Sugestão de ordem: popup de um canal completo, popup de um canal básico, popup fora de um canal.
