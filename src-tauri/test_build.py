#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar a compilação Python localmente.
"""

import subprocess
import sys
import os
from pathlib import Path

def test_compilation():
    """Testa a compilação do gerador PDF"""
    script_dir = Path(__file__).parent
    build_script = script_dir / "build_scripts.py"
    
    if not build_script.exists():
        print("❌ build_scripts.py não encontrado")
        return False
    
    print("🔧 Testando compilação Python...")
    
    try:
        result = subprocess.run([
            sys.executable, str(build_script)
        ], cwd=str(script_dir), capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Compilação bem-sucedida!")
            print("Output:")
            print(result.stdout)
            
            # Verificar se o executável foi criado
            scripts_dir = script_dir / "scripts"
            exe_name = "pdf_generator.exe" if os.name == 'nt' else "pdf_generator"
            exe_path = scripts_dir / exe_name
            
            if exe_path.exists():
                file_size = exe_path.stat().st_size / (1024*1024)
                print(f"📁 Executável criado: {exe_path}")
                print(f"📊 Tamanho: {file_size:.1f} MB")
                return True
            else:
                print("❌ Executável não encontrado após compilação")
                return False
        else:
            print("❌ Erro na compilação")
            print("Stderr:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Erro ao executar compilação: {e}")
        return False

if __name__ == "__main__":
    success = test_compilation()
    sys.exit(0 if success else 1)
