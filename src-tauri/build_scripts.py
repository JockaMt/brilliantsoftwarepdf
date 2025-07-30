#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para compilar o gerador PDF Python para executável durante o build.
Este script é executado automaticamente pelo build.rs do Tauri.
"""

import subprocess
import sys
import os
import shutil
from pathlib import Path

# Configurar encoding para evitar problemas com emojis
if os.name == 'nt':  # Windows
    import locale
    locale.setlocale(locale.LC_ALL, '')

def install_pyinstaller():
    """Instala PyInstaller se não estiver disponível"""
    try:
        import PyInstaller
        print("PyInstaller já está instalado")
        return True
    except ImportError:
        print("Instalando PyInstaller...")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "pyinstaller"
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("PyInstaller instalado com sucesso")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Erro ao instalar PyInstaller: {e}")
            return False

def compile_pdf_generator():
    """Compila o gerador PDF para executável"""
    script_dir = Path(__file__).parent
    scripts_dir = script_dir / "scripts"
    pdf_script = scripts_dir / "pdf_generator.py"
    
    if not pdf_script.exists():
        print(f"Script não encontrado: {pdf_script}")
        return False
    
    # Verificar se executável já existe e remover para forçar recompilação
    exe_name = "pdf_generator.exe" if os.name == 'nt' else "pdf_generator"
    exe_path = scripts_dir / exe_name
    
    if exe_path.exists():
        print(f"Removendo executável anterior: {exe_path}")
        try:
            exe_path.unlink()
        except Exception as e:
            print(f"Aviso: Não foi possível remover executável anterior: {e}")
    
    print("Compilando gerador PDF...")
    
    try:
        # Comando PyInstaller otimizado para rebuild
        cmd = [
            sys.executable, "-m", "PyInstaller",
            "--onefile",                              # Arquivo único
            "--noconsole",                           # Sem janela de console  
            "--clean",                               # Limpar cache anterior
            "--noconfirm",                           # Não confirmar sobrescrita
            "--distpath", str(scripts_dir),          # Output no scripts/
            "--workpath", str(script_dir / "build"), # Temp build files
            "--specpath", str(script_dir / "build"), # Spec file location
            "--name", "pdf_generator",               # Nome do executável
            str(pdf_script)                          # Script source
        ]
        
        # Executar PyInstaller
        print("Executando PyInstaller...")
        result = subprocess.run(
            cmd,
            cwd=str(script_dir),
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Verificar se o executável foi criado
            exe_name = "pdf_generator.exe" if os.name == 'nt' else "pdf_generator"
            exe_path = scripts_dir / exe_name
            
            if exe_path.exists():
                print(f"Executável criado: {exe_path}")
                file_size = exe_path.stat().st_size / (1024*1024)
                print(f"Tamanho: {file_size:.1f} MB")
                
                # Limpar arquivos de build temporários
                cleanup_build_files(script_dir)
                return True
            else:
                print(f"Executável não encontrado: {exe_path}")
                # Ainda assim limpar os arquivos temporários
                cleanup_build_files(script_dir)
                return False
        else:
            print(f"Erro no PyInstaller: {result.stderr}")
            # Limpar arquivos temporários mesmo em caso de erro
            cleanup_build_files(script_dir)
            return False
            
    except FileNotFoundError:
        print("PyInstaller não encontrado no PATH")
        return False
    except Exception as e:
        print(f"Erro inesperado: {e}")
        return False

def cleanup_build_files(script_dir):
    """Remove arquivos temporários de build"""
    build_dir = script_dir / "build"
    if build_dir.exists():
        try:
            shutil.rmtree(build_dir)
            print("Arquivos temporários removidos")
        except Exception as e:
            print(f"Não foi possível remover build files: {e}")

def check_dependencies():
    """Verifica se as dependências Python estão instaladas"""
    required_packages = ["reportlab", "Pillow"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Instalando dependências: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install"
            ] + missing_packages, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("Dependências instaladas")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Erro ao instalar dependências: {e}")
            return False
    else:
        print("Todas as dependências estão instaladas")
        return True

def main():
    """Função principal"""
    try:
        print("Iniciando compilação do gerador PDF...")
        
        # Verificar Python
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        print(f"Python: {python_version}")
        
        # Verificar se estamos sendo executados pelo build do Rust
        is_rust_build = os.environ.get('CARGO_MANIFEST_DIR') is not None
        if is_rust_build:
            print("Executado pelo build do Rust")
        
        # Verificar e instalar dependências
        if not check_dependencies():
            print("ERRO: Falha ao verificar/instalar dependências")
            return 1
        
        # Instalar PyInstaller
        if not install_pyinstaller():
            print("ERRO: Falha ao instalar PyInstaller")
            return 1
        
        # Compilar o gerador PDF
        if not compile_pdf_generator():
            print("ERRO: Falha na compilação")
            return 1
        
        print("Compilação concluída com sucesso!")
        return 0
        
    except Exception as e:
        print(f"ERRO CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
