# Como lançar uma versão

O release sai sozinho quando uma tag `vX.Y.Z` é publicada. O workflow [release.yml](../.github/workflows/release.yml) confere a versão, roda lint, tipos e testes, gera os zips e cria o release no GitHub com eles anexados.

1. Com a `main` atualizada e o CI verde, mude `version` no `package.json` (a versão do manifest sai dela).
2. No `CHANGELOG.md`, troque "ainda sem data" pela data do dia e confira a lista de mudanças.
3. Faça o commit e abra o PR, como em qualquer outra mudança:

   ```bash
   git checkout -b chore/versao-0.1.0
   git add package.json CHANGELOG.md
   git commit -m "chore: versão 0.1.0"
   ```

4. Depois do merge, crie a tag na `main` e envie:

   ```bash
   git checkout main && git pull
   git tag v0.1.0
   git push origin v0.1.0
   ```

5. Em Actions, acompanhe o workflow Release. No fim, a página de Releases tem `channel-landing-0.1.0-chrome.zip`, `channel-landing-0.1.0-firefox.zip` e `channel-landing-0.1.0-sources.zip`. O zip de código-fonte é o que o Firefox Add-ons pede.

Se a tag não bater com a versão do `package.json`, o workflow falha no primeiro passo sem criar nada. Para refazer, apague a tag (`git push origin :refs/tags/v0.1.0` e `git tag -d v0.1.0`), corrija e crie de novo.
