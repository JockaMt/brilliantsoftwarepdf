use tauri::State;
use std::fs;
use std::sync::Mutex;
use rusqlite::Connection;

use crate::models::{section::Section, item::Item, info::Info};
use crate::db::{section_repository, item_repository, info_repository, settings_db, catalog_repository};
use crate::db::settings_db::UserSettings;
use crate::license::check_license_middleware;

pub struct DbConn(pub Mutex<Connection>);

#[tauri::command]
pub fn create_section(name: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    section_repository::insert_section(&conn, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_section(id: String, db: State<DbConn>) -> Result<Option<Section>, String> {
    let conn = db.0.lock().unwrap();
    section_repository::get_section(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_sections(db: State<DbConn>) -> Result<Vec<Section>, String> {
    let conn = db.0.lock().unwrap();
    section_repository::list_sections(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_section(uuid: String, name: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    section_repository::update_section(&conn, &uuid, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_section(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    section_repository::delete_section(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_section_by_name(name: String, db: State<DbConn>) -> Result<Option<Section>, String> {
    let conn = db.0.lock().unwrap();
    section_repository::get_section_by_name(&conn, &name).map_err(|e| e.to_string())
}

// Item handlers
#[tauri::command]
pub fn create_item(code: String, description: String, section_id: String, image_path: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    item_repository::insert_item(&conn, code, description, section_id, image_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_item(id: String, db: State<DbConn>) -> Result<Option<Item>, String> {
    let conn = db.0.lock().unwrap();
    item_repository::get_item(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_items(section_id: String, db: State<DbConn>) -> Result<Vec<Item>, String> {
    let conn = db.0.lock().unwrap();
    item_repository::list_items(&conn, &section_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_items(db: State<DbConn>) -> Result<bool, String> {
    let conn = db.0.lock().unwrap();
    item_repository::has_items(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_sections(db: State<DbConn>) -> Result<bool, String> {
    let conn = db.0.lock().unwrap();
    section_repository::has_sections(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_item(id: String, code: String, description: String, section_id: String, image_path: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    item_repository::update_item(&conn, id, code, description, section_id, image_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_item(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    item_repository::delete_item(&conn, &id).map_err(|e| e.to_string())
}

// Info handlers
#[tauri::command]
pub fn create_info(id: &str, item_code: &str, name: &str, details: &str, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::insert_info(&conn, id, item_code, name, details).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_info(id: String, db: State<DbConn>) -> Result<Option<Info>, String> {
    let conn = db.0.lock().unwrap();
    info_repository::get_info(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_infos(item_code: String, db: State<DbConn>) -> Result<Vec<Info>, String> {
    let conn = db.0.lock().unwrap();
    info_repository::list_infos(&conn, &item_code).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_info(id: &str, item_code: &str, name: &str, details: &str, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::update_info(&conn, id, item_code, name, details).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_info(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::delete_info(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_image(image: Vec<u8>, code: String) -> Result<String, String> {
    use std::path::PathBuf;
    use dirs_next::data_dir;
    
    // Validar entrada
    if image.is_empty() {
        return Err("Imagem vazia não pode ser salva".to_string());
    }
    
    if code.trim().is_empty() {
        return Err("Código do item não pode estar vazio".to_string());
    }
    
    // Validar se é uma imagem válida (verificar magic numbers)
    if !is_valid_image(&image) {
        return Err("Formato de imagem inválido".to_string());
    }
    
    let mut folder_path: PathBuf = match data_dir() {
        Some(dir) => dir,
        None => return Err("Erro: Não foi possível obter o diretório de dados".to_string()),
    };
    folder_path.push("BrilliantPDF");
    folder_path.push("images");

    fs::create_dir_all(&folder_path).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    let sanitized_code: String = code
        .trim()
        .chars()
        .map(|c: char| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    // Verificar se o código sanitizado não está vazio
    if sanitized_code.is_empty() {
        return Err("Código do item contém apenas caracteres inválidos".to_string());
    }

    let mut file_path = folder_path.clone();
    file_path.push(format!("{}.png", sanitized_code));

    // Criar backup se arquivo já existe
    if file_path.exists() {
        let mut backup_path = file_path.clone();
        backup_path.set_extension("png.bak");
        if let Err(e) = fs::copy(&file_path, &backup_path) {
            eprintln!("Aviso: Não foi possível criar backup: {}", e);
        }
    }

    fs::write(&file_path, image).map_err(|e| format!("Erro ao salvar imagem: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

// Função auxiliar para validar formato de imagem
fn is_valid_image(data: &[u8]) -> bool {
    if data.len() < 8 {
        return false;
    }
    
    // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
    if data.starts_with(&[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) {
        return true;
    }
    
    // JPEG magic number: FF D8 FF
    if data.starts_with(&[0xFF, 0xD8, 0xFF]) {
        return true;
    }
    
    // GIF magic number: 47 49 46 38
    if data.starts_with(&[0x47, 0x49, 0x46, 0x38]) {
        return true;
    }
    
    // WebP magic number: 52 49 46 46 (RIFF) + WebP
    if data.len() >= 12 && data.starts_with(&[0x52, 0x49, 0x46, 0x46]) && &data[8..12] == b"WEBP" {
        return true;
    }
    
    false
}

#[tauri::command]
pub fn read_image(image_path: String) -> Result<Vec<u8>, String> {
    use std::path::Path;
    
    if image_path.trim().is_empty() {
        return Err("Caminho da imagem não pode estar vazio".to_string());
    }
    
    let path = Path::new(&image_path);
    
    if !path.exists() {
        return Err("Arquivo de imagem não encontrado".to_string());
    }
    
    if !path.is_file() {
        return Err("Caminho especificado não é um arquivo".to_string());
    }
    
    // Verificar extensão do arquivo
    if let Some(extension) = path.extension() {
        let ext = extension.to_string_lossy().to_lowercase();
        if !matches!(ext.as_str(), "png" | "jpg" | "jpeg" | "gif" | "webp") {
            return Err(format!("Tipo de arquivo não suportado: {}", ext));
        }
    } else {
        return Err("Arquivo sem extensão não é suportado".to_string());
    }
    
    // Verificar tamanho do arquivo (limite de 10MB)
    match fs::metadata(&image_path) {
        Ok(metadata) => {
            if metadata.len() > 10 * 1024 * 1024 {
                return Err("Arquivo muito grande (limite: 10MB)".to_string());
            }
        },
        Err(e) => return Err(format!("Erro ao verificar arquivo: {}", e))
    }
    
    let data = fs::read(&image_path).map_err(|e| format!("Erro ao ler imagem: {}", e))?;
    
    // Validar se é uma imagem válida
    if !is_valid_image(&data) {
        return Err("Arquivo não contém uma imagem válida".to_string());
    }
    
    Ok(data)
}

#[tauri::command]
pub fn get_settings(_db: State<DbConn>) -> Result<UserSettings, String> {
    settings_db::get_user_settings()
}

#[tauri::command]
pub fn save_settings_command(settings: UserSettings, _db: State<DbConn>) -> Result<(), String> {
    settings_db::save_user_settings(&settings)
}

#[tauri::command]
pub fn save_palette(palette_id: String, _db: State<DbConn>) -> Result<(), String> {
    settings_db::update_palette(&palette_id)
}

#[tauri::command]
pub fn backup_user_settings(_db: State<DbConn>) -> Result<String, String> {
    settings_db::backup_settings()
}

#[tauri::command]
pub fn save_user_image(image_data: Vec<u8>, _db: State<DbConn>) -> Result<(), String> {
    // Carregar configurações atuais
    let mut settings = settings_db::get_user_settings()?;
    
    // Atualizar apenas o campo image_blob
    settings.image_blob = Some(image_data);
    
    // Salvar configurações atualizadas
    settings_db::save_user_settings(&settings)
}

#[tauri::command]
pub fn get_user_image(_db: State<DbConn>) -> Result<Option<Vec<u8>>, String> {
    let settings = settings_db::get_user_settings()?;
    Ok(settings.image_blob)
}

#[tauri::command]
pub fn migrate_settings_database(_db: State<DbConn>) -> Result<String, String> {
    // Força a reconexão e migração da estrutura do banco
    let _conn = settings_db::connect_settings_db()?;
    Ok("Migração da estrutura do banco de configurações concluída com sucesso".to_string())
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    use std::process::Command;
    
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", &url])
            .spawn()
            .map_err(|e| format!("Erro ao abrir URL: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Erro ao abrir URL: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Erro ao abrir URL: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub fn migrate_settings_to_db(_db: State<DbConn>) -> Result<String, String> {
    use crate::settings::settings_repository;
    
    // Carregar configurações do arquivo JSON antigo
    let old_settings = settings_repository::get_settings();
    
    // Converter para o novo formato
    let new_settings = UserSettings {
        id: 1,
        name: old_settings.name,
        save_path: old_settings.save_path,
        instagram_username: old_settings.instagram_username,
        website_url: old_settings.website_url,
        youtube_channel: old_settings.youtube_channel,
        image_path: old_settings.image_path,
        image_blob: None, // Inicializar sem BLOB
        pallet: old_settings.pallet,
        phone_number: old_settings.phone_number,
        email: old_settings.email,
        created_at: chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        updated_at: chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
    };
    
    // Salvar no banco de dados
    settings_db::save_user_settings(&new_settings)?;
    
    Ok("Configurações migradas com sucesso para o banco de dados".to_string())
}

#[tauri::command]
pub fn cleanup_orphaned_images(db: State<DbConn>) -> Result<usize, String> {
    use std::path::PathBuf;
    use dirs_next::data_dir;
    use std::collections::HashSet;
    
    let mut images_dir: PathBuf = match data_dir() {
        Some(dir) => dir,
        None => return Err("Não foi possível obter o diretório de dados".to_string()),
    };
    images_dir.push("BrilliantPDF");
    images_dir.push("images");
    
    if !images_dir.exists() {
        return Ok(0);
    }
    
    let conn = db.0.lock().unwrap();
    
    // Obter todos os caminhos de imagem do banco
    let mut stmt = conn.prepare("SELECT image_path FROM items")
        .map_err(|e| format!("Erro ao preparar consulta: {}", e))?;
        
    let image_paths: Result<HashSet<String>, _> = stmt.query_map([], |row| {
        Ok(row.get::<_, String>(0)?)
    })
    .map_err(|e| format!("Erro ao executar consulta: {}", e))?
    .collect();
    
    let db_images = image_paths.map_err(|e| format!("Erro ao processar resultados: {}", e))?;
    
    // Listar todos os arquivos na pasta de imagens
    let mut deleted_count = 0;
    match fs::read_dir(&images_dir) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        let path_str = path.to_string_lossy().to_string();
                        
                        // Se a imagem não está no banco, deletar
                        if !db_images.contains(&path_str) {
                            if let Err(e) = fs::remove_file(&path) {
                                eprintln!("Erro ao deletar imagem órfã {}: {}", path_str, e);
                            } else {
                                deleted_count += 1;
                                println!("Imagem órfã deletada: {}", path_str);
                            }
                        }
                    }
                }
            }
        },
        Err(e) => return Err(format!("Erro ao ler diretório de imagens: {}", e))
    }
    
    Ok(deleted_count)
}

#[tauri::command]
pub fn create_database_backup() -> Result<String, String> {
    use std::path::PathBuf;
    use dirs_next::data_dir;
    use chrono::Utc;
    
    let mut data_path: PathBuf = match data_dir() {
        Some(dir) => dir,
        None => return Err("Não foi possível obter o diretório de dados".to_string()),
    };
    data_path.push("BrilliantPDF");
    
    let db_path = data_path.join("db.sqlite");
    if !db_path.exists() {
        return Err("Banco de dados não encontrado".to_string());
    }
    
    // Criar pasta de backups
    let backup_dir = data_path.join("backups");
    fs::create_dir_all(&backup_dir).map_err(|e| format!("Erro ao criar pasta de backup: {}", e))?;
    
    // Nome do arquivo de backup com timestamp
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
    let backup_filename = format!("db_backup_{}.sqlite", timestamp);
    let backup_path = backup_dir.join(backup_filename);
    
    // Copiar banco de dados
    fs::copy(&db_path, &backup_path).map_err(|e| format!("Erro ao criar backup: {}", e))?;
    
    // Limitar número de backups (manter apenas os 10 mais recentes)
    cleanup_old_backups(&backup_dir, 10)?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

fn cleanup_old_backups(backup_dir: &std::path::Path, max_backups: usize) -> Result<(), String> {
    let mut backups: Vec<_> = fs::read_dir(backup_dir)
        .map_err(|e| format!("Erro ao ler diretório de backup: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.is_file() && path.extension()?.to_str()? == "sqlite" {
                let metadata = fs::metadata(&path).ok()?;
                Some((path, metadata.modified().ok()?))
            } else {
                None
            }
        })
        .collect();
    
    // Ordenar por data de modificação (mais recente primeiro)
    backups.sort_by(|a, b| b.1.cmp(&a.1));
    
    // Remover backups antigos
    for (path, _) in backups.iter().skip(max_backups) {
        if let Err(e) = fs::remove_file(path) {
            eprintln!("Erro ao remover backup antigo {:?}: {}", path, e);
        } else {
            println!("Backup antigo removido: {:?}", path);
        }
    }
    
    Ok(())
}

#[tauri::command]
pub fn select_save_folder() -> Result<Option<String>, String> {
    use std::process::Command;
    
    // Usar PowerShell para selecionar pasta no Windows
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            r#"
            Add-Type -AssemblyName System.Windows.Forms;
            $folder = New-Object System.Windows.Forms.FolderBrowserDialog;
            $folder.Description = 'Selecione onde salvar o catálogo PDF';
            $folder.ShowNewFolderButton = $true;
            if ($folder.ShowDialog() -eq 'OK') {
                Write-Output $folder.SelectedPath
            }
            "#
        ])
        .output()
        .map_err(|e| format!("Erro ao executar PowerShell: {}", e))?;

    if output.status.success() {
        let folder_path = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if folder_path.is_empty() {
            Ok(None)
        } else {
            Ok(Some(folder_path))
        }
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        Err(format!("Erro na seleção de pasta: {}", error))
    }
}

#[tauri::command]
pub fn update_save_path(new_path: String, _db: State<DbConn>) -> Result<(), String> {
    let mut settings = settings_db::get_user_settings()?;
    settings.save_path = new_path;
    settings_db::save_user_settings(&settings)
}

#[tauri::command]
pub fn generate_catalog_pdf_python(db: State<DbConn>) -> Result<String, String> {
    // Verificar licença antes de executar funcionalidade crítica
    check_license_middleware()?;
    
    use std::process::Command;
    use serde_json::json;
    use std::env;
    
    // Obter configurações do usuário
    let settings = settings_db::get_user_settings()?;
    let save_path = if settings.save_path.is_empty() {
        dirs_next::document_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .to_string_lossy()
            .to_string()
    } else {
        settings.save_path.clone()
    };
    
    // Obter dados do banco
    let conn = db.0.lock().unwrap();
    
    // Buscar todas as seções
    let sections = section_repository::list_sections(&conn)
        .map_err(|e| format!("Erro ao buscar seções: {}", e))?;
    
    // Buscar todos os itens e infos
    let mut all_items = Vec::new();
    let mut all_infos = Vec::new();
    
    for section in &sections {
        let items = item_repository::list_items(&conn, &section.id)
            .map_err(|e| format!("Erro ao buscar itens da seção {}: {}", section.name, e))?;
        
        println!("DEBUG: Seção '{}' tem {} itens", section.name, items.len());
        
        for item in items {
            let infos = info_repository::list_infos(&conn, &item.code)
                .map_err(|e| format!("Erro ao buscar infos do item {}: {}", item.code, e))?;
            
            println!("DEBUG: Item '{}' (código: {}) tem {} infos", item.description, item.code, infos.len());
            for info in &infos {
                println!("DEBUG: Info - nome: '{}', detalhes: '{}'", info.name, info.details);
            }
            
            // Converter imagem para base64 se existir
            let image_base64 = if !item.image_path.is_empty() && std::path::Path::new(&item.image_path).exists() {
                match fs::read(&item.image_path) {
                    Ok(image_data) => {
                        use base64::{Engine as _, engine::general_purpose};
                        let base64_str = general_purpose::STANDARD.encode(&image_data);
                        Some(base64_str)
                    },
                    Err(_) => None
                }
            } else {
                None
            };
            
            all_items.push(json!({
                "id": item.id,
                "code": item.code,
                "description": item.description,
                "section_id": section.id,
                "image_path": item.image_path,
                "image_base64": image_base64
            }));
            
            // Adicionar infos à lista geral
            for info in infos {
                all_infos.push(json!({
                    "id": info.id,
                    "name": info.name,
                    "details": info.details,
                    "item_code": item.code
                }));
            }
        }
    }
    
    // Criar lista de seções
    let sections_data: Vec<_> = sections.iter().map(|section| json!({
        "id": section.id,
        "name": section.name
    })).collect();
    
    // Converter imagem do usuário para base64 se existir
    let user_image_base64 = if let Some(image_data) = settings.image_blob {
        println!("DEBUG: Imagem do usuário encontrada, {} bytes", image_data.len());
        use base64::{Engine as _, engine::general_purpose};
        let base64_str = general_purpose::STANDARD.encode(&image_data);
        let result = format!("data:image/png;base64,{}", base64_str);
        println!("DEBUG: Imagem convertida para base64, comprimento: {}", result.len());
        Some(result)
    } else {
        println!("DEBUG: Nenhuma imagem do usuário encontrada nos settings");
        None
    };
    
    // Criar dados JSON para o Python
    let python_data = json!({
        "user_settings": {
            "name": settings.name,
            "save_path": save_path,
            "instagram_username": settings.instagram_username,
            "website_url": settings.website_url,
            "youtube_channel": settings.youtube_channel,
            "phone_number": settings.phone_number,
            "email": settings.email,
            "pallet": settings.pallet,
            "image_base64": user_image_base64
        },
        "sections": sections_data,
        "items": all_items,
        "infos": all_infos
    });
    
    // Obter o diretório do executável
    let exe_dir = env::current_exe()
        .map_err(|e| format!("Erro ao obter diretório do executável: {}", e))?
        .parent()
        .ok_or("Erro ao obter diretório pai")?
        .to_path_buf();
    
    // Verificar se existe versão compilada do gerador PDF
    let scripts_dir = exe_dir.join("scripts");
    let compiled_generator = if cfg!(target_os = "windows") {
        scripts_dir.join("pdf_generator.exe")
    } else {
        scripts_dir.join("pdf_generator")
    };
    
    let python_script = scripts_dir.join("pdf_generator.py");
    
    // Criar arquivo temporário com os dados
    let temp_dir = env::temp_dir();
    let temp_file = temp_dir.join("catalog_data.json");
    
    fs::write(&temp_file, python_data.to_string())
        .map_err(|e| format!("Erro ao criar arquivo temporário: {}", e))?;
    
    // Criar caminho de saída do PDF
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let pdf_filename = format!("catalogo_{}.pdf", timestamp);
    let output_path = std::path::Path::new(&save_path).join(&pdf_filename);
    
    // Decidir qual executor usar
    println!("DEBUG: Verificando executores...");
    let output = if compiled_generator.exists() {
        println!("DEBUG: Usando gerador compilado: {:?}", compiled_generator);
        // Usar versão compilada (sem dependência de Python)
        Command::new(&compiled_generator)
            .arg(temp_file.to_string_lossy().as_ref())
            .arg(output_path.to_string_lossy().as_ref())
            .output()
            .map_err(|e| format!("Erro ao executar gerador compilado: {}", e))?
    } else if python_script.exists() {
        println!("DEBUG: Usando script Python: {:?}", python_script);
        // Fallback para script Python
        let cmd_output = Command::new("python")
            .args(&[
                python_script.to_string_lossy().as_ref(),
                temp_file.to_string_lossy().as_ref(),
                output_path.to_string_lossy().as_ref()
            ])
            .output()
            .map_err(|e| format!("Erro ao executar Python: {}. Certifique-se de que Python está instalado e acessível.", e))?;
        
        println!("DEBUG: Saída Python stdout: {}", String::from_utf8_lossy(&cmd_output.stdout));
        println!("DEBUG: Saída Python stderr: {}", String::from_utf8_lossy(&cmd_output.stderr));
        
        cmd_output
    } else {
        println!("DEBUG: Nenhum gerador encontrado!");
        // Nenhum gerador encontrado
        let _ = fs::remove_file(&temp_file);
        return Err("Gerador PDF não encontrado. Certifique-se de que pdf_generator.exe ou pdf_generator.py está na pasta scripts/".to_string());
    };
    
    // Limpar arquivo temporário
    let _ = fs::remove_file(&temp_file);
    
    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if result.is_empty() {
            Ok(format!("PDF gerado com sucesso! Salvo em: {}", output_path.display()))
        } else {
            Ok(result)
        }
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        Err(format!("Erro na geração do PDF: {}", error))
    }
}

#[tauri::command]
pub fn export_catalog(file_path: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    catalog_repository::export_catalog(&conn, &file_path)
}

#[tauri::command]
pub fn import_catalog(file_path: String, preserve_current: bool, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    catalog_repository::import_catalog(&conn, &file_path, preserve_current)
}

#[tauri::command]
pub fn open_file_dialog() -> Result<Option<String>, String> {
    use rfd::FileDialog;
    
    let file = FileDialog::new()
        .add_filter("Catálogo", &["catalog"])
        .pick_file();
    
    match file {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn save_file_dialog(default_name: String) -> Result<Option<String>, String> {
    use rfd::FileDialog;
    
    let file = FileDialog::new()
        .add_filter("Catálogo", &["catalog"])
        .set_file_name(&default_name)
        .save_file();
    
    match file {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn save_temp_file(file_name: String, data: Vec<u8>) -> Result<String, String> {
    use std::env;
    
    let temp_dir = env::temp_dir();
    let temp_path = temp_dir.join(&file_name);
    
    fs::write(&temp_path, data)
        .map_err(|e| format!("Erro ao salvar arquivo temporário: {}", e))?;
    
    Ok(temp_path.to_string_lossy().to_string())
}