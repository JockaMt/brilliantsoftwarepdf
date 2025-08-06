use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub key: String,
    pub machine_code: String,
    pub expires: DateTime<Utc>,
    pub product_id: String,
    pub premium: bool,
    pub max_offline_days: i32,
    pub last_activation: Option<DateTime<Utc>>,
    pub cached_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivationRequest {
    pub key: String,
    #[serde(rename = "machineCode")]
    pub machine_code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivationResponse {
    pub message: String,
    pub license: Option<LicenseData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseData {
    pub id: String,
    pub key: String,
    pub expires: DateTime<Utc>,
    #[serde(rename = "productId")]
    pub product_id: String,
    pub premium: bool,
    #[serde(rename = "maxOfflineDays")]
    pub max_offline_days: i32,
    #[serde(rename = "machineCode")]
    pub machine_code: Option<String>,
    #[serde(rename = "lastActivation")]
    pub last_activation: Option<DateTime<Utc>>,
}

#[derive(Debug)]
pub enum LicenseError {
    NotActivated,
    Expired,
    InvalidKey,
    NetworkError,
    StorageError,
    ValidationError(String),
    OfflineExpired,
}

impl std::fmt::Display for LicenseError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            LicenseError::NotActivated => write!(f, "Produto não foi ativado"),
            LicenseError::Expired => write!(f, "Licença expirada"),
            LicenseError::InvalidKey => write!(f, "Chave de licença inválida"),
            LicenseError::NetworkError => write!(f, "Erro de conexão com o servidor"),
            LicenseError::StorageError => write!(f, "Erro ao acessar dados da licença"),
            LicenseError::ValidationError(msg) => write!(f, "Erro de validação: {}", msg),
            LicenseError::OfflineExpired => write!(f, "Período offline expirado - conecte-se à internet"),
        }
    }
}

#[derive(Debug)]
pub enum LicenseStatus {
    Valid,
    NearExpiration(i64), // dias restantes
    Expired,
    NotActivated,
    OfflineExpired,
}
