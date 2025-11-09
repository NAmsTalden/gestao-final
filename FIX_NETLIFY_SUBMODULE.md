# 🔧 Correção do Erro de Submódulo no Netlify

## Problema

O Netlify está tentando tratar `gestao-final` como um submódulo Git, mas a configuração está faltando, causando o erro:

```
fatal: No url found for submodule path 'gestao-final' in .gitmodules
```

## Solução

Execute estes comandos no seu terminal para remover a referência ao submódulo:

### Passo 1: Verificar se há referência a submódulo

```powershell
# Verificar se há referência no .git/config
git config --file .git/config --get-regexp submodule

# Verificar se há no índice do Git
git ls-files --stage | Select-String "gestao-final"
```

### Passo 2: Remover a referência ao submódulo (se existir)

```powershell
# Remover do índice do Git
git rm --cached gestao-final

# Remover do .git/config se existir
git config --file .git/config --remove-section submodule.gestao-final 2>$null

# Adicionar a pasta normalmente
git add gestao-final/

# Fazer commit
git commit -m "fix: Remover referência incorreta a submódulo gestao-final"

# Push
git push origin main
```

### Passo 3: Alternativa - Se o problema persistir

Se ainda houver problemas, você pode:

1. **Remover a pasta do Git e readicionar:**
```powershell
git rm -r --cached gestao-final
git add gestao-final/
git commit -m "fix: Re-adicionar gestao-final como pasta normal, não submódulo"
git push origin main
```

2. **Ou verificar se há arquivo .git dentro de gestao-final:**
```powershell
# Se houver um .git dentro de gestao-final, remova-o
Remove-Item -Recurse -Force gestao-final\.git -ErrorAction SilentlyContinue
git add gestao-final/
git commit -m "fix: Remover .git interno de gestao-final"
git push origin main
```

## Verificação

Após fazer as correções, verifique:

```powershell
# Verificar se não há mais referências a submódulo
git config --file .git/config --get-regexp submodule

# Deve retornar vazio ou não encontrar nada
```

## Configuração do Netlify

Após corrigir, certifique-se de que no Netlify:

1. **Base directory** está configurado como `gestao-final` (se o projeto principal está lá)
2. Ou deixe vazio se o projeto está na raiz

Para verificar/alterar:
- No Netlify: **Site settings** > **Build & deploy** > **Build settings**
- Campo **Base directory**: `gestao-final` ou vazio

