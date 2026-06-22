#!/usr/bin/env bash
# Regenera galeria-dados.js a partir das imagens em img/galeria-analise-conteudo/
# Converte HEIC para JPG automaticamente (se houver ferramenta disponível).
# Uso:  bash atualizar-galeria.sh
set -e
cd "$(dirname "$0")"
DIR="img/galeria-analise-conteudo"
OUT="galeria-dados.js"

# 1) Converter HEIC -> JPG, se existirem
shopt -s nullglob nocaseglob
for h in "$DIR"/*.heic; do
  base="${h%.*}"
  if [ ! -f "$base.jpg" ]; then
    if command -v heif-convert >/dev/null 2>&1; then
      heif-convert "$h" "$base.jpg" >/dev/null 2>&1 && echo "convertido: $(basename "$h")"
    elif command -v magick >/dev/null 2>&1; then
      magick "$h" "$base.jpg" && echo "convertido: $(basename "$h")"
    elif command -v sips >/dev/null 2>&1; then
      sips -s format jpeg "$h" --out "$base.jpg" >/dev/null 2>&1 && echo "convertido: $(basename "$h")"
    fi
  fi
done
shopt -u nocaseglob

# 2) Gerar a lista (apenas formatos web; ignora HEIC e LEIA-ME)
{
  echo "/* Lista de imagens da galeria \"Análise de Conteúdo\". Gerada por atualizar-galeria.sh */"
  echo "window.GALERIA_ANALISE = ["
  found=0
  # ordenar por nome; usar while-read para suportar espaços
  find "$DIR" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) \
    | sort | while IFS= read -r f; do
      name="$(basename "$f")"
      # sem legenda por defeito (galeria limpa)
      printf '  { "src": "%s/%s", "leg": "" },\n' "$DIR" "$name"
    done
  echo "];"
} > "$OUT"

n=$(grep -c '"src"' "$OUT" || true)
echo "Atualizado $OUT — $n imagem(ns)."
