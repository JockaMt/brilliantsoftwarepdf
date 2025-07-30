#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar se a recompilação automática está funcionando.
Compara timestamps e verifica se o executável é atualizado.
"""

import os
import time
from pathlib import Path
from datetime import datetime

def check_auto_rebuild():
    """Verifica o sistema de auto rebuild"""
    src_tauri = Path("src-tauri")
    
    # Arquivos para monitorar
    py_script = src_tauri / "scripts" / "pdf_generator.py"
    exe_file = src_tauri / "scripts" / "pdf_generator.exe"
    
    print("🔍 Verificando Sistema de Auto-Rebuild")
    print("=" * 50)
    
    # Verificar se arquivos existem
    if not py_script.exists():
        print(f"❌ Script Python não encontrado: {py_script}")
        return False
    
    if not exe_file.exists():
        print(f"⚠️  Executável não encontrado: {exe_file}")
        print("Execute um build primeiro para gerar o executável")
        return False
    
    # Obter timestamps
    py_time = py_script.stat().st_mtime
    exe_time = exe_file.stat().st_mtime
    
    py_dt = datetime.fromtimestamp(py_time)
    exe_dt = datetime.fromtimestamp(exe_time)
    
    print(f"📝 Script Python: {py_dt.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"⚙️  Executável:    {exe_dt.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Verificar se exe é mais novo que script
    if exe_time >= py_time:
        age_diff = exe_time - py_time
        print(f"✅ Executável está atualizado (+{age_diff:.0f}s)")
        
        # Verificar tamanho do executável
        exe_size = exe_file.stat().st_size / (1024*1024)
        print(f"📊 Tamanho do executável: {exe_size:.1f} MB")
        
        if exe_size > 15:  # Executável compilado deve ter pelo menos 15MB
            print("✅ Tamanho indica compilação completa")
            return True
        else:
            print("⚠️  Tamanho muito pequeno, pode não estar compilado corretamente")
            return False
    else:
        age_diff = py_time - exe_time
        print(f"❌ Executável desatualizado (-{age_diff:.0f}s)")
        print("💡 Execute um build para recompilar")
        return False

def simulate_change_and_test():
    """Simula uma mudança no script e verifica se rebuild funciona"""
    src_tauri = Path("src-tauri")
    py_script = src_tauri / "scripts" / "pdf_generator.py"
    
    if not py_script.exists():
        print("❌ Script Python não encontrado para teste")
        return False
    
    print("\n🧪 Testando Auto-Rebuild")
    print("=" * 30)
    
    # Backup do timestamp original
    original_time = py_script.stat().st_mtime
    
    # Simular mudança (touch file)
    print("📝 Simulando mudança no script...")
    py_script.touch()
    
    new_time = py_script.stat().st_mtime
    print(f"⏰ Timestamp atualizado: {datetime.fromtimestamp(new_time).strftime('%H:%M:%S')}")
    
    print("💡 Execute 'npm run tauri build' para ver auto-rebuild em ação")
    print("📋 Logs esperados:")
    print("   🔄 Recompilando scripts Python...")
    print("   🐍 Executando compilação Python...")
    print("   ✅ Scripts Python compilados com sucesso")
    
    return True

def main():
    """Função principal"""
    print("🔄 Sistema de Auto-Rebuild - Verificação")
    print("========================================\n")
    
    # Verificar estado atual
    current_ok = check_auto_rebuild()
    
    # Teste de simulação
    simulate_change_and_test()
    
    print("\n📚 Como funciona:")
    print("1. build.rs monitora mudanças em pdf_generator.py")
    print("2. A cada build, executa build_scripts.py")
    print("3. build_scripts.py remove exe anterior e recompila")
    print("4. Novo executável é incluído no bundle final")
    
    print("\n🔧 Comandos úteis:")
    print("npm run tauri build  # Build completo com auto-rebuild")
    print("npm run tauri dev    # Dev com auto-rebuild") 
    print("python test_build.py # Teste isolado da compilação")
    
    return current_ok

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
