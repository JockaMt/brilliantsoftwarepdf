use std::collections::HashMap;
use chrono::{DateTime, Utc};
use reqwest;
use serde_json;
use crate::license::types::{
    LicenseInfo, LicenseError, LicenseStatus,
    ActivationRequest, ActivationResponse
};
use crate::license::storage::LicenseStorage;

pub struct LicenseValidator {
    api_base_url: String,
}

impl LicenseValidator {
    pub fn new() -> Self {
        // let api_base = option_env!("LICENSE_API_URL")
        //     .map(|s| s.to_string())
        //     .or_else(|| std::env::var("LICENSE_API_URL").ok())
        //     .unwrap_or_else(|| "http://localhost:3030".to_string());
        // Self { api_base_url: api_base }
        let api_base = "http://localhost:3030".to_string();
        Self { api_base_url: api_base }
    }
    
    /// Gera o código único da máquina baseado no hardware
    pub fn get_machine_code() -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        
        // Usar informações do sistema para gerar código único
        if let Ok(hostname) = std::env::var("COMPUTERNAME") {
            hostname.hash(&mut hasher);
        } else if let Ok(hostname) = std::env::var("HOSTNAME") {
            hostname.hash(&mut hasher);
        }
        
        if let Ok(username) = std::env::var("USERNAME") {
            username.hash(&mut hasher);
        } else if let Ok(username) = std::env::var("USER") {
            username.hash(&mut hasher);
        }
        
        // Adicionar ID do processador se possível
        #[cfg(target_os = "windows")]
        {
            if let Ok(processor) = std::env::var("PROCESSOR_IDENTIFIER") {
                processor.hash(&mut hasher);
            }
        }
        
