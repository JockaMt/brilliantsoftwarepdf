import { IItem, IInfo } from "@/@types/interfaces/types"

const infoFake: IInfo[] = [
  { id: "1", name: "Material", details: "Ouro 18k" },
  { id: "2", name: "Peso", details: "2g" },
  { id: "3", name: "Garantia", details: "1 ano" },
  { id: "4", name: "Tamanho", details: "17" },
  { id: "5", name: "Pedra", details: "Zircônia" },
  { id: "6", name: "Acabamento", details: "Polido" },
  { id: "7", name: "Tipo de Fecho", details: "Gaveta" },
  { id: "8", name: "Cor", details: "Dourado" },
  { id: "9", name: "Gênero", details: "Feminino" },
  { id: "10", name: "Origem", details: "Nacional" },
  { id: "11", name: "Antialérgico", details: "Sim" },
  { id: "12", name: "Largura", details: "4mm" },
  { id: "13", name: "Espessura", details: "1.2mm" },
  { id: "14", name: "Coleção", details: "Primavera 2024" },
  { id: "15", name: "Personalizável", details: "Sim, com gravação" }
];

function getRandomItems(source: IInfo[], count: number): IInfo[] {
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Replace 'id' with the correct property as defined in IItem, e.g., 'item_id' (adjust as per your IItem interface)
export const fakeItems: IItem[] = [
  { code: "1001", image_path: "url/to/image.jpg", description: "Anel de ouro", section_id: "12", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1002", image_path: "url/to/image.jpg", description: "Colar de prata", section_id: "13", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1003", image_path: "url/to/image.jpg", description: "Pulseira de couro", section_id: "14", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1004", image_path: "url/to/image.jpg", description: "Brinco com pedra", section_id: "15", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1005", image_path: "url/to/image.jpg", description: "Pingente de prata", section_id: "16", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1006", image_path: "url/to/image.jpg", description: "Tornozeleira delicada", section_id: "17", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1007", image_path: "url/to/image.jpg", description: "Aliança de compromisso", section_id: "18", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1008", image_path: "url/to/image.jpg", description: "Broche vintage", section_id: "19", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1009", image_path: "url/to/image.jpg", description: "Relógio dourado", section_id: "20", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1010", image_path: "url/to/image.jpg", description: "Corrente fina", section_id: "21", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1011", image_path: "url/to/image.jpg", description: "Piercing pequeno", section_id: "22", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1012", image_path: "url/to/image.jpg", description: "Joia personalizada com nome", section_id: "23", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1013", image_path: "url/to/image.jpg", description: "Conjunto de anel e colar", section_id: "24", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1014", image_path: "url/to/image.jpg", description: "Joia infantil delicada", section_id: "25", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1015", image_path: "url/to/image.jpg", description: "Pulseira masculina", section_id: "26", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1016", image_path: "url/to/image.jpg", description: "Colar feminino elegante", section_id: "27", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1017", image_path: "url/to/image.jpg", description: "Pingente religioso", section_id: "28", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1018", image_path: "url/to/image.jpg", description: "Pingente com nome", section_id: "29", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1019", image_path: "url/to/image.jpg", description: "Joia com pedra natural", section_id: "30", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1020", image_path: "url/to/image.jpg", description: "Anel de noivado", section_id: "31", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) },
  { code: "1021", image_path: "url/to/image.jpg", description: "Anel de formatura", section_id: "32", infos: getRandomItems(infoFake, Math.floor(Math.random() * 15)) }
];
