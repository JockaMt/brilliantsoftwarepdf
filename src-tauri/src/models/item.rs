use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Item {
    pub id: String,          // UUID
    pub description: String, // descrição do item
    pub section_id: String,  // FK que referencia a Section (id da seção)
}

impl Item {
    pub fn new(id: String, description: String, section_id: String) -> Self {
        Self { id, description, section_id }
    }
}
