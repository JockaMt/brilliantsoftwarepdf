use crate::license::{LicenseValidator, LicenseError, LicenseStatus};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LicenseInfoResponse {
    pub key: String,
    pub machine_code: String,
    pub expires: String,
    pub product_id: String,
    pub premium: bool,
    pub max_offline_days: i32,
    pub last_activation: Option<String>,
    pub days_until_expiry: i64,
}

#[derive(Debug, Serialize)]
pub struct LicenseStatusResponse {
    pub is_valid: bool,
    pub status: String,
    pub message: String,
    pub days_remaining: Option<i64>,
}

/// Verifica se o produto está ativado
#[tauri::command]
pub fn is_license_activated() -> bool {
    let validator = LicenseValidator::new();
    validator.is_activated()
}

/// Obtém o código da máquina
#[tauri::command]
pub fn get_machine_code() -> String {
    LicenseValidator::get_machine_code()
}

/// Ativa o produto com uma chave de licença
#[tauri::command]
pub async fn activate_license(license_key: String) -> Result<String, String> {
    let validator = LicenseValidator::new();
    
    match validator.activate_license(license_key).await {
        Ok(_) => Ok("Produto ativado com sucesso!".to_string()),
        Err(error) => Err(error.to_string()),
    }
}

/// Valida a licença atual
#[tauri::command]
pub async fn validate_current_license() -> Result<LicenseStatusResponse, String> {
    let validator = LicenseValidator::new();
    
    match validator.validate_license().await {
        Ok(status) => {
            let response = match status {
                LicenseStatus::Valid => LicenseStatusResponse {
                    is_valid: true,
                    status: "valid".to_string(),
                    message: "Licença válida".to_string(),
                    days_remaining: None,
                },
                LicenseStatus::NearExpiration(days) => LicenseStatusResponse {
                    is_valid: true,
                    status: "near_expiration".to_string(),
                    message: format!("Licença expira em {} dias", days),
                    days_remaining: Some(days),
                },
                LicenseStatus::Expired => LicenseStatusResponse {
                    is_valid: false,
                    status: "expired".to_string(),
                    message: "Licença expirada".to_string(),
                    days_remaining: None,
                },
                LicenseStatus::NotActivated => LicenseStatusResponse {
                    is_valid: false,
                    status: "not_activated".to_string(),
                    message: "Produto não ativado".to_string(),
                    days_remaining: None,
                },
                LicenseStatus::OfflineExpired => LicenseStatusResponse {
                    is_valid: false,
                    status: "offline_expired".to_string(),
                    message: "Período offline expirado - conecte-se à internet".to_string(),
                    days_remaining: None,
                },
            };
            Ok(response)
        },
        Err(error) => match error {
            LicenseError::NotActivated => Ok(LicenseStatusResponse {
                is_valid: false,
                status: "not_activated".to_string(),
                message: "Produto não ativado".to_string(),
                days_remaining: None,
            }),
            _ => Err(error.to_string()),
        }
    }
}

/// Obtém informações detalhadas da licença
#[tauri::command]
pub fn get_license_info() -> Result<LicenseInfoResponse, String> {
    let validator = LicenseValidator::new();
    
    match validator.get_license_info() {
        Ok(license) => {
            let days_until_expiry = (license.expires - chrono::Utc::now()).num_days();
            
            Ok(LicenseInfoResponse {
                key: license.key,
                machine_code: license.machine_code,
                expires: license.expires.format("%Y-%m-%d %H:%M:%S UTC").to_string(),
                product_id: license.product_id,
                premium: license.premium,
                max_offline_days: license.max_offline_days,
                last_activation: license.last_activation.map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string()),
                days_until_expiry,
            })
        },
        Err(error) => Err(error.to_string()),
    }
}

/// Renova a licença
#[tauri::command]
pub async fn renew_license() -> Result<String, String> {
    let validator = LicenseValidator::new();
    
    match validator.renew_license().await {
        Ok(_) => Ok("Licença renovada com sucesso!".to_string()),
        Err(error) => Err(error.to_string()),
    }
}

/// Desativa o produto (remove a licença)
#[tauri::command]
pub fn deactivate_license() -> Result<String, String> {
    let validator = LicenseValidator::new();
    
    match validator.deactivate_license() {
        Ok(_) => Ok("Produto desativado com sucesso!".to_string()),
        Err(error) => Err(error.to_string()),
    }
}
