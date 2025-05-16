
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/types/message';
import { useRealtimeMessaging } from './use-realtime-messaging';
import { 
  fetchUserConversations, 
  fetchConversationMessages, 
  sendNewMessage, 
  createNewConversation, 
  fetchRecipientProfile, 
  fetchProductInfo 
} from '@/services/messageService';

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Fetch conversations for the current user
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const fetchedConversations = await fetchUserConversations(user.id);
    setConversations(fetchedConversations);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle conversation changes in real-time
  const handleConversationChanged = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle new messages in real-time
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
    
    // Update unread count in conversations
    if (newMessage.receiver_id === user?.id) {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation ? { ...conv, unread_count: 0 } : conv
        )
      );
    }
  }, [activeConversation, user]);
  
  // Set up real-time subscriptions
  useRealtimeMessaging(user?.id, activeConversation, handleNewMessage, handleConversationChanged);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!user || !activeConversation) return;

    const loadMessages = async () => {
      const fetchedMessages = await fetchConversationMessages(activeConversation, user.id);
      setMessages(fetchedMessages);
      
      // Update unread count in conversations
      if (fetchedMessages.some(msg => msg.receiver_id === user.id && !msg.read)) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversation ? { ...conv, unread_count: 0 } : conv
          )
        );
      }
    };

    loadMessages();
  }, [activeConversation, user]);

  // Send a message
  const sendMessage = async (text: string, attachmentUrl?: string) => {
    if (!user || !activeConversation || !text.trim()) return null;

    try {
      // Get other user ID from active conversation
      const conversation = conversations.find(c => c.id === activeConversation);
      if (!conversation) throw new Error('Conversation not found');

      return await sendNewMessage(
        activeConversation,
        user.id,
        conversation.other_user_id,
        text,
        attachmentUrl
      );
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  };

  // Start a new conversation
  const createConversation = async (
    recipientId: string, 
    subject: string, 
    productId?: string
  ) => {
    if (!user) return null;

    const conversationId = await createNewConversation(
      user.id, 
      recipientId, 
      subject, 
      productId
    );

    if (conversationId) {
      setActiveConversation(conversationId);
      
      // If this is a new conversation, add it to the local state
      const existingConversation = conversations.find(c => c.id === conversationId);
      if (!existingConversation) {
        const recipient = await fetchRecipientProfile(recipientId);
        const product = productId ? await fetchProductInfo(productId) : null;
        
        const newConversation: Conversation = {
          id: conversationId,
          product_id: productId || null,
          product_title: product?.title || null,
          last_message: subject,
          last_message_time: new Date().toISOString(),
          other_user_id: recipientId,
          other_user_name: recipient?.full_name || recipient?.username || 'User',
          unread_count: 0,
          avatar_url: recipient?.avatar_url
        };

        setConversations(prev => [newConversation, ...prev]);
      }
    }

    return conversationId;
  };

  return {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    sendMessage,
    createConversation,
  };
}

// Re-export the types for convenience
export type { Message, Conversation } from '@/types/message';
