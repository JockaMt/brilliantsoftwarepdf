pub mod check;
pub mod download;

// Reexporta funções diretamente (opcional)
pub use check::check_for_update;
pub use download::download_and_install_update;