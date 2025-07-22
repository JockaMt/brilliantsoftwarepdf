use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Item {
    pub id: String,
    pub code: String,
    pub description: String,
    pub section_id: String,
    pub image_path: String, // ex: "./images/123.jpg"
}