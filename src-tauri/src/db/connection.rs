use std::fs;
use std::path::PathBuf;
use dirs_next::data_dir;
use rusqlite::{Connection};
use crate::db::{info_repository, item_repository, section_repository};

pub fn database_connect() -> Connection {
    let mut path: PathBuf = match data_dir() {
        Some(dir) => dir,
        None => {
            eprintln!("Erro: Não foi possível obter o diretório de dados");
            std::process::exit(1);
        }
    };
    
    path.push("BrilliantPDF");

    // Criar diretório se não existir
    if !path.exists() {
        match fs::create_dir_all(&path) {
            Ok(_) => println!("Pasta criada: {:?}", path.display()),
            Err(e) => {
                eprintln!("Erro ao criar pasta: {}", e);
                std::process::exit(1);
            }
        }
    } else {
        println!("Pasta já existe: {:?}", path.display());
    }

    path.push("db.sqlite");
    println!("db data directory: {}", path.display());

    let conn = Connection::open(&path).expect("Falha ao abrir banco");

    // Habilitar foreign keys para manter integridade referencial
    if let Err(e) = conn.execute("PRAGMA foreign_keys = ON", []) {
        eprintln!("Erro ao habilitar foreign keys: {}", e);
    }

    // Habilitar WAL mode para melhor performance
    if let Err(e) = conn.execute("PRAGMA journal_mode = WAL", []) {
        eprintln!("Aviso: Não foi possível habilitar WAL mode: {}", e);
    }

    // Criar tabelas se não existirem
    if let Err(e) = section_repository::create_table(&conn) {
        eprintln!("Erro ao criar tabela de seções: {}", e);
        std::process::exit(1);
    }
    
    if let Err(e) = item_repository::create_table(&conn) {
        eprintln!("Erro ao criar tabela de itens: {}", e);
        std::process::exit(1);
    }
    
    if let Err(e) = info_repository::create_table(&conn) {
        eprintln!("Erro ao criar tabela de infos: {}", e);
        std::process::exit(1);
    }

    conn
}