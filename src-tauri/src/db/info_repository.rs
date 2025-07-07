use rusqlite::{params, Connection, Result};
use crate::models::info::Info;

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS infos (
            id TEXT PRIMARY KEY,
            item_code TEXT NOT NULL,
            name TEXT NOT NULL,
            details TEXT NOT NULL,
            FOREIGN KEY (item_code) REFERENCES items(code) ON DELETE CASCADE
        )",
        [],
    )?;
    Ok(())
}

pub fn insert_info(conn: &Connection, id: &str, item_code: &str, name: &str, details: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO infos (id, item_code, name, details) VALUES (?1, ?2, ?3, ?4)",
        params![id, item_code, name, details],
    )?;
    Ok(())
}

pub fn get_info(conn: &Connection, id: &str) -> Result<Option<Info>> {
    let mut stmt = conn.prepare("SELECT id, item_code, name, details FROM infos WHERE id = ?1")?;
    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Info {
            id: row.get(0)?,
            item_code: row.get(1)?,
            name: row.get(2)?,
            details: row.get(3)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn update_info(conn: &Connection, id: &str, item_code: &str, name: &str, details: &str) -> Result<()> {
    conn.execute(
        "UPDATE infos SET item_code = ?1, name = ?2, details = ?3 WHERE id = ?4",
        params![item_code, name, details, id],
    )?;
    Ok(())
}

pub fn delete_info(conn: &Connection, id: &str) -> Result<()> {
    println!("Deleting info with id: {}", id);
    conn.execute("DELETE FROM infos WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_infos(conn: &Connection, item_code: &str) -> Result<Vec<Info>> {
    let mut stmt = conn.prepare("SELECT id, item_code, name, details FROM infos WHERE item_code = ?1")?;
    let info_iter = stmt.query_map([item_code], |row| {
        Ok(Info {
            id: row.get(0)?,
            item_code: row.get(1)?,
            name: row.get(2)?,
            details: row.get(3)?,
        })
    })?;

    let mut infos = Vec::new();
    for info in info_iter {
        infos.push(info?);
    }
    Ok(infos)
}