        let hash = hasher.finish();
        format!("MC-{:016X}", hash)
    }
    
    /// Ativa o produto com uma chave de licença
    pub async fn activate_license(&self, license_key: String) -> Result<LicenseInfo, LicenseError> {
        let machine_code = Self::get_machine_code();
        
        let activation_request = ActivationRequest {
            key: license_key.clone(),
            machine_code: machine_code.clone(),
        };
        
        let client = reqwest::Client::new();
        let url = format!("{}/api/activate", self.api_base_url);
        
        let response = client
            .post(&url)
            .json(&activation_request)
            .send()
            .await
            .map_err(|_| LicenseError::NetworkError)?;
            
        if response.status().is_success() {
            let activation_response: ActivationResponse = response
                .json()
                .await
                .map_err(|_| LicenseError::ValidationError("Resposta inválida do servidor".to_string()))?;
                
            if let Some(license_data) = activation_response.license {
                let license_info = LicenseInfo {
                    key: license_data.key,
                    machine_code,
                    expires: license_data.expires,
                    product_id: license_data.product_id,
                    premium: license_data.premium,
                    max_offline_days: license_data.max_offline_days,
                    last_activation: Some(Utc::now()),
                    cached_at: Utc::now(),
                };
                
                // Salvar licença localmente
                LicenseStorage::save_license(&license_info)?;
                
                Ok(license_info)
            } else {
                Err(LicenseError::ValidationError("Dados de licença não recebidos".to_string()))
            }
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Erro desconhecido".to_string());
            Err(LicenseError::ValidationError(error_text))
        }
    }
    
    /// Valida a licença (online se possível, offline se necessário)
    pub async fn validate_license(&self) -> Result<LicenseStatus, LicenseError> {
        let license = LicenseStorage::load_license()?;
        
        // Verificar se a licença expirou
        let now = Utc::now();
        if license.expires < now {
            return Ok(LicenseStatus::Expired);
        }
        
        // Tentar validar online primeiro
        match self.validate_online(&license).await {
            Ok(status) => Ok(status),
            Err(_) => {
                // Se falhou online, validar offline
                self.validate_offline(&license)
            }
        }
    }
    
    /// Valida a licença online
    async fn validate_online(&self, license: &LicenseInfo) -> Result<LicenseStatus, LicenseError> {
        let client = reqwest::Client::new();
        let url = format!("{}/api/validate", self.api_base_url);
        
        let mut payload = HashMap::new();
        payload.insert("key", &license.key);
        payload.insert("machineCode", &license.machine_code);
        
        let response = client
            .post(&url)
            .json(&payload)
            .timeout(std::time::Duration::from_secs(10))
            .send()
            .await
            .map_err(|_| LicenseError::NetworkError)?;
            
        if response.status().is_success() {
            // Atualizar cache local
            let mut updated_license = license.clone();
            updated_license.last_activation = Some(Utc::now());
            updated_license.cached_at = Utc::now();
            
            if let Err(_) = LicenseStorage::save_license(&updated_license) {
                // Não é crítico se falhar ao salvar o cache
            }
            
            let now = Utc::now();
            let days_until_expiry = (license.expires - now).num_days();
            
            if days_until_expiry <= 7 {
                Ok(LicenseStatus::NearExpiration(days_until_expiry))
            } else {
                Ok(LicenseStatus::Valid)
            }
        } else {
            Err(LicenseError::NetworkError)
        }
    }
    
    /// Valida a licença offline
    fn validate_offline(&self, license: &LicenseInfo) -> Result<LicenseStatus, LicenseError> {
        let now = Utc::now();
        
        // Verificar se a licença expirou
        if license.expires < now {
            return Ok(LicenseStatus::Expired);
        }
        
        // Verificar período offline
        if let Some(last_activation) = license.last_activation {
            let days_offline = (now - last_activation).num_days();
            
            if days_offline > license.max_offline_days as i64 {
                return Ok(LicenseStatus::OfflineExpired);
            }
        }
        
        // Verificar se está próximo da expiração
        let days_until_expiry = (license.expires - now).num_days();
        
        if days_until_expiry <= 7 {
            Ok(LicenseStatus::NearExpiration(days_until_expiry))
        } else {
            Ok(LicenseStatus::Valid)
        }
    }
    
    /// Renova a licença online
    pub async fn renew_license(&self) -> Result<LicenseInfo, LicenseError> {
        let license = LicenseStorage::load_license()?;
        
        let client = reqwest::Client::new();
        let url = format!("{}/api/renew-brilliant-pdf", self.api_base_url);
        
        let mut payload = HashMap::new();
        payload.insert("key", &license.key);
        
        let response = client
            .put(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|_| LicenseError::NetworkError)?;
            
        if response.status().is_success() {
            let renewal_response: serde_json::Value = response
                .json()
                .await
                .map_err(|_| LicenseError::ValidationError("Resposta inválida do servidor".to_string()))?;
                
            if let Some(new_expiry_str) = renewal_response.get("newExpirationDate").and_then(|v| v.as_str()) {
                let new_expiry: DateTime<Utc> = new_expiry_str.parse()
                    .map_err(|_| LicenseError::ValidationError("Data de expiração inválida".to_string()))?;
                
                let mut updated_license = license;
                updated_license.expires = new_expiry;
                updated_license.last_activation = Some(Utc::now());
                updated_license.cached_at = Utc::now();
                
                LicenseStorage::save_license(&updated_license)?;
                Ok(updated_license)
            } else {
                Err(LicenseError::ValidationError("Nova data de expiração não recebida".to_string()))
            }
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Erro desconhecido".to_string());
            Err(LicenseError::ValidationError(error_text))
        }
    }
    
    /// Obtém informações da licença atual
    pub fn get_license_info(&self) -> Result<LicenseInfo, LicenseError> {
        LicenseStorage::load_license()
    }
    
    /// Remove a licença (desativa o produto)
    pub fn deactivate_license(&self) -> Result<(), LicenseError> {
        LicenseStorage::delete_license()
    }
    
    /// Verifica se o produto está ativado
    pub fn is_activated(&self) -> bool {
        LicenseStorage::license_exists()
    }
}
