mod db;
mod updater;
mod models;
mod commands;
mod settings;

use commands::*;
use commands::DbConn;

use db::connection;
use rusqlite::Connection;

pub use updater::{check_for_update, download_and_install_update};

pub async fn run() {
	let conn: Connection = connection::database_connect();

	tauri::Builder::default()
		.manage(DbConn(std::sync::Mutex::new(conn)))
		.plugin(tauri_plugin_updater::Builder::new().build())
		.plugin(tauri_plugin_opener::init())
		.invoke_handler(tauri::generate_handler![
            check_for_update,
            download_and_install_update,
            create_section,
            get_section,
            get_section_by_name,
            list_sections,
			has_sections,
            update_section,
            delete_section,
            create_item,
            get_item,
            list_items,
            update_item,
            delete_item,
            create_info,
            get_info,
            has_items,
            list_infos,
            update_info,
            delete_info,
            save_image,
            read_image,
            get_settings,
            save_settings_command,
            save_palette,
            save_user_image,
            get_user_image,
            migrate_settings_database,
            open_external_url,
            backup_user_settings,
            migrate_settings_to_db,
            cleanup_orphaned_images,
            create_database_backup,
            select_save_folder,
            update_save_path,
            generate_catalog_pdf_python
        ])
		.run(tauri::generate_context!())
		.unwrap();
}