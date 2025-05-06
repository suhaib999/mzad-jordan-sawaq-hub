
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, Send, User, Clock, AlertCircle, 
  Search, Trash, ArrowLeft, FileUp, ChevronDown 
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Conversation {
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

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
  attachment_url?: string;
}

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

const MessageCenter: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [productId, setProductId] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const newFromParams = queryParams.get('new') === 'true';
  const recipientFromParams = queryParams.get('recipient');
  const productFromParams = queryParams.get('product');

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
  
  // Open new conversation dialog if URL parameters exist
  useEffect(() => {
    if (newFromParams && recipientFromParams) {
      setNewConversationOpen(true);
      setRecipientId(recipientFromParams);
      if (productFromParams) {
        setProductId(productFromParams);
        // Optionally fetch product title
        fetchProductTitle(productFromParams);
      }
    }
  }, [newFromParams, recipientFromParams, productFromParams]);

  const fetchProductTitle = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('title')
        .eq('id', productId)
        .single();
      
      if (data && !error) {
        setSubject(`Question about: ${data.title}`);
      }
    } catch (error) {
      console.error('Error fetching product title:', error);
    }
  };

  // Fetch conversations - this would be replaced with actual Supabase query
  const fetchConversations = async () => {
    // Mock data for now, would be replaced with actual Supabase query
    return [
      {
        id: '1',
        product_id: '123',
        product_title: 'iPhone 14 Pro Max',
        last_message: 'Is this still available?',
        last_message_time: new Date().toISOString(),
        other_user_id: 'user-123',
        other_user_name: 'John Doe',
        unread_count: 2,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      },
      {
        id: '2',
        product_id: '456',
        product_title: 'MacBook Pro M2',
        last_message: 'Can you do $1200?',
        last_message_time: new Date(Date.now() - 3600000).toISOString(),
        other_user_id: 'user-456',
        other_user_name: 'Jane Smith',
        unread_count: 0,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
      }
    ] as Conversation[];
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    // Mock data for now, would be replaced with actual Supabase query
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
        message: "Great! What's the lowest you would go?",
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
      
      // Update unread count in conversations state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation ? { ...conv, unread_count: 0 } : conv
        )
      );
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
      read: false,
      attachment_url: attachment ? URL.createObjectURL(attachment) : undefined
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
    setAttachment(null);
    
    // Mock toast to show action
    toast.success('Message sent');
  };

  // Create a new conversation
  const handleCreateConversation = async () => {
    if (!subject.trim() || !recipientId || !currentUserId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // In a real app, this would create a new conversation in Supabase
    // For now, we'll just mock it
    
    const newConversationId = `new-${Date.now()}`;
    const newConv: Conversation = {
      id: newConversationId,
      product_id: productId || null,
      product_title: productId ? subject : null,
      last_message: subject,
      last_message_time: new Date().toISOString(),
      other_user_id: recipientId,
      other_user_name: "New Contact",
      unread_count: 0
    };
    
    // Add to local state
    setConversations(prev => [newConv, ...prev]);
    
    // Select the new conversation
    setSelectedConversation(newConversationId);
    
    // Close the dialog
    setNewConversationOpen(false);
    
    // Clear form
    setSubject('');
    setRecipientId('');
    setProductId('');
    
    // Add initial message
    const newMsg: Message = {
      id: `new-msg-${Date.now()}`,
      conversation_id: newConversationId,
      sender_id: currentUserId,
      receiver_id: recipientId,
      message: subject,
      created_at: new Date().toISOString(),
      read: false
    };
    
    setMessages([newMsg]);
    
    // Mock toast
    toast.success('New conversation started');
    
    // Clear URL parameters
    navigate('/messages');
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

  // Filter conversations by search term
  const filteredConversations = conversations.filter(
    conv => conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (conv.product_title && conv.product_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className={`${selectedConversation && isMobile ? 'hidden' : 'flex flex-col'} w-full md:w-1/3 border-r`}>
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-mzad-primary">
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
            </Badge>
            <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Conversation</DialogTitle>
                  <DialogDescription>
                    Send a message to another user about a specific item or inquiry.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient ID</label>
                    <Input 
                      value={recipientId} 
                      onChange={e => setRecipientId(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product ID (optional)</label>
                    <Input 
                      value={productId} 
                      onChange={e => setProductId(e.target.value)}
                      placeholder="Enter product ID (if relevant)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input 
                      value={subject} 
                      onChange={e => setSubject(e.target.value)}
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <Button onClick={handleCreateConversation} className="w-full">
                    Start Conversation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
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
            ) : filteredConversations.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-12.5rem)]">
                {filteredConversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                      conversation.id === selectedConversation ? 'bg-blue-50' : ''
                    } ${conversation.unread_count > 0 ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={conversation.avatar_url} />
                        <AvatarFallback>
                          {conversation.other_user_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium truncate">{conversation.other_user_name}</span>
                          <span className="text-xs text-gray-500 flex items-center whitespace-nowrap ml-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatRelativeTime(conversation.last_message_time)}
                          </span>
                        </div>
                        
                        {conversation.product_title && (
                          <div className="text-xs text-mzad-primary mb-1 truncate">
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
                    </div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p>No messages found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm ? "No conversations match your search" : "Your conversations will appear here"}
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
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={conversation.avatar_url} />
                          <AvatarFallback>
                            {conversation.other_user_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium truncate">{conversation.other_user_name}</span>
                            <span className="text-xs text-gray-500 flex items-center whitespace-nowrap ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRelativeTime(conversation.last_message_time)}
                            </span>
                          </div>
                          
                          {conversation.product_title && (
                            <div className="text-xs text-mzad-primary mb-1 truncate">
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
                      </div>
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
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            <div className="flex-1 flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage 
                  src={conversations.find(c => c.id === selectedConversation)?.avatar_url} 
                  alt={conversations.find(c => c.id === selectedConversation)?.other_user_name || 'User'} 
                />
                <AvatarFallback>
                  {(conversations.find(c => c.id === selectedConversation)?.other_user_name || 'U').substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
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
            
            <Select>
              <SelectTrigger className="w-[130px]">
                <div className="flex items-center text-sm">
                  <span>Actions</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">
                  <div className="flex items-center text-red-500">
                    <Trash className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </div>
                </SelectItem>
                <SelectItem value="block">Block User</SelectItem>
                <SelectItem value="report">Report</SelectItem>
              </SelectContent>
            </Select>
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
                    
                    {message.attachment_url && (
                      <div className="mt-2 p-2 bg-white/20 rounded-md">
                        <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs">
                          <FileUp className="h-3 w-3 mr-1" />
                          View attachment
                        </a>
                      </div>
                    )}
                    
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
            <form onSubmit={handleSendMessage} className="space-y-2">
              <Textarea 
                placeholder="Type your message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px]"
              />
              
              <div className="flex items-center justify-between">
                <label className="cursor-pointer flex items-center text-mzad-primary hover:text-mzad-primary/80">
                  <FileUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">Attach file</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => e.target.files && setAttachment(e.target.files[0])}
                  />
                </label>
                
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
              
              {attachment && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded border text-sm">
                  <div className="truncate flex-1">{attachment.name}</div>
                  <button 
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setAttachment(null)}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center text-center p-6 bg-gray-50">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
          <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the left to view and send messages, or start a new conversation.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;
