use rusqlite::{params, Connection, Result};
use crate::models::section::Section;

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        )",
        [],
    )?;
    Ok(())
}

pub fn insert_section(conn: &Connection, section: &Section) -> Result<()> {
    create_table(conn)?;
    conn.execute(
        "INSERT INTO sections (id, name) VALUES (?1, ?2)",
        params![section.id, section.name],
    )?;
    Ok(())
}

pub fn get_section(conn: &Connection, id: &str) -> Result<Option<Section>> {
    let mut stmt = conn.prepare("SELECT id, name FROM sections WHERE id = ?1")?;
    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Section {
            id: row.get(0)?,
            name: row.get(1)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn update_section(conn: &Connection, section: &Section) -> Result<()> {
    conn.execute(
        "UPDATE sections SET name = ?1 WHERE id = ?2",
        params![section.name, section.id],
    )?;
    Ok(())
}

pub fn delete_section(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM sections WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_sections(conn: &Connection) -> Result<Vec<Section>> {
    let mut stmt = conn.prepare("SELECT id, name FROM sections")?;
    let section_iter = stmt.query_map([], |row| {
        Ok(Section {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut sections = Vec::new();
    for section in section_iter {
        sections.push(section?);
    }
    Ok(sections)
}
