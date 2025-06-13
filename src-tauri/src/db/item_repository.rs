use rusqlite::{params, Connection, Result};
use uuid::Uuid;
use crate::models::item::Item;

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            code TEXT,
            description TEXT NOT NULL,
            section_id TEXT NOT NULL,
            image_path TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn insert_item(conn: &Connection, code: String, description: String, section_id: String, image_path: String) -> Result<()> {
    let uuid = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO items (id, code, description, section_id, image_path) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![uuid, code, description, section_id, image_path],
    )?;
    Ok(())
}

pub fn get_item(conn: &Connection, id: &str) -> Result<Option<Item>> {
    let mut stmt = conn.prepare("SELECT id, code, description, section_id, image_path FROM items WHERE id = ?1")?;
    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Item {
            id: row.get(0)?,
            code: row.get(1)?,
            description: row.get(2)?,
            section_id: row.get(3)?,
            image_path: row.get(4)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn update_item(conn: &Connection, item: &Item) -> Result<()> {
    conn.execute(
        "UPDATE items SET code=?1 description = ?2, section_id = ?3, image_path = ?4 WHERE id = ?5",
        params![item.image_path, item.description, item.section_id, item.image_path, item.id],
    )?;
    Ok(())
}

pub fn delete_item(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM items WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_items(conn: &Connection, section_id: &str) -> Result<Vec<Item>> {
    let mut stmt = conn.prepare("SELECT id, code, description, section_id, image_path FROM items WHERE section_id = ?1")?;
    let item_iter = stmt.query_map([section_id], |row| {
        Ok(Item {
            id: row.get(0)?,
            code: row.get(1)?,
            description: row.get(2)?,
            section_id: row.get(3)?,
            image_path: row.get(4)?,
        })
    })?;

    let mut items = Vec::new();
    for item in item_iter {
        items.push(item?);
    }
    Ok(items)
}
