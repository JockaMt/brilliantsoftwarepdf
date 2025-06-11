use rusqlite::{params, Connection, Result};
use crate::models::info::Info;

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS infos (
            id TEXT PRIMARY KEY,
            section_id TEXT NOT NULL,
            name TEXT NOT NULL,
            details TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn insert_info(conn: &Connection, info: &Info) -> Result<()> {
    conn.execute(
        "INSERT INTO infos (id, section_id, name, details) VALUES (?1, ?2, ?3, ?4)",
        params![info.id, info.section_id, info.name, info.details],
    )?;
    Ok(())
}

pub fn get_info(conn: &Connection, id: &str) -> Result<Option<Info>> {
    let mut stmt = conn.prepare("SELECT id, section_id, name, details FROM infos WHERE id = ?1")?;
    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Info {
            id: row.get(0)?,
            section_id: row.get(1)?,
            name: row.get(2)?,
            details: row.get(3)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn update_info(conn: &Connection, info: &Info) -> Result<()> {
    conn.execute(
        "UPDATE infos SET section_id = ?1, name = ?2, details = ?3 WHERE id = ?4",
        params![info.section_id, info.name, info.details, info.id],
    )?;
    Ok(())
}

pub fn delete_info(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM infos WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_infos(conn: &Connection) -> Result<Vec<Info>> {
    let mut stmt = conn.prepare("SELECT id, section_id, name, details FROM infos")?;
    let info_iter = stmt.query_map([], |row| {
        Ok(Info {
            id: row.get(0)?,
            section_id: row.get(1)?,
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
