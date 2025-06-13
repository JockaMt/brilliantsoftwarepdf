export interface IInfo {
  id: string
  name: string
  details: string
}

export interface IItem {
  code: string
  image_path: string
  description: string
  section_id: string
  infos: IInfo[]
}


export interface ISection {
  id: string
  name: string
  items: IItem[]
}