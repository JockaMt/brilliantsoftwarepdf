use rusqlite::Connection;
use crate::db::{info_repository, item_repository, section_repository};

pub fn database_connect() -> Connection {
    let conn = Connection::open("db.sqlite").expect("Falha ao abrir banco");

    // Criar tabelas se não existirem
    section_repository::create_table(&conn).expect("Erro ao criar tabela de seções");
    item_repository::create_table(&conn).expect("Erro ao criar tabela de itens");
    info_repository::create_table(&conn).expect("Erro ao criar tabela de infos");

    conn
}