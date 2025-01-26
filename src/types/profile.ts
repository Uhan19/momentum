export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}
