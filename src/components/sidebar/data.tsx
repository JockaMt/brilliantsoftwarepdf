import {
  BugIcon,
  FileInputIcon,
  FileOutputIcon,
  FolderIcon,
  ImageIcon, LucideIcon,
  LucidePalette,
  Pencil,
  PhoneIcon,
  TrashIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import SidebarPopup from "../SidebarPopup";
import PopupInput from "../SidebarPopup/Input";
import { Button } from "../ui/button";
import { t } from "i18next";
import { invoke } from "@tauri-apps/api/core";
import { PaletteSelector, ColorPalette } from "../SidebarPopup/PaletteSelector";
import { toast } from "sonner";
import { UserSettings } from "../../@types/interfaces/settings";
import { ImageUploader } from "../ImageUploader";

// Função helper removida - callbacks cuidam da atualização sem reload automático
// const reloadCurrentPage = () => {
//   // Usar setTimeout para dar tempo ao toast aparecer antes do reload
//   setTimeout(() => {
//     window.location.reload();
//   }, 1000);
// };

// Função de substituição para evitar reloads desnecessários
const updateUI = () => {
  // Dispatch evento customizado para atualizar as tabelas
  window.dispatchEvent(new CustomEvent('catalog-updated'));
};


export interface Data {
  title: string;
  url: string;
  icon: LucideIcon;
  popup?: (close: () => void) => JSX.Element;
  action?: () => void;
}

export const itemsProfile: Data[] = [
  {
    title: "edit.edit_name",
    url: "#",
    icon: Pencil,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_name"
        description="edit.edit_name_description"
      >
        {(info, setInfo) => {
          const [currentSettings, setCurrentSettings] = useState<UserSettings | null>(null);
          
          // Carregar configurações atuais
          useEffect(() => {
            invoke<UserSettings>("get_settings")
              .then((settings) => {
                setCurrentSettings(settings);
                setInfo(settings.name);
              })
              .catch(console.error);
          }, []);
          
          const handleSave = async () => {
            if (!currentSettings || !info.trim()) {
              toast.error("Nome é obrigatório");
              return;
            }
            
            try {
              const updatedSettings = { ...currentSettings, name: info.trim() };
              await invoke("save_settings_command", { settings: updatedSettings });
              toast.success("Nome atualizado com sucesso!");
              close();
              updateUI(); // Substituído reload por callback otimizado
            } catch (error) {
              console.error("Erro ao salvar nome:", error);
              toast.error("Erro ao salvar nome");
            }
          };
          
          return (
            <>
              <PopupInput
                value={info}
                onChange={setInfo}
                placeholder="Digite seu novo nome"
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => close()}>
                  {t("general.cancel")}
                </Button>
                <Button onClick={handleSave} disabled={!info.trim()}>
                  {t("general.save")}
                </Button>
              </div>
            </>
          );
        }}
      </SidebarPopup>
    )
  }, {
    title: "edit.edit_image",
    url: "#",
    icon: ImageIcon,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_image"
        description="edit.edit_image_description"
      >
        {(_info, _setInfo) => {
          const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
          
          // Carregar imagem atual
          useEffect(() => {
            invoke<UserSettings>("get_settings")
              .then(async (_settings) => {
                // Tentar carregar a imagem do banco
                try {
                  const imageData: number[] | null = await invoke('get_user_image');
                  if (imageData && imageData.length > 0) {
                    const uint8Array = new Uint8Array(imageData);
                    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
                    const url = URL.createObjectURL(blob);
                    setCurrentImageUrl(url);
                  }
                } catch (error) {
                  console.error('Erro ao carregar imagem:', error);
                }
              })
              .catch(console.error);
          }, []);
          
          const handleImageUploaded = async (imageUrl: string) => {
            setCurrentImageUrl(imageUrl);
            toast.success("Imagem salva com sucesso!");
            close();
            updateUI(); // Substituído reload por callback otimizado
          };
          
          return (
            <div className="flex flex-col items-center space-y-4">
              <ImageUploader
                currentImageUrl={currentImageUrl}
                onImageUploaded={handleImageUploaded}
                size="lg"
              />
              <div className="flex justify-end space-x-3 pt-4 w-full">
                <Button variant="outline" onClick={close}>
                  {t("general.cancel")}
                </Button>
              </div>
            </div>
          );
        }}
      </SidebarPopup>
    )
  }, {
    title: "edit.edit_palette",
    url: "#",
    icon: LucidePalette,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_palette"
        description="edit.edit_palette_description"
      >
        {(info, setInfo) => {
          const [currentPalette, setCurrentPalette] = useState<string>('classic');
          const selectedPalette = info || currentPalette;
          
          // Carregar paleta atual das configurações
          useEffect(() => {
            invoke<UserSettings>("get_settings")
              .then((settings) => {
                setCurrentPalette(settings.pallet || 'classic');
                setInfo(settings.pallet || 'classic');
              })
              .catch(console.error);
          }, []);
          
          const handlePaletteSelect = (palette: ColorPalette) => {
            setInfo(palette.id);
          };
          
          const handleSave = async () => {
            try {
              await invoke("save_palette", { paletteId: selectedPalette });
              toast.success(t("edit.palette_saved"));
              close();
              updateUI(); // Substituído reload por callback otimizado
            } catch (error) {
              console.error("Erro ao salvar paleta:", error);
              toast.error(t("edit.palette_save_error"));
            }
          };
          
          return (
            <div className="space-y-6">
              <PaletteSelector 
                onSelect={handlePaletteSelect}
                selectedPalette={selectedPalette}
              />
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => close()}
                  className="px-6"
                >
                  {t("general.cancel")}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!selectedPalette}
                >
                  {t("general.save")}
                </Button>
              </div>
            </div>
          );
        }}
      </SidebarPopup>
    )
  }, {
    title: "edit.edit_phone",
    url: "#",
    icon: PhoneIcon,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_phone"
        description="edit.edit_phone_description"
      >
        {(info, setInfo) => {
          const [currentSettings, setCurrentSettings] = useState<UserSettings | null>(null);
          
          // Carregar configurações atuais
          useEffect(() => {
            invoke<UserSettings>("get_settings")
              .then((settings) => {
                setCurrentSettings(settings);
                setInfo(settings.phone_number);
              })
              .catch(console.error);
          }, []);
          
          const handleSave = async () => {
            if (!currentSettings) {
              toast.error("Erro ao carregar configurações");
              return;
            }
            
            try {
              const updatedSettings = { ...currentSettings, phone_number: info.trim() };
              await invoke("save_settings_command", { settings: updatedSettings });
              toast.success("Número de telefone atualizado com sucesso!");
              close();
              updateUI(); // Substituído reload por callback otimizado
            } catch (error) {
              console.error("Erro ao salvar telefone:", error);
              toast.error("Erro ao salvar número de telefone");
            }
          };
          
          return (
            <>
              <PopupInput
                value={info}
                onChange={setInfo}
                placeholder="Digite o novo número de telefone"
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => close()}>
                  {t("general.cancel")}
                </Button>
                <Button onClick={handleSave}>
                  {t("general.save")}
                </Button>
              </div>
            </>
          );
        }}
      </SidebarPopup>
    )
  }
]

