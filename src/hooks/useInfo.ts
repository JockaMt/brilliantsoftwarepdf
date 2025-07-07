import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IInfo } from "@/@types/interfaces/types";

export async function useGetInfo(code: string) {
  const [info, setInfo] = useState<IInfo>();
  console.log("code", code);
  useEffect(() => {
    if (!code) return;

    invoke<IInfo>("list_infos", { itemCode: code })
      .then((fetchedInfo) => {
        setInfo(fetchedInfo);
      })
    }, []);
    console.log("useGetInfo", info);
    return info;
}
