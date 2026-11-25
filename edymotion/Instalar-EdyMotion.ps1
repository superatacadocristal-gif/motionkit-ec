param([string]$InstallDir = (Join-Path $env:APPDATA 'EffectCraft\Scripts\ScriptUI Panels'))
$ErrorActionPreference = 'Stop'
try {
    $source = Join-Path $PSScriptRoot 'EdyMotion.jsx'
    $content = Get-Content -LiteralPath $source -Raw -Encoding UTF8
    if ($content -notmatch 'EdyMotion (\d+\.\d+\.\d+-beta)') { throw 'Arquivo EdyMotion.jsx invalido.' }
    $version = $Matches[1]
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    $destination = Join-Path $InstallDir 'EdyMotion.jsx'
    if (Test-Path -LiteralPath $destination) {
        $backupDir = Join-Path (Split-Path $InstallDir -Parent) 'EdyMotion Backups'
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Copy-Item -LiteralPath $destination -Destination (Join-Path $backupDir ('EdyMotion-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.jsx'))
    }
    $temporary = Join-Path $InstallDir ('EdyMotion-' + [Guid]::NewGuid().ToString('N') + '.tmp')
    Copy-Item -LiteralPath $source -Destination $temporary
    if ((Get-FileHash -LiteralPath $temporary).Hash -ne (Get-FileHash -LiteralPath $source).Hash) { throw 'Falha ao verificar copia.' }
    Move-Item -LiteralPath $temporary -Destination $destination -Force
    Write-Host "EdyMotion $version instalado. EdyTools preservado." -ForegroundColor Green
    Write-Host 'Reabra o EffectCraft e escolha Janela > EdyMotion.jsx.'
    exit 0
} catch { Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }
