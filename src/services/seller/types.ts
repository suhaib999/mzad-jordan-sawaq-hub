
export interface SavedSeller {
  id: string;
  user_id: string;
  seller_id: string;
  seller_name: string;
  created_at: string;
}

export interface SellerWithProfile extends SavedSeller {
  profile?: {
    avatar_url?: string;
    location?: string;
    full_name?: string;
    username?: string;
  }
}
