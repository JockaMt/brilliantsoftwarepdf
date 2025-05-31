export interface ISection {
  id: string
  name: string
}

export interface IInfo {
  id: string;
  item_id: string;
  details: string;
}

export interface IItem {
  id: string,
  code?: number
  image: string,
  description: string,
  section: ISection,
  infos: IInfo[],
  loss: number,
  time: number,
}



export interface ISectionData {
  id: string
  name: string
  items: number
}