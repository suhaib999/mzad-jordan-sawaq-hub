export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          level: number
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          buyer_id: string
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: string
          seller_id: string
          transaction_id: string
        }
        Insert: {
          buyer_id: string
          comment: string
          created_at?: string
          id?: string
          product_id: string
          rating: string
          seller_id: string
          transaction_id: string
        }
        Update: {
          buyer_id?: string
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: string
          seller_id?: string
          transaction_id?: string
        }
        Relationships: []
      }
      login: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      product_attributes: {
        Row: {
          attribute_name: string
          attribute_value: string
          created_at: string
          id: string
          product_id: string | null
        }
        Insert: {
          attribute_name: string
          attribute_value: string
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Update: {
          attribute_name?: string
          attribute_value?: string
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_shipping: {
        Row: {
          created_at: string | null
          handling_time: string | null
          id: string
          price: number
          product_id: string | null
          shipping_option: string
        }
        Insert: {
          created_at?: string | null
          handling_time?: string | null
          id?: string
          price?: number
          product_id?: string | null
          shipping_option: string
        }
        Update: {
          created_at?: string | null
          handling_time?: string | null
          id?: string
          price?: number
          product_id?: string | null
          shipping_option?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_shipping_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_offers: boolean | null
          attributes: Json | null
          auction_duration: number | null
          brand: string | null
          category: string
          category_id: string | null
          color: string | null
          condition: string
          created_at: string
          currency: string
          current_bid: number | null
          custom_attributes: Json | null
          description: string
          end_time: string | null
          free_shipping: boolean | null
          handling_time: string | null
          id: string
          is_auction: boolean
          is_negotiable: boolean | null
          listing_type: string | null
          local_pickup: boolean | null
          location: string | null
          main_image_url: string | null
          model: string | null
          mzadkumsooq_delivery: boolean | null
          price: number
          provides_shipping: boolean | null
          quantity: number | null
          reserve_price: number | null
          return_policy: string | null
          seller_id: string
          shipping: string | null
          shipping_exclusions: string[] | null
          shipping_fee: number | null
          size: string | null
          start_price: number | null
          status: string
          subcategory_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          warranty: string | null
          year: string | null
        }
        Insert: {
          allow_offers?: boolean | null
          attributes?: Json | null
          auction_duration?: number | null
          brand?: string | null
          category: string
          category_id?: string | null
          color?: string | null
          condition: string
          created_at?: string
          currency?: string
          current_bid?: number | null
          custom_attributes?: Json | null
          description: string
          end_time?: string | null
          free_shipping?: boolean | null
          handling_time?: string | null
          id?: string
          is_auction?: boolean
          is_negotiable?: boolean | null
          listing_type?: string | null
          local_pickup?: boolean | null
          location?: string | null
          main_image_url?: string | null
          model?: string | null
          mzadkumsooq_delivery?: boolean | null
          price: number
          provides_shipping?: boolean | null
          quantity?: number | null
          reserve_price?: number | null
          return_policy?: string | null
          seller_id: string
          shipping?: string | null
          shipping_exclusions?: string[] | null
          shipping_fee?: number | null
          size?: string | null
          start_price?: number | null
          status?: string
          subcategory_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          warranty?: string | null
          year?: string | null
        }
        Update: {
          allow_offers?: boolean | null
          attributes?: Json | null
          auction_duration?: number | null
          brand?: string | null
          category?: string
          category_id?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          currency?: string
          current_bid?: number | null
          custom_attributes?: Json | null
          description?: string
          end_time?: string | null
          free_shipping?: boolean | null
          handling_time?: string | null
          id?: string
          is_auction?: boolean
          is_negotiable?: boolean | null
          listing_type?: string | null
          local_pickup?: boolean | null
          location?: string | null
          main_image_url?: string | null
          model?: string | null
          mzadkumsooq_delivery?: boolean | null
          price?: number
          provides_shipping?: boolean | null
          quantity?: number | null
          reserve_price?: number | null
          return_policy?: string | null
          seller_id?: string
          shipping?: string | null
          shipping_exclusions?: string[] | null
          shipping_fee?: number | null
          size?: string | null
          start_price?: number | null
          status?: string
          subcategory_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          warranty?: string | null
          year?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          phone_number: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          phone_number?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone_number?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_sellers: {
        Row: {
          created_at: string
          id: string
          seller_id: string
          seller_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seller_id: string
          seller_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seller_id?: string
          seller_name?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_options: {
        Row: {
          created_at: string
          handling_time: string | null
          id: string
          method: string
          price: number
          product_id: string | null
        }
        Insert: {
          created_at?: string
          handling_time?: string | null
          id?: string
          method: string
          price: number
          product_id?: string | null
        }
        Update: {
          created_at?: string
          handling_time?: string | null
          id?: string
          method?: string
          price?: number
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          id: string
          product_id: string
          seller_id: string
          status: string
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          id?: string
          product_id: string
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
