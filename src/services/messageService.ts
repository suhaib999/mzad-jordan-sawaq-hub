
import { supabase } from '@/integrations/supabase/client';
import { Conversation, GenericRecord, Message } from '@/types/message';
import { toast } from '@/hooks/use-toast';

// Fetch user conversations
export const fetchUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    // Use type assertion to work around TypeScript limitation
    const { data: conversationsData, error } = await (supabase
      .from('conversations') as any)
      .select(`
        id,
        product_id,
        products:product_id (title),
        last_message,
        last_message_time,
        participant1_id,
        participant2_id,
        participant1:participant1_id (username, full_name, avatar_url),
        participant2:participant2_id (username, full_name, avatar_url),
        unread_count
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_time', { ascending: false });

    if (error) throw error;

    // Transform the data to match our interface
    const formattedConversations: Conversation[] = (conversationsData as GenericRecord[]).map(conv => {
      const isParticipant1 = conv.participant1_id === userId;
      const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1;

      return {
        id: conv.id,
        product_id: conv.product_id,
        product_title: conv.products?.title || null,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        other_user_id: isParticipant1 ? conv.participant2_id : conv.participant1_id,
        other_user_name: otherParticipant?.full_name || otherParticipant?.username || 'Unknown User',
        unread_count: conv.unread_count || 0,
        avatar_url: otherParticipant?.avatar_url
      };
    });

    return formattedConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast({
      title: 'Error',
      description: 'Failed to load conversations.',
      variant: 'destructive',
    });
    return [];
  }
};

// Fetch messages for a conversation
export const fetchConversationMessages = async (conversationId: string, userId: string): Promise<Message[]> => {
  try {
    // Use type assertion to work around TypeScript limitation
    const { data: messagesData, error } = await (supabase
      .from('messages') as any)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read
    const unreadMessages = (messagesData as GenericRecord[]).filter(
      msg => msg.receiver_id === userId && !msg.read
    );
    
    if (unreadMessages.length > 0) {
      await (supabase
        .from('messages') as any)
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false);
    }

    return messagesData as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast({
      title: 'Error',
      description: 'Failed to load messages.',
      variant: 'destructive',
    });
    return [];
  }
};

// Send a new message
export const sendNewMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string,
  attachmentUrl?: string
): Promise<Message | null> => {
  try {
    const newMessage = {
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: text.trim(),
      attachment_url: attachmentUrl,
      read: false,
      created_at: new Date().toISOString()
    };

    // Use type assertion to work around TypeScript limitation
    const { data, error } = await (supabase
      .from('messages') as any)
      .insert(newMessage)
      .select()
      .single();

    if (error) throw error;

    // Update last message in conversation
    await (supabase
      .from('conversations') as any)
      .update({
        last_message: text.trim(),
        last_message_time: new Date().toISOString(),
        unread_count: (supabase.rpc('increment_unread', { conv_id: conversationId }) as any)
      })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    toast({
      title: 'Error',
      description: 'Failed to send message.',
      variant: 'destructive',
    });
    return null;
  }
};

// Create a new conversation
export const createNewConversation = async (
  currentUserId: string,
  recipientId: string,
  subject: string,
  productId?: string
): Promise<string | null> => {
  try {
    // Check if conversation already exists
    const { data: existingConvs } = await (supabase
      .from('conversations') as any)
      .select('id')
      .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${recipientId}),and(participant1_id.eq.${recipientId},participant2_id.eq.${currentUserId})`)
      .eq('product_id', productId || null)
      .limit(1);

    if (existingConvs && existingConvs.length > 0) {
      return existingConvs[0].id;
    }

    // Create new conversation
    const { data: newConv, error: convError } = await (supabase
      .from('conversations') as any)
      .insert({
        participant1_id: currentUserId,
        participant2_id: recipientId,
        product_id: productId || null,
        last_message: subject,
        last_message_time: new Date().toISOString(),
        unread_count: 1
      })
      .select()
      .single();

    if (convError) throw convError;

    // Create initial message
    const { error: msgError } = await (supabase
      .from('messages') as any)
      .insert({
        conversation_id: newConv.id,
        sender_id: currentUserId,
        receiver_id: recipientId,
        message: subject,
        read: false
      });

    if (msgError) throw msgError;
    
    return newConv.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast({
      title: 'Error',
      description: 'Failed to create conversation.',
      variant: 'destructive',
    });
    return null;
  }
};

// Fetch recipient profile info
export const fetchRecipientProfile = async (recipientId: string) => {
  try {
    const { data: recipient, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', recipientId)
      .single();
      
    if (error) throw error;
    return recipient;
  } catch (error) {
    console.error('Error fetching recipient profile:', error);
    return null;
  }
};

// Fetch product info
export const fetchProductInfo = async (productId: string) => {
  if (!productId) return null;
  
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('title')
      .eq('id', productId)
      .single();
      
    if (error) throw error;
    return product;
  } catch (error) {
    console.error('Error fetching product info:', error);
    return null;
  }
};