export const itemsSettings: Data[] = [
  {
    title: "catalog.import_catalog",
    url: "#",
    icon: FileOutputIcon,
    popup: (close) => (
      <SidebarPopup
        title="catalog.import_catalog"
        description="catalog.import_catalog_description"
      >
        {(_info, _setInfo) => {
          // Log para debug
          console.log("Import component rendered");
          
          const handleFileImport = async (file: File) => {
            console.log("handleFileImport called with:", file.name);
            const loading_toast = toast.loading(t("catalog.importing"));
            try {
              const arrayBuffer = await file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              
              const tempPath = await invoke<string>("save_temp_file", {
                fileName: file.name,
                data: Array.from(uint8Array)
              });
              
              await invoke("import_catalog", { 
                filePath: tempPath,
                preserveCurrent: false 
              });
              
              toast.dismiss(loading_toast);
              toast.success(t("catalog.imported_successfully"));
              updateUI();
              close();
            } catch (error) {
              toast.dismiss(loading_toast);
              toast.error(t("catalog.import_error") + ": " + error);
            }
          };

          return (
            <>
              <div className="space-y-4">
                {/* Input file oculto */}
                <input
                  type="file"
                  accept=".catalog"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log("File selected via input:", file.name);
                      handleFileImport(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="catalog-file-input"
                />
                
                {/* Botão principal de importação */}
                <Button 
                  variant="default" 
                  onClick={() => {
                    const input = document.getElementById('catalog-file-input') as HTMLInputElement;
                    input?.click();
                  }}
                  className="w-full h-16 text-lg"
                >
                  <FileOutputIcon className="mr-2 h-6 w-6" />
                  {t("catalog.select_file")}
                </Button>
                
                <p className="text-sm text-gray-600 text-center">
                  {t("catalog.supported_format")}: .catalog
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => close()}>
                  {t("general.cancel")}
                </Button>
              </div>
            </>
          );
        }}
      </SidebarPopup>
    )
  }, {
    title: "catalog.export_catalog",
    url: "#",
    icon: FileInputIcon,
    popup: (close) => (
      <SidebarPopup
        title="catalog.export_catalog"
        description="catalog.export_catalog_description"
      >
        {(_info, _setInfo) => {
          const handleExport = async () => {
            try {
              const savePath = await invoke<string | null>("save_file_dialog", { 
                defaultName: "catalogo.catalog" 
              });
              
              if (savePath) {
                const loading_toast = toast.loading(t("catalog.exporting"));
                try {
                  await invoke("export_catalog", { filePath: savePath });
                  toast.dismiss(loading_toast);
                  toast.success(t("catalog.exported_successfully"));
                  close();
                } catch (error) {
                  toast.dismiss(loading_toast);
                  toast.error(t("catalog.export_error") + ": " + error);
                }
              }
            } catch (error) {
              toast.error(t("catalog.save_dialog_error"));
            }
          };

          return (
            <div className="space-y-4">
              <Button 
                variant="default" 
                onClick={handleExport}
                className="w-full h-16 text-lg"
              >
                <FileInputIcon className="mr-2 h-6 w-6" />
                {t("general.export")}
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                Exportar o catálogo atual
              </p>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => close()}>
                  {t("general.cancel")}
                </Button>
              </div>
            </div>
          );
        }}
      </SidebarPopup>
    )
  }, {
    title: "catalog.save_location",
    url: "#",
    icon: FolderIcon,
    action: () => {
      console.log("Salvar localização do catálogo");
    }
  }, {
    title: "catalog.delete_catalog",
    url: "#",
    icon: TrashIcon,
    popup: (close) => (
      <SidebarPopup
        title="catalog.delete_catalog"
        description="catalog.delete_catalog_description"
      >
        {(_info, _setInfo) => (
          <>
          <Button
          type="submit"
            onClick={() => {
              close();
            }}
          >{t("general.cancel")}</Button>
            <Button
              onClick={() => {
                console.log("Catálogo deletado!");
                close();
              }}
            >
              {t("general.delete")}
            </Button>
          </>
        )}
      </SidebarPopup>
    )
  }
]

export const itemsHelp: Data[] = [
  {
    title: "feedback.report_bug",
    url: "#",
    icon: BugIcon,
    popup: (close) => (
      <SidebarPopup
        title="feedback.report_bug"
        description="feedback.report_bug_description"
      >
        {(info, setInfo) => (
          <>
            <PopupInput
              value={info}
              onChange={setInfo}
              placeholder="Digite o relatório do bug"
            />
            <Button onClick={() => {
              console.log("Relatório de bug enviado!");
              close();
            }}>{t("general.save")}</Button>
          </>
        )}
      </SidebarPopup>
    )
  }
]