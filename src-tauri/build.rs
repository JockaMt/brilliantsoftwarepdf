use std::process::Command;
use std::env;
use std::path::Path;

fn main() {
    // Em desenvolvimento, não recompilar automaticamente para evitar loops
    let profile = env::var("PROFILE").unwrap_or_default();
    let is_dev = profile == "debug";
    
    if !is_dev {
        // Compilar scripts Python apenas durante build de release
        compile_python_scripts();
    } else {
        println!("cargo:warning=ℹ️  Modo dev: Use 'python simple_build.py' se precisar recompilar Python");
    }
    
    tauri_build::build()
}

fn compile_python_scripts() {
    println!("cargo:rerun-if-changed=scripts/pdf_generator.py");
    println!("cargo:rerun-if-changed=simple_build.py");
    
    let _out_dir = env::var("OUT_DIR").unwrap();
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    
    println!("cargo:warning=� Recompilando scripts Python...");
    
    // Verificar se Python está disponível
    let python_cmd = if cfg!(target_os = "windows") {
        "python"
    } else {
        "python3"
    };
    
    // Usar script simplificado para evitar loops
    let build_script = Path::new(&manifest_dir).join("simple_build.py");
    if !build_script.exists() {
        println!("cargo:warning=❌ simple_build.py não encontrado");
        return;
    }
    
    // Executar script de compilação Python
    println!("cargo:warning=🐍 Executando compilação Python...");
    let output = Command::new(python_cmd)
        .arg(build_script)
        .current_dir(&manifest_dir)
        .output();
    
    match output {
        Ok(output) => {
            if output.status.success() {
                println!("cargo:warning=✅ Scripts Python compilados com sucesso");
                
                // Mostrar output do script
                if !output.stdout.is_empty() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    for line in stdout.lines().take(5) { // Limitar para evitar spam
                        println!("cargo:warning=📄 {}", line);
                    }
                }
            } else {
                println!("cargo:warning=❌ Erro na compilação dos scripts Python");
                
                // Mostrar stderr detalhado
                if !output.stderr.is_empty() {
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    for line in stderr.lines().take(10) { // Mostrar mais linhas de erro
                        println!("cargo:warning=🔴 {}", line);
                    }
                }
                
                // Mostrar stdout também pode ter informações úteis
                if !output.stdout.is_empty() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    for line in stdout.lines().take(5) {
                        println!("cargo:warning=🟡 {}", line);
                    }
                }
                
                // Não falhar o build, apenas avisar
                println!("cargo:warning=⚠️ Build continuará sem scripts compilados");
            }
        }
        Err(e) => {
            println!("cargo:warning=❌ Erro ao executar Python: {}", e);
            println!("cargo:warning=💡 Certifique-se de que Python está instalado e no PATH");
            println!("cargo:warning=💡 Ou compile manualmente: python test_build.py");
            println!("cargo:warning=⚠️ Build continuará sem scripts compilados");
        }
    }
}
