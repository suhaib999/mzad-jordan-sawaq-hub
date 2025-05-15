
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMessages, Conversation, Message } from '@/hooks/use-messages';
import { useAuth } from '@/contexts/AuthContext';
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
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const RealTimeMessageCenter: React.FC = () => {
  const {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    sendMessage,
    createConversation
  } = useMessages();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [productId, setProductId] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [users, setUsers] = useState<Array<{id: string, username: string, full_name: string}>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const newFromParams = queryParams.get('new') === 'true';
  const recipientFromParams = queryParams.get('recipient');
  const productFromParams = queryParams.get('product');

  // Scroll to bottom of messages on changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Open new conversation dialog if URL parameters exist
  useEffect(() => {
    if (newFromParams && recipientFromParams) {
      setNewConversationOpen(true);
      setRecipientId(recipientFromParams);
      if (productFromParams) {
        setProductId(productFromParams);
        // Fetch product title
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

  // Fetch users for recipient selection
  const fetchUsers = async () => {
    if (isLoadingUsers) return;
    
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .neq('id', user?.id || '')
        .limit(10);
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;
    
    let attachmentUrl: string | undefined = undefined;
    
    // Upload attachment if present
    if (attachment) {
      const filename = `${Date.now()}-${attachment.name}`;
      const { data, error } = await supabase.storage
        .from('message_attachments')
        .upload(`${user.id}/${filename}`, attachment);
        
      if (error) {
        toast({
          title: 'Upload failed',
          description: 'Could not upload attachment',
          variant: 'destructive'
        });
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('message_attachments')
          .getPublicUrl(data.path);
          
        attachmentUrl = publicUrl;
      }
    }
    
    const result = await sendMessage(newMessage, attachmentUrl);
    
    if (result) {
      setNewMessage('');
      setAttachment(null);
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully'
      });
    }
  };

  // Create a new conversation
  const handleCreateConversation = async () => {
    if (!subject.trim() || !recipientId || !user) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    const conversationId = await createConversation(recipientId, subject, productId || undefined);
    
    if (conversationId) {
      // Close the dialog
      setNewConversationOpen(false);
      
      // Clear form
      setSubject('');
      setRecipientId('');
      setProductId('');
      
      toast({
        title: 'Conversation started',
        description: 'Your new conversation has been created'
      });
      
      // Clear URL parameters
      navigate('/messages');
    }
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
  
  // Calculate total unread message count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Sign in to view messages</h2>
        <p className="text-gray-500 mb-4">You need to be logged in to access your messages</p>
        <Button onClick={() => navigate('/auth/login')}>
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className={`${activeConversation && isMobile ? 'hidden' : 'flex flex-col'} w-full md:w-1/3 border-r`}>
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-mzad-primary">
              {totalUnreadCount}
            </Badge>
            <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchUsers()}
                >
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
                    <label className="text-sm font-medium">Recipient</label>
                    <Select onValueChange={setRecipientId} value={recipientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <SelectItem value="loading" disabled>Loading users...</SelectItem>
                        ) : users.length > 0 ? (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.username}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>No users found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
              {totalUnreadCount > 0 && (
                <Badge className="ml-2 bg-mzad-secondary text-white">
                  {totalUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            {loading ? (
              <div className="space-y-3 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-12.5rem)]">
                {filteredConversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                      conversation.id === activeConversation ? 'bg-blue-50' : ''
                    } ${conversation.unread_count > 0 ? 'bg-blue-50' : ''}`}
                    onClick={() => setActiveConversation(conversation.id)}
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
                      onClick={() => setActiveConversation(conversation.id)}
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
      
      {activeConversation ? (
        <div className={`${!activeConversation && isMobile ? 'hidden' : 'flex flex-col'} flex-1 h-full`}>
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveConversation(null)}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            <div className="flex-1 flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage 
                  src={conversations.find(c => c.id === activeConversation)?.avatar_url} 
                  alt={conversations.find(c => c.id === activeConversation)?.other_user_name || 'User'} 
                />
                <AvatarFallback>
                  {(conversations.find(c => c.id === activeConversation)?.other_user_name || 'U').substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {conversations.find(c => c.id === activeConversation)?.other_user_name || 'User'}
                </div>
                {conversations.find(c => c.id === activeConversation)?.product_title && (
                  <div className="text-xs text-mzad-primary">
                    Re: {conversations.find(c => c.id === activeConversation)?.product_title}
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
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <Skeleton className={`h-20 w-2/3 ${i % 2 === 0 ? 'rounded-br-none' : 'rounded-bl-none'}`} />
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_id === user?.id 
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
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
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
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              </div>
            )}
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

export default RealTimeMessageCenter;
