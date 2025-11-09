# Script para corrigir o problema de submódulo no Netlify
# Execute: .\fix-submodule.ps1

Write-Host "🔍 Verificando referências a submódulo..." -ForegroundColor Yellow

# Verificar se há referência no .git/config
$submoduleConfig = git config --file .git/config --get-regexp submodule 2>$null
if ($submoduleConfig) {
    Write-Host "⚠️  Encontradas referências a submódulo no .git/config" -ForegroundColor Red
    Write-Host $submoduleConfig
} else {
    Write-Host "✅ Nenhuma referência encontrada no .git/config" -ForegroundColor Green
}

# Verificar se gestao-final está no índice como submódulo
Write-Host "`n🔍 Verificando índice do Git..." -ForegroundColor Yellow
$gitIndex = git ls-files --stage | Select-String "gestao-final"
if ($gitIndex) {
    Write-Host "Encontrado no índice:" -ForegroundColor Yellow
    Write-Host $gitIndex
}

Write-Host "`n🔧 Removendo referências incorretas..." -ForegroundColor Yellow

# Remover do índice se estiver como submódulo
git rm --cached gestao-final 2>$null

# Remover do .git/config se existir
git config --file .git/config --remove-section submodule.gestao-final 2>$null

# Remover do .gitmodules se existir
if (Test-Path .gitmodules) {
    Write-Host "Removendo .gitmodules..." -ForegroundColor Yellow
    Remove-Item .gitmodules
    git add .gitmodules 2>$null
}

Write-Host "`n✅ Re-adicionando gestao-final como pasta normal..." -ForegroundColor Green
git add gestao-final/

Write-Host "`n📋 Status atual:" -ForegroundColor Yellow
git status --short

Write-Host "`n💡 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: git commit -m 'fix: Remover referência incorreta a submódulo gestao-final'" -ForegroundColor White
Write-Host "2. Execute: git push origin main" -ForegroundColor White
Write-Host "3. O Netlify fará um novo deploy automaticamente" -ForegroundColor White

