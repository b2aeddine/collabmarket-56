
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import { Send, ArrowLeft, Search, MessageCircle } from "lucide-react";
import { useConversations, useMessages, useSendMessage } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MessagesPage = () => {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, isLoading: messagesLoading } = useMessages(selectedConversation || "");
  const sendMessage = useSendMessage();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredConversations = conversations?.filter(conv => {
    const otherUser = conv.merchant?.id === currentUser?.id ? conv.influencer : conv.merchant;
    const fullName = `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  }) || [];

  const selectedConversationData = conversations?.find(conv => conv.id === selectedConversation);
  const otherUser = selectedConversationData?.merchant?.id === currentUser?.id 
    ? selectedConversationData?.influencer 
    : selectedConversationData?.merchant;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !otherUser) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation,
        content: newMessage,
        receiverId: otherUser.id,
      });
      setNewMessage("");
    } catch (_error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ConversationsList = () => (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Messages
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">Chargement...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "Aucune conversation trouvée" : "Aucune conversation"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const user = conversation.merchant?.id === currentUser?.id 
                  ? conversation.influencer 
                  : conversation.merchant;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {user?.first_name} {user?.last_name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.last_message_at || conversation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          Démarrer une conversation...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </div>
  );

  const ChatArea = () => (
    <div className="h-full flex flex-col">
      {selectedConversation && otherUser ? (
        <>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{otherUser?.first_name} {otherUser?.last_name}</h3>
                <p className="text-sm text-gray-500">En ligne</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              {messagesLoading ? (
                <div className="text-center text-gray-500">Chargement des messages...</div>
              ) : messages?.length === 0 ? (
                <div className="text-center text-gray-500">
                  Aucun message. Commencez la conversation !
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === currentUser?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg animate-in slide-in-from-bottom-2 ${
                          message.sender_id === currentUser?.id
                            ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === currentUser?.id ? "text-pink-100" : "text-gray-500"
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t bg-white">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={sendMessage.isPending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
            <p>Choisissez une conversation pour commencer à discuter</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="h-[calc(100vh-80px)] px-0 sm:px-4 py-0 sm:py-4">
        <div className="h-full max-w-7xl mx-auto">
          {isMobile ? (
            <Card className="h-full border-0 shadow-lg rounded-none sm:rounded-lg">
              {selectedConversation ? <ChatArea /> : <ConversationsList />}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 h-full">
              <Card className="border-0 shadow-lg rounded-none md:rounded-lg">
                <ConversationsList />
              </Card>
              
              <div className="md:col-span-2">
                <Card className="h-full border-0 shadow-lg rounded-none md:rounded-lg">
                  <ChatArea />
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
