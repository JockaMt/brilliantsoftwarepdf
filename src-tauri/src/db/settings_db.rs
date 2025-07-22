use rusqlite::{Connection, Result};
use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use dirs::data_dir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserSettings {
    pub id: i32,
    pub name: String,
    pub save_path: String,
    pub instagram_username: String,
    pub website_url: String,
    pub youtube_channel: String,
    pub image_path: String, // Manter para compatibilidade
    pub image_blob: Option<Vec<u8>>, // Nova field para armazenar imagem como BLOB
    pub pallet: String,
    pub phone_number: String,
    pub email: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Default for UserSettings {
    fn default() -> Self {
        let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Self {
            id: 1,
            name: "Meu Projeto".into(),
            save_path: "".into(),
            instagram_username: "".into(),
            website_url: "".into(),
            youtube_channel: "".into(),
            image_path: "".into(),
            image_blob: None,
            pallet: "classic".into(),
            phone_number: "".into(),
            email: "".into(),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

pub fn get_settings_db_path() -> Result<PathBuf, String> {
    let mut path = data_dir()
        .ok_or("Não foi possível obter o diretório de dados")?;
    
    path.push("BrilliantPDF");
    
    if !path.exists() {
        std::fs::create_dir_all(&path)
            .map_err(|e| format!("Erro ao criar diretório: {}", e))?;
    }
    
    path.push("user_settings.db");
    Ok(path)
}

pub fn connect_settings_db() -> Result<Connection, String> {
    let db_path = get_settings_db_path()?;
    
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Erro ao conectar com banco de configurações: {}", e))?;
    
    // Configurar WAL mode e foreign keys
    conn.pragma_update(None, "journal_mode", "WAL")
        .map_err(|e| format!("Erro ao configurar WAL mode: {}", e))?;
    
    conn.pragma_update(None, "foreign_keys", "ON")
        .map_err(|e| format!("Erro ao habilitar foreign keys: {}", e))?;
    
    // Criar tabela se não existir e migrar estrutura
    init_settings_table(&conn)?;
    migrate_table_structure(&conn)?;
    
    Ok(conn)
}

fn migrate_table_structure(conn: &Connection) -> Result<(), String> {
    // Verificar se a coluna image_blob existe
    let mut stmt = conn.prepare("PRAGMA table_info(user_settings)")
        .map_err(|e| format!("Erro ao verificar estrutura da tabela: {}", e))?;
    
    let column_iter = stmt.query_map([], |row| {
        let column_name: String = row.get(1)?;
        Ok(column_name)
    }).map_err(|e| format!("Erro ao listar colunas: {}", e))?;

    let mut has_image_blob = false;
    for column_result in column_iter {
        let column_name = column_result.map_err(|e| format!("Erro ao processar coluna: {}", e))?;
        if column_name == "image_blob" {
            has_image_blob = true;
            break;
        }
    }

    // Adicionar coluna image_blob se não existir
    if !has_image_blob {
        #[cfg(debug_assertions)]
        println!("Debug: Adicionando coluna image_blob à tabela user_settings");
        
        conn.execute(
            "ALTER TABLE user_settings ADD COLUMN image_blob BLOB",
            [],
        ).map_err(|e| format!("Erro ao adicionar coluna image_blob: {}", e))?;
    }

    Ok(())
}

fn init_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL DEFAULT 'Meu Projeto',
            save_path TEXT DEFAULT '',
            instagram_username TEXT DEFAULT '',
            website_url TEXT DEFAULT '',
            youtube_channel TEXT DEFAULT '',
            image_path TEXT DEFAULT '',
            pallet TEXT DEFAULT 'classic',
            phone_number TEXT DEFAULT '',
            email TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    ).map_err(|e| format!("Erro ao criar tabela de configurações: {}", e))?;

    // Inserir configurações padrão se não existir nenhuma
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM user_settings WHERE id = 1",
        [],
        |row| row.get(0),
    ).unwrap_or(0);

    if count == 0 {
        let default_settings = UserSettings::default();
        insert_default_settings_legacy(conn, &default_settings)?;
    }

    Ok(())
}fn insert_default_settings_legacy(conn: &Connection, settings: &UserSettings) -> Result<(), String> {
    // Inserir sem image_blob para compatibilidade com tabelas antigas
    conn.execute(
        "INSERT INTO user_settings (
            id, name, save_path, instagram_username, website_url,
            youtube_channel, image_path, pallet, phone_number, email,
            created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        (
            &settings.id,
            &settings.name,
            &settings.save_path,
            &settings.instagram_username,
            &settings.website_url,
            &settings.youtube_channel,
            &settings.image_path,
            &settings.pallet,
            &settings.phone_number,
            &settings.email,
            &settings.created_at,
            &settings.updated_at,
        ),
    ).map_err(|e| format!("Erro ao inserir configurações padrão: {}", e))?;
    
    Ok(())
}

pub fn get_user_settings() -> Result<UserSettings, String> {
    let conn = connect_settings_db()?;
    
    // Tentar primeiro com image_blob
    let settings_result = conn.query_row(
        "SELECT id, name, save_path, instagram_username, website_url,
                youtube_channel, image_path, image_blob, pallet, phone_number, email,
                created_at, updated_at
         FROM user_settings WHERE id = 1",
        [],
        |row| {
            Ok(UserSettings {
                id: row.get(0)?,
                name: row.get(1)?,
                save_path: row.get(2)?,
                instagram_username: row.get(3)?,
                website_url: row.get(4)?,
                youtube_channel: row.get(5)?,
                image_path: row.get(6)?,
                image_blob: row.get(7)?,
                pallet: row.get(8)?,
                phone_number: row.get(9)?,
                email: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        },
    );

    // Se falhar (coluna não existe), tentar sem image_blob
    let settings = match settings_result {
        Ok(settings) => settings,
        Err(_) => {
            #[cfg(debug_assertions)]
            println!("Debug: Tentando carregar configurações sem image_blob");
            
            conn.query_row(
                "SELECT id, name, save_path, instagram_username, website_url,
                        youtube_channel, image_path, pallet, phone_number, email,
                        created_at, updated_at
                 FROM user_settings WHERE id = 1",
                [],
                |row| {
                    Ok(UserSettings {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        save_path: row.get(2)?,
                        instagram_username: row.get(3)?,
                        website_url: row.get(4)?,
                        youtube_channel: row.get(5)?,
                        image_path: row.get(6)?,
                        image_blob: None, // Padrão quando não existe
                        pallet: row.get(7)?,
                        phone_number: row.get(8)?,
                        email: row.get(9)?,
                        created_at: row.get(10)?,
                        updated_at: row.get(11)?,
                    })
                },
            ).map_err(|e| format!("Erro ao carregar configurações: {}", e))?
        }
    };
    
    Ok(validate_user_settings(settings))
}

pub fn save_user_settings(settings: &UserSettings) -> Result<(), String> {
    let conn = connect_settings_db()?;
    let validated_settings = validate_user_settings(settings.clone());
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "UPDATE user_settings SET 
            name = ?1, save_path = ?2, instagram_username = ?3, website_url = ?4,
            youtube_channel = ?5, image_path = ?6, image_blob = ?7, pallet = ?8, 
            phone_number = ?9, email = ?10, updated_at = ?11
         WHERE id = 1",
        (
            &validated_settings.name,
            &validated_settings.save_path,
            &validated_settings.instagram_username,
            &validated_settings.website_url,
            &validated_settings.youtube_channel,
            &validated_settings.image_path,
            &validated_settings.image_blob,
            &validated_settings.pallet,
            &validated_settings.phone_number,
            &validated_settings.email,
            &now,
        ),
    ).map_err(|e| format!("Erro ao salvar configurações: {}", e))?;
    
    Ok(())
}

pub fn update_palette(palette_id: &str) -> Result<(), String> {
    let conn = connect_settings_db()?;
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "UPDATE user_settings SET pallet = ?1, updated_at = ?2 WHERE id = 1",
        (palette_id, &now),
    ).map_err(|e| format!("Erro ao atualizar paleta: {}", e))?;
    
    Ok(())
}

fn validate_user_settings(mut settings: UserSettings) -> UserSettings {
    // Validar e sanitizar valores
    if settings.name.trim().is_empty() {
        settings.name = "Meu Projeto".to_string();
    }
    
    // Limitar tamanho dos campos de texto
    settings.name = settings.name.chars().take(100).collect();
    settings.instagram_username = settings.instagram_username.chars().take(50).collect();
    settings.website_url = settings.website_url.chars().take(200).collect();
    settings.youtube_channel = settings.youtube_channel.chars().take(100).collect();
    settings.phone_number = settings.phone_number.chars().take(20).collect();
    settings.email = settings.email.chars().take(100).collect();
    
    // Validar paths apenas se não estiverem vazios
    if !settings.save_path.is_empty() {
        let path_exists = std::path::Path::new(&settings.save_path).exists();
        if !path_exists {
            #[cfg(debug_assertions)]
            println!("Debug: Caminho de salvamento '{}' não é válido, mantendo valor", settings.save_path);
            // Não resetar automaticamente - deixar o usuário decidir
        }
    }
    
    if !settings.image_path.is_empty() {
        // Para image_path, verificar se é uma URL ou caminho local
        if settings.image_path.starts_with("http://") || settings.image_path.starts_with("https://") {
            // É uma URL válida, manter
        } else {
            // É um caminho local, verificar se existe
            let path_exists = std::path::Path::new(&settings.image_path).exists();
            if !path_exists {
                #[cfg(debug_assertions)]
                println!("Debug: Caminho da imagem '{}' não é válido, mantendo valor", settings.image_path);
                // Não resetar automaticamente - deixar o usuário decidir
            }
        }
    }
    
    // Validar paleta
    let valid_palettes = ["classic", "modern", "luxury", "rose_gold", "white_gold", 
                         "diamond", "emerald", "ruby", "sapphire", "vintage"];
    if !valid_palettes.contains(&settings.pallet.as_str()) {
        settings.pallet = "classic".to_string();
    }
    
    settings
}

// Função para backup das configurações
pub fn backup_settings() -> Result<String, String> {
    let settings = get_user_settings()?;
    let backup_path = get_settings_db_path()?
        .parent()
        .ok_or("Erro ao obter diretório pai")?
        .join(format!("settings_backup_{}.json", 
            chrono::Utc::now().format("%Y%m%d_%H%M%S")));
    
    let json_data = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Erro ao serializar configurações: {}", e))?;
    
    std::fs::write(&backup_path, json_data)
        .map_err(|e| format!("Erro ao escrever backup: {}", e))?;
    
    Ok(backup_path.to_string_lossy().to_string())
}
