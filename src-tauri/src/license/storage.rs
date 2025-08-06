use std::path::PathBuf;
use std::fs;
use dirs_next::data_dir;
use serde_json;
use crate::license::types::{LicenseInfo, LicenseError};

pub struct LicenseStorage;

impl LicenseStorage {
    pub fn get_license_path() -> Result<PathBuf, LicenseError> {
        let mut data_path = data_dir().ok_or(LicenseError::StorageError)?;
        data_path.push("BrilliantPDF");
        data_path.push("license");
        
        // Criar diretório se não existir
        fs::create_dir_all(&data_path).map_err(|_| LicenseError::StorageError)?;
        
        data_path.push("license.json");
        Ok(data_path)
    }
    
    pub fn save_license(license: &LicenseInfo) -> Result<(), LicenseError> {
        let path = Self::get_license_path()?;
        
        let json = serde_json::to_string_pretty(license)
            .map_err(|_| LicenseError::StorageError)?;
            
        fs::write(path, json).map_err(|_| LicenseError::StorageError)?;
        Ok(())
    }
    
    pub fn load_license() -> Result<LicenseInfo, LicenseError> {
        let path = Self::get_license_path()?;
        
        if !path.exists() {
            return Err(LicenseError::NotActivated);
        }
        
        let content = fs::read_to_string(path)
            .map_err(|_| LicenseError::StorageError)?;
            
        let license: LicenseInfo = serde_json::from_str(&content)
            .map_err(|_| LicenseError::StorageError)?;
            
        Ok(license)
    }
    
    pub fn delete_license() -> Result<(), LicenseError> {
        let path = Self::get_license_path()?;
        
        if path.exists() {
            fs::remove_file(path).map_err(|_| LicenseError::StorageError)?;
        }
        
        Ok(())
    }
    
    pub fn license_exists() -> bool {
        if let Ok(path) = Self::get_license_path() {
            path.exists()
        } else {
            false
        }
    }
}
