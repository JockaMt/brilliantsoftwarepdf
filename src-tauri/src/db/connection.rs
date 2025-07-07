use std::fs;
use std::path::PathBuf;
use dirs_next::data_dir;
use rusqlite::Connection;
use crate::db::{info_repository, item_repository, section_repository};

pub fn database_connect() -> Connection {
    let mut path: PathBuf = data_dir().unwrap();
    path.push("BrilliantPDF");

    if !path.exists() {
        match fs::create_dir_all(&path) {
            Ok(_) => println!("Pasta criada: {:?}", path.display()),
            Err(e) => eprintln!("Erro ao criar pasta: {}", e),
        }
    } else {
        println!("Pasta já existe: {:?}", path.display());
    }

    path.push("db.sqlite");
    println!("db data directory: {}", path.display());

    let conn = Connection::open(&path).expect("Falha ao abrir banco");

    // Criar tabelas se não existirem
    section_repository::create_table(&conn).expect("Erro ao criar tabela de seções");
    item_repository::create_table(&conn).expect("Erro ao criar tabela de itens");
    info_repository::create_table(&conn).expect("Erro ao criar tabela de infos");

    conn
}