use serde::{Serialize, Deserialize};
use super::item::Item;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Section {
    pub id: String,   // UUID, por exemplo
    pub name: String, // nome da seção
    #[serde(default)]
    pub items: Vec<Item>, // lista de itens da seção
}
