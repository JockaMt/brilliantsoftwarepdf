#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script simplificado para compilação durante desenvolvimento.
"""

import subprocess
import sys
import os
from pathlib import Path

def simple_build():
    """Build simplificado sem logs excessivos"""
    try:
        script_dir = Path(__file__).parent
        scripts_dir = script_dir / "scripts"
        pdf_script = scripts_dir / "pdf_generator.py"
        
        if not pdf_script.exists():
            return False
        
        # Verificar se executável já existe e está atualizado
        exe_name = "pdf_generator.exe" if os.name == 'nt' else "pdf_generator"
        exe_path = scripts_dir / exe_name
        
        if exe_path.exists():
            script_time = pdf_script.stat().st_mtime
            exe_time = exe_path.stat().st_mtime
            
            # Se exe é mais novo que script, não recompilar
            if exe_time > script_time:
                print("Executável já está atualizado")
                return True
        
        print("Recompilando...")
        
        # Comando PyInstaller simplificado
        cmd = [
            sys.executable, "-m", "PyInstaller",
            "--onefile",
            "--noconsole", 
            "--clean",
            "--noconfirm",
            "--distpath", str(scripts_dir),
            "--workpath", str(script_dir / "build"),
            "--specpath", str(script_dir / "build"),
            "--name", "pdf_generator",
            str(pdf_script)
        ]
        
        # Executar sem logs
        result = subprocess.run(
            cmd,
            cwd=str(script_dir),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if result.returncode == 0:
            print("Compilação OK")
            return True
        else:
            print(f"Erro: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Erro: {e}")
        return False

if __name__ == "__main__":
    success = simple_build()
    sys.exit(0 if success else 1)
