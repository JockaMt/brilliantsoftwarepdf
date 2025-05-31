mod updater;

pub use updater::{ check_for_update, download_and_install_update };

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build()) // registra o state aqui!
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_for_update,
            download_and_install_update
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
