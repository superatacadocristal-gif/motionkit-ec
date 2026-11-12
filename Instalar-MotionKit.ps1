# MotionKit EC 0.8.1-beta - instalador local
# Autor: Edy Bastos, 11/2026
# Nao requer administrador e nao acessa a internet.
$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'MotionKit EC.jsx'
$dest = Join-Path $env:APPDATA 'EffectCraft\Scripts\ScriptUI Panels'
$backups = Join-Path $dest '_MotionKit_Backups'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
try {
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Arquivo 'MotionKit EC.jsx' nao encontrado ao lado do instalador." }
    $content = Get-Content -LiteralPath $source -Raw -Encoding UTF8
    if ($content -notmatch 'MotionKit EC 0\.8\.1-beta') { throw 'Este pacote nao contem a versao 0.8.1-beta esperada.' }
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    New-Item -ItemType Directory -Path $backups -Force | Out-Null
    $oldFiles = @(Get-ChildItem -LiteralPath $dest -File -Filter '*.jsx' | Where-Object {
        $_.Name -match '^(?i:MotionKit)(?:\s|%20|_|-).*\.jsx$'
    })
    foreach ($file in $oldFiles) {
        $backupName = ($file.BaseName + '-' + $stamp + $file.Extension)
        Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $backups $backupName) -Force
    }
    Copy-Item -LiteralPath $source -Destination (Join-Path $dest 'MotionKit EC.jsx') -Force
    foreach ($file in $oldFiles) {
        if ($file.Name -ne 'MotionKit EC.jsx') { Remove-Item -LiteralPath $file.FullName -Force }
    }
    $installed = Join-Path $dest 'MotionKit EC.jsx'
    if ((Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash) {
        throw 'Falha na verificacao do arquivo instalado.'
    }
    Write-Host 'MotionKit EC 0.8.1-beta instalado com sucesso!' -ForegroundColor Green
    Write-Host ('Pasta: ' + $dest)
    Write-Host ('Backups: ' + $backups)
    Write-Host 'Abra o EffectCraft > Janela (Window) > MotionKit EC.jsx.'
    exit 0
} catch {
    Write-Host ('ERRO: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
