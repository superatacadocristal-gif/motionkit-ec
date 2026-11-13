param([string]$InstallDir = (Join-Path $env:APPDATA 'EffectCraft\Scripts\ScriptUI Panels'))
$ErrorActionPreference = 'Stop'
try {
    $source = Join-Path $PSScriptRoot 'EdyTools.jsx'
    $content = Get-Content -LiteralPath $source -Raw -Encoding UTF8
    if ($content -notmatch 'EdyTools (\d+\.\d+\.\d+-beta)') { throw 'Arquivo EdyTools.jsx invalido.' }
    $version = $Matches[1]
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    $destination = Join-Path $InstallDir 'EdyTools.jsx'
    if (Test-Path -LiteralPath $destination) {
        $backupDir = Join-Path (Split-Path $InstallDir -Parent) 'EdyTools Backups'
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
        Copy-Item -LiteralPath $destination -Destination (Join-Path $backupDir "EdyTools-$stamp.jsx") -ErrorAction Stop
    }
    $temporary = Join-Path $InstallDir ('EdyTools-' + [Guid]::NewGuid().ToString('N') + '.tmp')
    Copy-Item -LiteralPath $source -Destination $temporary -ErrorAction Stop
    if ((Get-FileHash -LiteralPath $temporary).Hash -ne (Get-FileHash -LiteralPath $source).Hash) { throw 'Falha ao verificar a copia.' }
    Move-Item -LiteralPath $temporary -Destination $destination -Force -ErrorAction Stop
    Write-Host "EdyTools $version instalado." -ForegroundColor Green
    Write-Host 'Reabra o EffectCraft e escolha Janela > EdyTools.jsx.'
    exit 0
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
