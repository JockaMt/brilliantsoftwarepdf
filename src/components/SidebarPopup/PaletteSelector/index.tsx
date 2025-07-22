import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const colorPalettes: ColorPalette[] = [
  {
    id: "classic",
    name: "palette_classic",
    colors: {
      primary: "#C9A961", // Ouro clássico
      secondary: "#8B7355", // Bronze
      accent: "#D4AF37", // Ouro dourado
      background: "#FEFDF8", // Creme suave
      text: "#2C2416" // Marrom escuro
    }
  },
  {
    id: "modern",
    name: "palette_modern",
    colors: {
      primary: "#C0C0C0", // Prata
      secondary: "#8B7D6B", // Bronze escuro
      accent: "#FFD700", // Ouro brilhante
      background: "#FAFAFA", // Branco suave
      text: "#2C2C2C" // Cinza muito escuro para contraste
    }
  },
  {
    id: "luxury",
    name: "palette_luxury",
    colors: {
      primary: "#722F37", // Vinho luxuoso
      secondary: "#D4AF37", // Ouro
      accent: "#8B0000", // Vermelho escuro
      background: "#FAF0E6", // Linho
      text: "#2F1B14" // Marrom profundo
    }
  },
  {
    id: "rose_gold",
    name: "palette_rose_gold",
    colors: {
      primary: "#CD7F32", // Bronze rosé mais escuro
      secondary: "#B8860B", // Ouro escuro
      accent: "#D2691E", // Chocolate
      background: "#FFF8F0", // Floral white
      text: "#2F1B14" // Marrom escuro para contraste
    }
  },
  {
    id: "white_gold",
    name: "palette_white_gold",
    colors: {
      primary: "#DCDCDC", // Ouro branco mais escuro
      secondary: "#808080", // Prata mais escura
      accent: "#2E4B7C", // Steel blue mais escuro
      background: "#FAFAFA", // Fundo mais claro
      text: "#2C2C2C" // Texto muito mais escuro para alto contraste
    }
  },
  {
    id: "diamond",
    name: "palette_diamond",
    colors: {
      primary: "#4169E1", // Royal blue mais escuro
      secondary: "#6A5ACD", // Slate blue
      accent: "#00CED1", // Dark turquoise
      background: "#F8FAFF", // Azul muito claro
      text: "#0B1426" // Azul marinho muito escuro
    }
  },
  {
    id: "emerald",
    name: "palette_emerald",
    colors: {
      primary: "#50C878", // Verde esmeralda
      secondary: "#228B22", // Forest green
      accent: "#9ACD32", // Yellow green
      background: "#F5FFFA", // Mint cream
      text: "#006400" // Dark green
    }
  },
  {
    id: "ruby",
    name: "palette_ruby",
    colors: {
      primary: "#E0115F", // Rubi
      secondary: "#DC143C", // Crimson
      accent: "#FF6347", // Tomato
      background: "#FFF0F5", // Lavender blush
      text: "#8B0000" // Dark red
    }
  },
  {
    id: "sapphire",
    name: "palette_sapphire",
    colors: {
      primary: "#0F52BA", // Azul safira
      secondary: "#191970", // Midnight blue
      accent: "#4169E1", // Royal blue
      background: "#F0F8FF", // Alice blue
      text: "#000080" // Navy
    }
  },
  {
    id: "vintage",
    name: "palette_vintage",
    colors: {
      primary: "#D2691E", // Chocolate vintage
      secondary: "#CD853F", // Peru
      accent: "#DEB887", // Burlywood
      background: "#FDF5E6", // Old lace
      text: "#8B4513" // Saddle brown
    }
  }
];

interface PaletteSelectorProps {
  onSelect: (palette: ColorPalette) => void;
  selectedPalette?: string;
}

