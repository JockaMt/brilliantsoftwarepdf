import { IItem } from "@/@types/interfaces/types";
import { fakeItems } from "./fakeSectionItens";

function getRandomItems(source: IItem[], count: number): IItem[] {
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const fakeDatabase = [
  { id: "1a", name: "pulseiras", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "2b", name: "brincos", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "3c", name: "alianças", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "4d", name: "alianças de prata", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "5e", name: "alianças de ouro", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "6f", name: "correntes", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "7g", name: "pingentes", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "8h", name: "gravações", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "9i", name: "outros", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "21j", name: "diversos", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "11k", name: "conjuntos", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "12l", name: "presentes", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "13m", name: "acessórios", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "14n", name: "promoções", items: getRandomItems(fakeItems, Math.random() * 21)},
  { id: "15o", name: "lançamentos", items: getRandomItems(fakeItems, Math.random() * 21)},
];
