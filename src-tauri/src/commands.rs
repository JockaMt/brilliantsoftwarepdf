use tauri::State;
use std::fs;
use std::sync::Mutex;
use rusqlite::Connection;

use crate::models::{section::Section, item::Item, info::Info};
use crate::db::{section_repository, item_repository, info_repository};
use crate::settings::settings_repository::Settings;
use crate::settings::{settings_repository};

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
    info_repository::insert_info(&conn, &id, &item_code, &name, &details).map_err(|e| e.to_string())
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
    info_repository::update_info(&conn, &id, &item_code, &name, &details).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_info(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::delete_info(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_image(image: Vec<u8>, code: String) -> Result<String, String> {
    let folder_path: &'static str = "../images";

    fs::create_dir_all(folder_path).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    let sanitized_code: String = code
        .chars()
        .map(|c: char| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let file_path: String = format!("{}/{}.png", folder_path, sanitized_code);

    fs::write(&file_path, image).map_err(|e| format!("Erro ao salvar imagem: {}", e))?;

    Ok(file_path)
}

#[tauri::command]
pub fn get_settings(_db: State<DbConn>) -> Result<Settings, String> {
    Ok(settings_repository::get_settings())
}

// Auth commands
#[tauri::command]
pub fn save_user_id(user_id: String) -> Result<(), String> {
    let config_dir = dirs::config_dir()
        .ok_or("Erro ao obter diretório de configuração")?
        .join("BrilliantSoftware");
    
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Erro ao criar diretório de configuração: {}", e))?;
    
    let user_id_file = config_dir.join(".user_id");
    
    fs::write(&user_id_file, &user_id)
        .map_err(|e| format!("Erro ao salvar ID do usuário: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn load_user_id() -> Result<Option<String>, String> {
    let config_dir = dirs::config_dir()
        .ok_or("Erro ao obter diretório de configuração")?
        .join("BrilliantSoftware");
    
    let user_id_file = config_dir.join(".user_id");
    
    match fs::read_to_string(&user_id_file) {
        Ok(user_id) => {
            let trimmed = user_id.trim();
            if trimmed.is_empty() {
                Ok(None)
            } else {
                Ok(Some(trimmed.to_string()))
            }
        }
        Err(ref e) if e.kind() == std::io::ErrorKind::NotFound => {
            Ok(None)
        }
        Err(e) => Err(format!("Erro ao carregar ID do usuário: {}", e))
    }
}

#[tauri::command]
pub fn clear_user_id() -> Result<(), String> {
    let config_dir = dirs::config_dir()
        .ok_or("Erro ao obter diretório de configuração")?
        .join("BrilliantSoftware");
    
    let user_id_file = config_dir.join(".user_id");
    
    match fs::remove_file(&user_id_file) {
        Ok(_) => Ok(()),
        Err(ref e) if e.kind() == std::io::ErrorKind::NotFound => {
            Ok(()) // Arquivo não existe, consideramos como sucesso
        }
        Err(e) => Err(format!("Erro ao limpar ID do usuário: {}", e))
    }
}