export const PaletteSelector = ({ onSelect, selectedPalette }: PaletteSelectorProps) => {
  const { t } = useTranslation();
  const [hoveredPalette, setHoveredPalette] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorPalettes.map((palette) => (
          <div
            key={palette.id}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 shadow-sm hover:shadow-md palette-card-hover palette-shimmer",
              selectedPalette === palette.id 
                ? "border-amber-400 ring-2 ring-amber-200 shadow-lg transform scale-105" 
                : "border-gray-200 hover:border-gray-300",
              hoveredPalette === palette.id && selectedPalette !== palette.id && "scale-[1.02] shadow-md"
            )}
            onClick={() => onSelect(palette)}
            onMouseEnter={() => setHoveredPalette(palette.id)}
            onMouseLeave={() => setHoveredPalette(null)}
          >
            {/* Nome da paleta */}
            <div className="mb-3 text-center">
              <span className="text-sm font-semibold text-gray-700">{t(`edit.${palette.name}`)}</span>
            </div>
            
            {/* Prévia das cores */}
            <div className="space-y-2">
              {/* Cores principais em formato de joia */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  {/* Cor primária como "pedra principal" */}
                  <div
                    className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                    style={{ backgroundColor: palette.colors.primary }}
                    title="Cor Principal"
                  />
                  {/* Cores secundárias como "pedras menores" */}
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full shadow-sm border border-white"
                    style={{ backgroundColor: palette.colors.secondary }}
                    title="Cor Secundária"
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full shadow-sm border border-white"
                    style={{ backgroundColor: palette.colors.accent }}
                    title="Cor de Destaque"
                  />
                </div>
              </div>
              
              {/* Barra de cores linear */}
              <div className="h-3 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="flex-1 transition-all duration-300"
                  style={{ backgroundColor: palette.colors.primary }}
                />
                <div
                  className="flex-1 transition-all duration-300"
                  style={{ backgroundColor: palette.colors.secondary }}
                />
                <div
                  className="flex-1 transition-all duration-300"
                  style={{ backgroundColor: palette.colors.accent }}
                />
              </div>
              
              {/* Background e texto */}
              <div className="flex space-x-1">
                <div
                  className="h-2 flex-1 rounded border"
                  style={{ 
                    backgroundColor: palette.colors.background,
                    borderColor: palette.colors.text + "30"
                  }}
                  title="Fundo"
                />
                <div
                  className="h-2 w-6 rounded"
                  style={{ backgroundColor: palette.colors.text }}
                  title="Texto"
                />
              </div>
            </div>
            
            {/* Indicador de seleção */}
            {selectedPalette === palette.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            )}
            
            {/* Brilho de hover */}
            {hoveredPalette === palette.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}
          </div>
        ))}
      </div>
      
      {/* Prévia detalhada da paleta selecionada */}
      {selectedPalette && (
        <div className="mt-8 rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h4 className="text-lg font-semibold text-gray-800">Prévia da Paleta Selecionada</h4>
          </div>
          {(() => {
            const palette = colorPalettes.find(p => p.id === selectedPalette);
            if (!palette) return null;
            
            return (
              <div 
                className="p-8 text-center transition-all duration-500"
                style={{ 
                  backgroundColor: palette.colors.background,
                  color: palette.colors.text,
                }}
              >
                <div className="max-w-md mx-auto space-y-4">
                  <h5 
                    style={{ color: palette.colors.primary }} 
                    className="text-2xl font-bold mb-2"
                  >
                    Coleção Premium
                  </h5>
                  <p 
                    style={{ color: palette.colors.secondary }} 
                    className="text-base mb-4 leading-relaxed"
                  >
                    Descobra nossa seleção exclusiva de jóias artesanais
                  </p>
                  <div className="flex justify-center space-x-3 flex-wrap gap-2">
                    <span 
                      className="px-4 py-2 rounded-full text-sm font-medium shadow-sm border"
                      style={{ 
                        backgroundColor: '#ffffff',
                        color: palette.colors.primary,
                        borderColor: palette.colors.primary + '60'
                      }}
                    >
                      Anéis
                    </span>
                    <span 
                      className="px-4 py-2 rounded-full text-sm font-medium shadow-sm border"
                      style={{ 
                        backgroundColor: '#ffffff',
                        color: palette.colors.accent,
                        borderColor: palette.colors.accent + '60'
                      }}
                    >
                      Colares
                    </span>
                    <span 
                      className="px-4 py-2 rounded-full text-sm font-medium shadow-sm border"
                      style={{ 
                        backgroundColor: '#ffffff',
                        color: palette.colors.secondary,
                        borderColor: palette.colors.secondary + '60'
                      }}
                    >
                      Brincos
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
