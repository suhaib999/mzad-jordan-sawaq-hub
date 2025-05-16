
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  message: string;
  attachment_url?: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  product_id: string | null;
  product_title: string | null;
  last_message: string;
  last_message_time: string;
  other_user_id: string;
  other_user_name: string;
  unread_count: number;
  avatar_url?: string;
}

// Helper types for working around type limitations
export type GenericRecord = Record<string, any>;
