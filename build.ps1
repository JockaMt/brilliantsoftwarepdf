#!/usr/bin/env pwsh
# Build Script para Brilliant PDF
# Este script compila os componentes Python e depois o aplicativo Tauri

param(
    [switch]$Release,
    [switch]$CompileOnly,
    [switch]$SkipPython
)

Write-Host "🚀 Brilliant PDF Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Diretório base
$ProjectDir = Split-Path -Parent $PSScriptRoot
$TauriDir = Join-Path $ProjectDir "src-tauri"

# Função para log colorido
function Write-Status {
    param($Message, $Color = "White")
    Write-Host "  $Message" -ForegroundColor $Color
}

function Write-Step {
    param($Message)
    Write-Host "`n📋 $Message" -ForegroundColor Yellow
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Etapa 1: Verificar Python
if (-not $SkipPython) {
    Write-Step "Verificando Python"
    
    $PythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if (-not $PythonCmd) {
        Write-Error "Python não encontrado no PATH"
        Write-Status "Instale Python: https://python.org/downloads" -Color "Yellow"
        exit 1
    }
    
    $PythonVersion = & python --version
    Write-Success "Encontrado: $PythonVersion"
    
    # Etapa 2: Compilar scripts Python
    Write-Step "Compilando scripts Python"
    
    Push-Location $TauriDir
    try {
        $BuildScript = Join-Path $TauriDir "build_scripts.py"
        
        if (Test-Path $BuildScript) {
            Write-Status "Executando build_scripts.py..."
            
            $Result = & python $BuildScript
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Scripts Python compilados"
            } else {
                Write-Error "Falha na compilação Python"
                Write-Status "Output: $Result" -Color "Red"
                if (-not $CompileOnly) {
                    Write-Status "Continuando sem scripts compilados..." -Color "Yellow"
                }
            }
        } else {
            Write-Error "build_scripts.py não encontrado"
        }
    }
    finally {
        Pop-Location
    }
}

# Parar aqui se for apenas compilação
if ($CompileOnly) {
    Write-Success "Compilação Python concluída"
    exit 0
}

# Etapa 3: Build do Tauri
Write-Step "Building aplicativo Tauri"

Push-Location $ProjectDir
try {
    Write-Status "Instalando dependências npm..."
    & npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha na instalação das dependências"
        exit 1
    }
    
    Write-Status "Executando build do Tauri..."
    
    if ($Release) {
        & npm run tauri build
    } else {
        & npm run tauri dev
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build concluído com sucesso!"
        
        if ($Release) {
            $BundleDir = Join-Path $TauriDir "target\release\bundle"
            if (Test-Path $BundleDir) {
                Write-Step "Artefatos gerados:"
                Get-ChildItem $BundleDir -Recurse -File | Where-Object {
                    $_.Extension -in @('.exe', '.msi', '.sig')
                } | ForEach-Object {
                    $SizeMB = [math]::Round($_.Length / 1MB, 1)
                    $FileName = $_.Name
                    Write-Status "$FileName ($SizeMB MB)" -Color "Cyan"
                }
            }
        }
    } else {
        Write-Error "Falha no build do Tauri"
        exit 1
    }
}
finally {
    Pop-Location
}

Write-Host "`n🎉 Build finalizado!" -ForegroundColor Green
