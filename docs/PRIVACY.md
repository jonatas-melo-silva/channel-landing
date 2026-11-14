# Política de privacidade

Channel Landing não coleta, não vende e não envia dados seus para ninguém. Não há conta, servidor próprio, analytics nem rastreamento.

## O que a extensão guarda

Apenas a página que você escolheu para cada canal, por exemplo `@kipperdev` e `streams`. Isso fica em `storage.local` do seu navegador, no seu computador. A extensão não sincroniza esses dados e nenhum outro lugar os recebe.

Para apagar, escolha Vídeos no popup do canal (isso remove a entrada dele) ou desinstale a extensão (isso remove tudo).

## O que a extensão lê

- O endereço das abas em `www.youtube.com`, para saber quando você entra no perfil de um canal. Endereços de outros sites não são lidos.
- Na página do canal, o nome, o avatar, a contagem de inscritos e de vídeos e a lista de abas que o YouTube mostra. Esses dados aparecem no popup e não são guardados nem enviados.
- Para ler a lista de abas depois de uma navegação interna, a extensão faz uma requisição ao próprio `www.youtube.com`, com a sua sessão, como o navegador faria ao abrir a página. Nenhum outro endereço recebe requisições.

## O que a extensão não faz

- Não envia dados para servidores da extensão ou de terceiros.
- Não usa código remoto: todo o código está no pacote instalado.
- Não lê nem altera seu histórico, suas senhas ou o conteúdo de outros sites.

## Por que cada permissão existe

| Permissão                   | Motivo                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| `storage`                   | Guardar a página escolhida para cada canal.                                  |
| `declarativeNetRequest`     | Redirecionar ao abrir o canal, antes de a página de início aparecer.         |
| `webNavigation`             | Perceber quando você entra num canal clicando dentro do próprio YouTube.     |
| `scripting`                 | Trocar o endereço da aba, sem deixar a página de início no botão Voltar.     |
| `https://www.youtube.com/*` | Aplicar tudo isso somente no YouTube e ler os dados do canal mostrados nele. |

O navegador descreve `webNavigation` como "ler o histórico de navegação". A extensão usa essa permissão só para endereços de `www.youtube.com`.

## Contato

Dúvidas e pedidos: [issues do projeto](https://github.com/jonatas-melo-silva/channel-landing/issues). O código é aberto (licença MIT), então tudo o que está escrito aqui pode ser conferido no repositório.

Channel Landing não tem relação com o YouTube nem com o Google. YouTube é marca registrada do Google LLC.

---

# Privacy policy

Channel Landing does not collect, sell or send your data to anyone. There is no account, no server of its own, no analytics and no tracking.

## What the extension stores

Only the tab you chose for each channel, for example `@kipperdev` and `streams`. It is kept in your browser's `storage.local`, on your computer. The extension does not sync it and nothing else receives it.

To delete it, choose Videos in the channel's popup (this removes that channel's entry) or uninstall the extension (this removes everything).

## What the extension reads

- The address of tabs on `www.youtube.com`, to know when you open a channel profile. Addresses of other sites are not read.
- On the channel page, the name, avatar, subscriber and video counts and the list of tabs that YouTube shows. This appears in the popup and is neither stored nor sent anywhere.
- To read the tab list after in-site navigation, the extension makes a request to `www.youtube.com` itself, with your session, as the browser would when opening the page. No other address receives requests.

## What the extension does not do

- It does not send data to the extension's or any third party's servers.
- It does not use remote code: all code is in the installed package.
- It does not read or change your history, passwords or the content of other sites.

## Why each permission exists

| Permission                  | Reason                                                                   |
| --------------------------- | ------------------------------------------------------------------------ |
| `storage`                   | Store the tab chosen for each channel.                                   |
| `declarativeNetRequest`     | Redirect when a channel opens, before the home page appears.             |
| `webNavigation`             | Notice when you open a channel by clicking inside YouTube itself.        |
| `scripting`                 | Replace the tab address without leaving the home page behind Back.       |
| `https://www.youtube.com/*` | Apply all of this only on YouTube and read the channel data shown there. |

The browser describes `webNavigation` as "read your browsing history". The extension uses it only for `www.youtube.com` addresses.

## Contact

Questions and requests: [project issues](https://github.com/jonatas-melo-silva/channel-landing/issues). The code is open source (MIT), so everything stated here can be checked in the repository.

Channel Landing is not affiliated with YouTube or Google. YouTube is a trademark of Google LLC.
