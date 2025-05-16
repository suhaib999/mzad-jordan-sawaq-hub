
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
type GenericRecord = Record<string, any>;

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Fetch conversations for the current user
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
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
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order('last_message_time', { ascending: false });

        if (error) throw error;

        // Transform the data to match our interface
        const formattedConversations: Conversation[] = (conversationsData as GenericRecord[]).map(conv => {
          const isParticipant1 = conv.participant1_id === user.id;
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

        setConversations(formattedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for conversations
    const conversationChannel = supabase
      .channel('conversation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant1_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Conversation changes:', payload);
          // Refresh conversations on changes
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant2_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Conversation changes:', payload);
          // Refresh conversations on changes
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [user]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!user || !activeConversation) return;

    const fetchMessages = async () => {
      try {
        // Use type assertion to work around TypeScript limitation
        const { data: messagesData, error } = await (supabase
          .from('messages') as any)
          .select('*')
          .eq('conversation_id', activeConversation)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Type assertion to avoid type errors
        setMessages(messagesData as Message[]);

        // Mark messages as read
        const unreadMessages = (messagesData as GenericRecord[]).filter(
          msg => msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          await (supabase
            .from('messages') as any)
            .update({ read: true })
            .eq('conversation_id', activeConversation)
            .eq('receiver_id', user.id)
            .eq('read', false);
          
          // Update unread count in conversations
          setConversations(prev =>
            prev.map(conv =>
              conv.id === activeConversation ? { ...conv, unread_count: 0 } : conv
            )
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages.',
          variant: 'destructive',
        });
      }
    };

    fetchMessages();

    // Set up real-time subscription for messages
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
          
          setMessages(prev => [...prev, newMessage]);
          
          // If the message is for the current user, mark it as read
          if (newMessage.receiver_id === user.id) {
            (supabase
              .from('messages') as any)
              .update({ read: true })
              .eq('id', newMessage.id)
              .then(() => {
                // Update unread count in conversations
                setConversations(prev =>
                  prev.map(conv =>
                    conv.id === activeConversation ? { ...conv, unread_count: 0 } : conv
                  )
                );
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [activeConversation, user]);

  // Send a message
  const sendMessage = async (text: string, attachmentUrl?: string) => {
    if (!user || !activeConversation || !text.trim()) return null;

    try {
      // Get other user ID from active conversation
      const conversation = conversations.find(c => c.id === activeConversation);
      if (!conversation) throw new Error('Conversation not found');

      const newMessage = {
        conversation_id: activeConversation,
        sender_id: user.id,
        receiver_id: conversation.other_user_id,
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
          unread_count: (supabase.rpc('increment_unread', { conv_id: activeConversation }) as any)
        })
        .eq('id', activeConversation);

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

  // Start a new conversation
  const createConversation = async (
    recipientId: string, 
    subject: string, 
    productId?: string
  ) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConvs } = await (supabase
        .from('conversations') as any)
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${recipientId}),and(participant1_id.eq.${recipientId},participant2_id.eq.${user.id})`)
        .eq('product_id', productId || null)
        .limit(1);

      if (existingConvs && existingConvs.length > 0) {
        // Conversation exists, set it active
        setActiveConversation(existingConvs[0].id);
        return existingConvs[0].id;
      }

      // Create new conversation
      const { data: newConv, error: convError } = await (supabase
        .from('conversations') as any)
        .insert({
          participant1_id: user.id,
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
          sender_id: user.id,
          receiver_id: recipientId,
          message: subject,
          read: false
        });

      if (msgError) throw msgError;

      // Refresh conversations and set active
      setActiveConversation(newConv.id);
      
      // Add to local state
      const { data: recipient } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', recipientId)
        .single();
        
      const { data: product } = productId ? await supabase
        .from('products')
        .select('title')
        .eq('id', productId)
        .single() : { data: null };

      const newConversation: Conversation = {
        id: newConv.id,
        product_id: productId || null,
        product_title: product?.title || null,
        last_message: subject,
        last_message_time: newConv.last_message_time,
        other_user_id: recipientId,
        other_user_name: recipient?.full_name || recipient?.username || 'User',
        unread_count: 0,
        avatar_url: recipient?.avatar_url
      };

      setConversations(prev => [newConversation, ...prev]);

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
