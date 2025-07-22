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
import { Input } from "../ui/input";
import { PaletteSelector, ColorPalette } from "../SidebarPopup/PaletteSelector";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { UserSettings } from "../../@types/interfaces/settings";

// Função helper para recarregar a página atual
const reloadCurrentPage = () => {
  // Usar setTimeout para dar tempo ao toast aparecer antes do reload
  setTimeout(() => {
    window.location.reload();
  }, 1000);
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
              reloadCurrentPage();
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
        {(_info, _setInfo) => (
          <>
            <Input type="file" id="file-input" accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                console.log(e.target.files[0]);
              }
            }} />
            <Button onClick={() => {
              console.log("Imagem salva!")
              close();
            }}>{t("general.save")}</Button>
          </>
        )}
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
              reloadCurrentPage();
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
              reloadCurrentPage();
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
    action: () => {
      console.log("Importar catálogo");
    }
  }, {
    title: "catalog.export_catalog",
    url: "#",
    icon: FileInputIcon,
    action: () => {
      console.log("Exportar catálogo");
    }
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