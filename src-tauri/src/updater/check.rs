use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    let maybe_update = updater.check().await.map_err(|e| e.to_string())?;

    match maybe_update {
        Some(update) => {
            let version = update.version.clone();
            // Você pode armazenar `update` no State se quiser manter para depois
            Ok(Some(version))
        }
        None => Ok(None),
    }
}