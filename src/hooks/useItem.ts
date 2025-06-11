import { IItem } from "@/@types/interfaces/types";
import { fakeItems } from "@/assets/fakeSectionItens";

export function useGetItem (id: string): IItem | undefined {
  //Query para pegar o item
  const item: IItem | undefined = fakeItems.find((e: IItem) => e.id === id)
  console.log(id, item)
  if (item) return item
}
