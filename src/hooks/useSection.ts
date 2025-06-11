import { ISection } from "@/@types/interfaces/types";
import { invoke } from "@tauri-apps/api/core";

export async function useGetSection (id: string): Promise<ISection | null> {
  return await invoke<ISection | null>("get_section", {uuid: id})
}
