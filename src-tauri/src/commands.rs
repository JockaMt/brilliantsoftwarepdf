use tauri::State;
use std::sync::Mutex;
use rusqlite::Connection;

use crate::models::{section::Section, item::Item, info::Info};
use crate::db::{section_repository, item_repository, info_repository};

pub struct DbConn(pub Mutex<Connection>);

#[tauri::command]
pub fn create_section(section: Section, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    section_repository::insert_section(&conn, &section).map_err(|e| e.to_string())
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
pub fn update_section(section: Section, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    section_repository::update_section(&conn, &section).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_section(id: String, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    section_repository::delete_section(&conn, &id).map_err(|e| e.to_string())
}

// Item handlers
#[tauri::command]
pub fn create_item(item: Item, db: State<DbConn>) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    item_repository::insert_item(&conn, &item).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_item(id: String, db: State<DbConn>) -> Result<Option<Item>, String> {
    let conn = db.0.lock().unwrap();
    item_repository::get_item(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_items(db: State<DbConn>) -> Result<Vec<Item>, String> {
    let conn = db.0.lock().unwrap();
    item_repository::list_items(&conn).map_err(|e| e.to_string())
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
