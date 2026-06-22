# filipatorres.pt — Portefólio de Estágio

Site estático do portefólio de estágio do Mestrado em Ensino de Artes Visuais
(MEAV, Universidade do Minho) — «Corpo Presente/Ausente: o desenho da figura
humana como prática de atenção, cidadania e relação com o outro».
Autora: Maria Filipa Vaz Torres.

## Estrutura

- `site/` — o site publicado (HTML, CSS, JS, imagens e materiais).
  - `index.html` — página inicial (portefólio resumido por secções).
  - `pip.html` — Projeto de Intervenção Pedagógica.
  - `vitrais.html` — Projeto dos Vitrais.
  - `questionario.html` — resultados do questionário final.
  - `style.css`, `app.js` — estilo e comportamento partilhados.
  - `materiais/` — PDFs e ficheiros descarregáveis.
  - `img/` — imagens, miniaturas e galerias.
  - `vendor/` — bibliotecas locais (Chart.js).
- `data/` — ficheiros-fonte originais (documento do portefólio, PDFs, figuras).

## Ver localmente

O site usa caminhos relativos e alguns recursos (vídeo do YouTube, gráficos)
precisam de ser servidos por HTTP. A partir da pasta `site/`:

```bash
cd site
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicação (GitHub Pages)

Nas definições do repositório → Pages, escolher a branch `main` e a pasta `/site`
como origem. O domínio próprio é **corpopresenteausente.me** (ficheiro `site/CNAME`).

No registador do domínio, apontar para o GitHub Pages:
- Registos `A` do apex (`corpopresenteausente.me`) → `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- Registo `CNAME` de `www` → `<utilizador>.github.io`.

Depois, em Settings → Pages, ativar «Enforce HTTPS».

## Atualizar a galeria «Análise de Conteúdo»

Colocar imagens em `site/img/galeria-analise-conteudo/` e correr:

```bash
cd site
bash atualizar-galeria.sh
```
