use tauri::State;
use std::fs;
use std::sync::Mutex;
use rusqlite::Connection;

use crate::models::{section::Section, item::Item, info::Info};
use crate::db::{section_repository, item_repository, info_repository};

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
pub fn update_item(item: Item, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    item_repository::update_item(&conn, &item).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_item(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    item_repository::delete_item(&conn, &id).map_err(|e| e.to_string())
}

// Info handlers
#[tauri::command]
pub fn create_info(info: Info, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::insert_info(&conn, &info).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_info(id: String, db: State<DbConn>) -> Result<Option<Info>, String> {
    let conn = db.0.lock().unwrap();
    info_repository::get_info(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_infos(db: State<DbConn>) -> Result<Vec<Info>, String> {
    let conn = db.0.lock().unwrap();
    info_repository::list_infos(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_info(info: Info, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::update_info(&conn, &info).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_info(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    info_repository::delete_info(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_image(image: Vec<u8>, code: String) -> Result<String, String> {
    let folder_path = "../images";

    // Cria a pasta se não existir
    fs::create_dir_all(folder_path).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    // Sanitiza o nome do arquivo para evitar caracteres inválidos ou perigosos
    let sanitized_code: String = code
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let file_path = format!("{}/{}.png", folder_path, sanitized_code);

    // Salva o arquivo
    fs::write(&file_path, image).map_err(|e| format!("Erro ao salvar imagem: {}", e))?;

    Ok(file_path)
}