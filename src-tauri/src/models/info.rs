use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Info {
    pub id: String,          // UUID
    pub item_code: String,  // FK que referencia a Section (id da seção)
    pub name: String,        // nome da informação
    pub details: String,     // detalhes da informação
}
