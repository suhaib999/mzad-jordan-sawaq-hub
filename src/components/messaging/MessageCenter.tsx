import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, User, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface Conversation {
  id: string;
  product_id: string | null;
  product_title: string | null;
  last_message: string;
  last_message_time: string;
  other_user_id: string;
  other_user_name: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

const MessageCenter: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      } else {
        navigate('/login');
        toast.error('You must be logged in to use Messages');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Mock fetch conversations - would be replaced with Supabase query
  const fetchConversations = async () => {
    // This would be replaced with a real Supabase query
    // For now, we'll use mock data
    return [
      {
        id: '1',
        product_id: '123',
        product_title: 'iPhone 14 Pro Max',
        last_message: 'Is this still available?',
        last_message_time: new Date().toISOString(),
        other_user_id: 'user-123',
        other_user_name: 'John Doe',
        unread_count: 2
      },
      {
        id: '2',
        product_id: '456',
        product_title: 'MacBook Pro M2',
        last_message: 'Can you do $1200?',
        last_message_time: new Date(Date.now() - 3600000).toISOString(),
        other_user_id: 'user-456',
        other_user_name: 'Jane Smith',
        unread_count: 0
      }
    ] as Conversation[];
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    // This would be replaced with a real Supabase query
    // For now, we'll use mock data
    return [
      {
        id: 'msg-1',
        conversation_id: conversationId,
        sender_id: 'user-123',
        receiver_id: currentUserId || '',
        message: 'Hi, is this iPhone still available?',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        read: true
      },
      {
        id: 'msg-2',
        conversation_id: conversationId,
        sender_id: currentUserId || '',
        receiver_id: 'user-123',
        message: 'Yes, it is available!',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: 'msg-3',
        conversation_id: conversationId,
        sender_id: 'user-123',
        receiver_id: currentUserId || '',
        message: 'Great! What\'s the lowest you would go?',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        read: false
      }
    ] as Message[];
  };

  // Get conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: fetchConversations,
    enabled: !!currentUserId,
  });

  // Update conversations when data is fetched
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData]);

  // Get messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    
    const getMessages = async () => {
      const messagesData = await fetchMessages(selectedConversation);
      setMessages(messagesData);
      
      // Mark messages as read in a real app
      // This would update the database
    };
    
    getMessages();
  }, [selectedConversation]);

  // Send a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;
    
    // In a real app, this would send to Supabase
    const otherUserId = conversations.find(c => c.id === selectedConversation)?.other_user_id;
    
    if (!otherUserId) return;
    
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      conversation_id: selectedConversation,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      read: false
    };
    
    // Add to local state for immediate feedback
    setMessages(prev => [...prev, newMsg]);
    
    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? {
              ...conv,
              last_message: newMessage.trim(),
              last_message_time: new Date().toISOString()
            }
          : conv
      )
    );
    
    setNewMessage('');
    
    // Mock toast to show action
    toast.success('Message sent');
  };

  // Format relative time for display
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className={`${selectedConversation && isMobile ? 'hidden' : 'flex flex-col'} w-full md:w-1/3 border-r`}>
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </h2>
          <Badge className="bg-mzad-primary">
            {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
          </Badge>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="unread">
              Unread 
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0) > 0 && (
                <Badge className="ml-2 bg-mzad-secondary text-white">
                  {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            {isLoadingConversations ? (
              <div className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2">Loading conversations...</p>
              </div>
            ) : conversations.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-12.5rem)]">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                      conversation.id === selectedConversation ? 'bg-blue-50' : ''
                    } ${conversation.unread_count > 0 ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{conversation.other_user_name}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatRelativeTime(conversation.last_message_time)}
                      </span>
                    </div>
                    
                    {conversation.product_title && (
                      <div className="text-xs text-mzad-primary mb-1">
                        Re: {conversation.product_title}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 truncate">
                      {conversation.last_message}
                    </div>
                    
                    {conversation.unread_count > 0 && (
                      <Badge className="mt-1 bg-mzad-secondary text-white">
                        {conversation.unread_count} new
                      </Badge>
                    )}
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p>No messages</p>
                <p className="text-sm text-gray-500">
                  Your conversations will appear here
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[calc(100vh-12.5rem)]">
              {conversations.filter(c => c.unread_count > 0).length > 0 ? (
                conversations
                  .filter(c => c.unread_count > 0)
                  .map(conversation => (
                    <div 
                      key={conversation.id}
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer bg-blue-50"
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{conversation.other_user_name}</span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(conversation.last_message_time)}
                        </span>
                      </div>
                      
                      {conversation.product_title && (
                        <div className="text-xs text-mzad-primary mb-1">
                          Re: {conversation.product_title}
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600 truncate">
                        {conversation.last_message}
                      </div>
                      
                      <Badge className="mt-1 bg-mzad-secondary text-white">
                        {conversation.unread_count} new
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center">
                  <p>No unread messages</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedConversation ? (
        <div className={`${!selectedConversation && isMobile ? 'hidden' : 'flex flex-col'} flex-1 h-full`}>
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedConversation(null)}
                className="mr-2"
              >
                Back
              </Button>
            )}
            
            <div className="flex-1">
              <div className="font-semibold">
                {conversations.find(c => c.id === selectedConversation)?.other_user_name || 'User'}
              </div>
              {conversations.find(c => c.id === selectedConversation)?.product_title && (
                <div className="text-xs text-mzad-primary">
                  Re: {conversations.find(c => c.id === selectedConversation)?.product_title}
                </div>
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div
                  className={`flex ${
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender_id === currentUserId 
                        ? 'bg-mzad-primary text-white rounded-br-none' 
                        : 'bg-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm">{message.message}</div>
                    <div 
                      className={`text-xs mt-1 ${
                        message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          
          <div className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex">
              <Input 
                placeholder="Type your message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                className="mr-2"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center text-center p-6 bg-gray-50">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
          <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the left to view and send messages.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;
