export interface UserSettings {
  id: number;
  name: string;
  save_path: string;
  instagram_username: string;
  website_url: string;
  youtube_channel: string;
  image_path: string;
  image_blob?: number[]; // BLOB data como array de bytes
  pallet: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LegacySettings {
  name: string;
  save_path: string;
  instagram_username: string;
  website_url: string;
  youtube_channel: string;
  image_path: string;
  pallet: string;
  phone_number: string;
  email: string;
}
