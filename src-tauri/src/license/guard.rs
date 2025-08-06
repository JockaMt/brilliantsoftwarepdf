use crate::license::{LicenseValidator, LicenseStatus};
use std::sync::{Arc, Mutex};
use tokio::time::{interval, Duration};

pub struct LicenseGuard {
    validator: LicenseValidator,
    is_valid: Arc<Mutex<bool>>,
}

impl LicenseGuard {
    pub fn new() -> Self {
        Self {
            validator: LicenseValidator::new(),
            is_valid: Arc::new(Mutex::new(false)),
        }
    }
    
    /// Inicia a validação inicial e o processo de verificação periódica
    pub async fn start_validation(&self) -> Result<(), String> {
        // Verificação inicial
        self.check_license().await?;
        
        // Iniciar verificação periódica em background
        let validator = LicenseValidator::new();
        let is_valid = Arc::clone(&self.is_valid);
        
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(3600)); // Verificar a cada hora
            
            loop {
                interval.tick().await;
                
                match validator.validate_license().await {
                    Ok(status) => {
                        let valid = matches!(status, LicenseStatus::Valid | LicenseStatus::NearExpiration(_));
                        *is_valid.lock().unwrap() = valid;
                        
                        if !valid {
                            eprintln!("Licença inválida detectada durante verificação periódica");
                        }
                    }
                    Err(e) => {
                        eprintln!("Erro na verificação periódica da licença: {}", e);
                        *is_valid.lock().unwrap() = false;
                    }
                }
            }
        });
        
        Ok(())
    }
    
    /// Verifica se a licença está válida
    async fn check_license(&self) -> Result<(), String> {
        if !self.validator.is_activated() {
            return Err("Produto não está ativado. Por favor, ative o produto para continuar.".to_string());
        }
        
        match self.validator.validate_license().await {
            Ok(LicenseStatus::Valid) => {
                *self.is_valid.lock().unwrap() = true;
                Ok(())
            }
            Ok(LicenseStatus::NearExpiration(days)) => {
                *self.is_valid.lock().unwrap() = true;
                println!("Aviso: Sua licença expira em {} dias", days);
                Ok(())
            }
            Ok(LicenseStatus::Expired) => {
                *self.is_valid.lock().unwrap() = false;
                Err("Sua licença expirou. Por favor, renove para continuar usando o produto.".to_string())
            }
            Ok(LicenseStatus::NotActivated) => {
                *self.is_valid.lock().unwrap() = false;
                Err("Produto não está ativado. Por favor, ative o produto para continuar.".to_string())
            }
            Ok(LicenseStatus::OfflineExpired) => {
                *self.is_valid.lock().unwrap() = false;
                Err("Período offline expirado. Conecte-se à internet para validar sua licença.".to_string())
            }
            Err(e) => {
                *self.is_valid.lock().unwrap() = false;
                Err(format!("Erro na validação da licença: {}", e))
            }
        }
    }
    
    /// Verifica se o produto pode ser usado
    pub fn can_use_product(&self) -> bool {
        *self.is_valid.lock().unwrap()
    }
    
    /// Obtém o status da validação para exibir ao usuário
    pub async fn get_validation_message(&self) -> String {
        if !self.validator.is_activated() {
            return "Produto não ativado".to_string();
        }
        
        match self.validator.validate_license().await {
            Ok(LicenseStatus::Valid) => "Licença válida".to_string(),
            Ok(LicenseStatus::NearExpiration(days)) => format!("Licença expira em {} dias", days),
            Ok(LicenseStatus::Expired) => "Licença expirada".to_string(),
            Ok(LicenseStatus::NotActivated) => "Produto não ativado".to_string(),
            Ok(LicenseStatus::OfflineExpired) => "Período offline expirado".to_string(),
            Err(e) => format!("Erro: {}", e),
        }
    }
}

/// Middleware para verificar licença antes de executar comandos críticos
pub fn check_license_middleware() -> Result<(), String> {
    let validator = LicenseValidator::new();
    
    if !validator.is_activated() {
        return Err("Produto não ativado. Ative o produto para usar esta funcionalidade.".to_string());
    }
    
    // Para comandos críticos, podemos fazer uma verificação síncrona básica
    // A verificação completa acontece em background
    Ok(())
}
