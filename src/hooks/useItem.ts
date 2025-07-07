import { useEffect, useState } from "react";
import { IItem } from "@/@types/interfaces/types";
import { invoke } from "@tauri-apps/api/core";

export function useGetItem(id: string) {
  const [item, setItem] = useState<IItem>();

  useEffect(() => {
    if (!id) return;

    invoke<IItem>("get_item", { id })
      .then((fetchedItem) => {
        setItem(fetchedItem);
      })
  }, [id]);

  return item;
}
