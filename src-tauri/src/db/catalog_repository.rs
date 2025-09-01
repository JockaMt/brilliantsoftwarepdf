use rusqlite::{Connection, Result};
use crate::models::catalog::CatalogData;
use crate::settings::settings_repository;
use crate::db::{section_repository, item_repository, info_repository};
use std::fs;
use std::path::Path;

pub fn export_catalog(conn: &Connection, file_path: &str) -> Result<(), String> {
    // Coletar todos os dados do banco
    let settings = settings_repository::get_settings();
    
    let sections = section_repository::list_sections(conn)
        .map_err(|e| format!("Erro ao buscar seções: {}", e))?;
    
    let mut all_items = Vec::new();
    let mut all_infos = Vec::new();
    
    // Para cada seção, buscar os itens
    for section in &sections {
        let items = item_repository::list_items(conn, &section.id)
            .map_err(|e| format!("Erro ao buscar itens da seção {}: {}", section.name, e))?;
        
        // Para cada item, buscar as informações
        for item in &items {
            let infos = info_repository::list_infos(conn, &item.code)
                .map_err(|e| format!("Erro ao buscar informações do item {}: {}", item.code, e))?;
            all_infos.extend(infos);
        }
        
        all_items.extend(items);
    }
    
    // Criar a estrutura do catálogo
    let catalog = CatalogData {
        version: "1.0.0".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
        settings,
        sections,
        items: all_items,
        infos: all_infos,
    };
    
    // Serializar para JSON
    let json_data = serde_json::to_string_pretty(&catalog)
        .map_err(|e| format!("Erro ao serializar catálogo: {}", e))?;
    
    // Salvar no arquivo
    fs::write(file_path, json_data)
        .map_err(|e| format!("Erro ao salvar arquivo: {}", e))?;
    
    Ok(())
}

pub fn import_catalog(conn: &Connection, file_path: &str, preserve_current: bool) -> Result<(), String> {
    // Verificar se o arquivo existe
    if !Path::new(file_path).exists() {
        return Err("Arquivo não encontrado".to_string());
    }
    
    // Ler o arquivo
    let json_data = fs::read_to_string(file_path)
        .map_err(|e| format!("Erro ao ler arquivo: {}", e))?;
    
    // Deserializar o JSON
    let catalog: CatalogData = serde_json::from_str(&json_data)
        .map_err(|e| format!("Erro ao ler dados do catálogo: {}", e))?;
    
    // Se não preservar dados atuais, limpar o banco
    if !preserve_current {
        clear_database(conn)?;
    }
    
    // Importar seções
    for section in &catalog.sections {
        // Verificar se já existe pelo nome (para evitar duplicatas)
        if section_repository::get_section_by_name(conn, &section.name)
            .map_err(|e| format!("Erro ao verificar seção: {}", e))?
            .is_none() {
            section_repository::insert_section(conn, &section.name)
                .map_err(|e| format!("Erro ao importar seção {}: {}", section.name, e))?;
        }
    }
    
    // Importar itens
    for item in &catalog.items {
        // Verificar se a seção existe
        if let Some(_) = section_repository::get_section(conn, &item.section_id)
            .map_err(|e| format!("Erro ao verificar seção do item: {}", e))? {
            
            // Tentar inserir o item (ignorar se já existe)
            if let Err(_) = item_repository::insert_item(
                conn, 
                item.code.clone(), 
                item.description.clone(), 
                item.section_id.clone(), 
                item.image_path.clone()
            ) {
                // Item já existe, pular silenciosamente
            }
        }
    }
    
    // Importar informações
    for info in &catalog.infos {
        // Tentar inserir a informação (ignorar se já existe)
        if let Err(_) = info_repository::insert_info(
            conn,
            &info.id,
            &info.item_code,
            &info.name,
            &info.details
        ) {
            // Info já existe, pular silenciosamente
        }
    }
    
    Ok(())
}

fn clear_database(conn: &Connection) -> Result<(), String> {
    // Limpar tabelas em ordem devido às foreign keys
    conn.execute("DELETE FROM infos", [])
        .map_err(|e| format!("Erro ao limpar informações: {}", e))?;
    
    conn.execute("DELETE FROM items", [])
        .map_err(|e| format!("Erro ao limpar itens: {}", e))?;
    
    conn.execute("DELETE FROM sections", [])
        .map_err(|e| format!("Erro ao limpar seções: {}", e))?;
    
    Ok(())
}
