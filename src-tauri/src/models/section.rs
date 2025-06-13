use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Section {
    pub id: String,   // UUID, por exemplo
    pub name: String, // nome da seção
}
