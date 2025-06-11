use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Section {
    pub id: String,   // UUID, por exemplo
    pub name: String, // nome da seção
}

// Opcional: você pode implementar funções utilitárias aqui, se quiser
impl Section {
    pub fn new(id: String, name: String) -> Self {
        Self { id, name }
    }
}
