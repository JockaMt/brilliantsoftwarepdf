use dirs::data_dir;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
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
            pallet: "default".into(),
            phone_number: "".into(),
            email: "".into(),
        }
    }
}

pub fn get_settings() -> Settings {
    let mut path: PathBuf = data_dir().unwrap();
    path.push("BrilliantPDF");

    if !path.exists() {
        fs::create_dir_all(&path).ok();
    }

    path.push("settings.json");

    if path.exists() {
        let file = fs::File::open(&path);
        if let Ok(file) = file {
            let reader = std::io::BufReader::new(file);
            if let Ok(settings) = serde_json::from_reader(reader) {
                return settings;
            }
        }
    }

    // Se falhou ao abrir ou carregar, cria e salva defaults
    let default_settings = Settings::default();
    if let Ok(file) = fs::File::create(&path) {
        serde_json::to_writer_pretty(file, &default_settings).ok();
    }

    default_settings
}
