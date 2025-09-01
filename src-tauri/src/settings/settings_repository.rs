use dirs::data_dir;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub struct Settings {
    pub name: String,
    pub save_path: String,
    pub instagram_username: String,
    pub website_url: String,
    pub youtube_channel: String,
    pub image_path: String,
    pub pallet: String,
    pub phone_number: String,
    pub email: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            name: "Meu Projeto".into(),
            save_path: "".into(),
            instagram_username: "".into(),
            website_url: "".into(),
            youtube_channel: "".into(),
            image_path: "".into(),
            pallet: "classic".into(),
            phone_number: "".into(),
            email: "".into(),
        }
    }
}

pub fn get_settings() -> Settings {
    let mut path: PathBuf = match data_dir() {
        Some(dir) => dir,
        None => {
            eprintln!("Erro: Não foi possível obter o diretório de dados, usando configurações padrão");
            return Settings::default();
        }
    };
    path.push("BrilliantPDF");

    if !path.exists() {
        if let Err(e) = fs::create_dir_all(&path) {
            eprintln!("Erro ao criar diretório: {}", e);
            return Settings::default();
        }
    }

    path.push("settings.json");

    if path.exists() {
        // Verificar se o arquivo não está corrompido
        match fs::metadata(&path) {
            Ok(metadata) => {
                if metadata.len() == 0 {
                    eprintln!("Arquivo settings.json está vazio, recriando com valores padrão");
                    return create_default_settings(&path);
                }
            },
            Err(e) => {
                eprintln!("Erro ao verificar arquivo settings.json: {}", e);
                return Settings::default();
            }
        }

        match fs::File::open(&path) {
            Ok(file) => {
                let reader = std::io::BufReader::new(file);
                match serde_json::from_reader::<_, Settings>(reader) {
                    Ok(settings) => {
                        // Validar configurações carregadas
                        return validate_settings(settings);
                    },
                    Err(e) => {
                        eprintln!("Erro ao parsear settings.json: {}, recriando arquivo", e);
                        // Fazer backup do arquivo corrompido
                        let mut backup_path = path.clone();
                        backup_path.set_extension("json.bak");
                        if let Err(backup_err) = fs::copy(&path, &backup_path) {
                            eprintln!("Erro ao criar backup: {}", backup_err);
                        }
                        return create_default_settings(&path);
                    }
                }
            },
            Err(e) => {
                eprintln!("Erro ao abrir settings.json: {}", e);
                return Settings::default();
            }
        }
    }

    create_default_settings(&path)
}

fn create_default_settings(path: &PathBuf) -> Settings {
    let default_settings = Settings::default();
    match fs::File::create(path) {
        Ok(file) => {
            if let Err(e) = serde_json::to_writer_pretty(file, &default_settings) {
                eprintln!("Erro ao salvar configurações padrão: {}", e);
            }
        },
        Err(e) => eprintln!("Erro ao criar arquivo settings.json: {}", e)
    }
    default_settings
}

fn validate_settings(mut settings: Settings) -> Settings {
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
            println!("Debug: Caminho de salvamento '{}' não encontrado, resetando", settings.save_path);
            settings.save_path = String::new();
        }
    }
    
    if !settings.image_path.is_empty() {
        let path_exists = std::path::Path::new(&settings.image_path).exists();
        if !path_exists {
            #[cfg(debug_assertions)]
            println!("Debug: Caminho da imagem '{}' não encontrado, resetando", settings.image_path);
            settings.image_path = String::new();
        }
    }
    
    settings
}