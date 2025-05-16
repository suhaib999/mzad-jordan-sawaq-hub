
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/message';

export function useRealtimeMessaging(
  userId: string | undefined, 
  activeConversation: string | null,
  onNewMessage: (message: Message) => void,
  onConversationChanged: () => void
) {
  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;
    
    // Set up real-time subscription for conversations
    const conversationChannel = supabase
      .channel('conversation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant1_id=eq.${userId}`,
        },
        () => {
          onConversationChanged();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant2_id=eq.${userId}`,
        },
        () => {
          onConversationChanged();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [userId, onConversationChanged]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!userId || !activeConversation) return;

    const messageChannel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`,
        },
        (payload) => {
          console.log('New message:', payload);
          const newMessage = payload.new as Message;
          
          onNewMessage(newMessage);
          
          // If the message is for the current user, mark it as read
          if (newMessage.receiver_id === userId) {
            (supabase
              .from('messages') as any)
              .update({ read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [activeConversation, userId, onNewMessage]);
}
