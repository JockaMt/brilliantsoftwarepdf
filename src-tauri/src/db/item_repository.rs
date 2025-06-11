use rusqlite::{params, Connection, Result};
use crate::models::item::Item;

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            section_id TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn insert_item(conn: &Connection, item: &Item) -> Result<()> {
    conn.execute(
        "INSERT INTO items (id, description, section_id) VALUES (?1, ?2, ?3)",
        params![item.id, item.description, item.section_id],
    )?;
    Ok(())
}

pub fn get_item(conn: &Connection, id: &str) -> Result<Option<Item>> {
    let mut stmt = conn.prepare("SELECT id, description, section_id FROM items WHERE id = ?1")?;
    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Item {
            id: row.get(0)?,
            description: row.get(1)?,
            section_id: row.get(2)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn update_item(conn: &Connection, item: &Item) -> Result<()> {
    conn.execute(
        "UPDATE items SET description = ?1, section_id = ?2 WHERE id = ?3",
        params![item.description, item.section_id, item.id],
    )?;
    Ok(())
}

pub fn delete_item(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM items WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_items(conn: &Connection) -> Result<Vec<Item>> {
    let mut stmt = conn.prepare("SELECT id, description, section_id FROM items")?;
    let item_iter = stmt.query_map([], |row| {
        Ok(Item {
            id: row.get(0)?,
            description: row.get(1)?,
            section_id: row.get(2)?,
        })
    })?;

    let mut items = Vec::new();
    for item in item_iter {
        items.push(item?);
    }
    Ok(items)
}
