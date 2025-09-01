use serde::{Serialize, Deserialize};
use super::{section::Section, item::Item, info::Info};
use crate::settings::settings_repository::Settings;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CatalogData {
    pub version: String,
    pub created_at: String,
    pub settings: Settings,
    pub sections: Vec<Section>,
    pub items: Vec<Item>,
    pub infos: Vec<Info>,
}

impl Default for CatalogData {
    fn default() -> Self {
        Self {
            version: "1.0.0".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            settings: Settings::default(),
            sections: Vec::new(),
            items: Vec::new(),
            infos: Vec::new(),
        }
    }
}
