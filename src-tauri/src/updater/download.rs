use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<(), String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    let maybe_update = updater.check().await.map_err(|e| e.to_string())?;

    if let Some(update) = maybe_update {
        let mut downloaded = 0;

        update.download_and_install(
            |chunk_length, content_length| {
                downloaded += chunk_length;
                println!("[Updater] Baixado {} bytes de {:?}", downloaded, content_length);
            },
            || {
                println!("[Updater] Download finalizado");
            },
        ).await.map_err(|e| e.to_string())?;

        println!("[Updater] Atualização instalada. Reiniciando app...");
        app.restart();
        Ok(())
    } else {
        Err("Nenhuma atualização disponível.".to_string())
    }
}