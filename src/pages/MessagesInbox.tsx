
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { MessageCircle, Send, Paperclip, Search, MoreVertical } from "lucide-react";

const MessagesInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [conversations] = useState([
    {
      id: "1",
      participant: {
        id: "merchant-1",
        name: "Beauty Store",
        avatar: "/placeholder.svg",
        username: "@beautystore"
      },
      lastMessage: "Parfait ! J'attends votre création avec impatience 🎉",
      timestamp: new Date("2024-01-15T14:30:00"),
      unreadCount: 0,
      isOnline: true
    },
    {
      id: "2", 
      participant: {
        id: "merchant-2",
        name: "Fashion Brand",
        avatar: "/placeholder.svg",
        username: "@fashionbrand"
      },
      lastMessage: "Bonjour, j'aimerais discuter d'une collaboration",
      timestamp: new Date("2024-01-15T10:15:00"),
      unreadCount: 2,
      isOnline: false
    },
    {
      id: "3",
      participant: {
        id: "merchant-3", 
        name: "Tech Startup",
        avatar: "/placeholder.svg",
        username: "@techstartup"
      },
      lastMessage: "Merci pour votre travail excellent !",
      timestamp: new Date("2024-01-14T16:45:00"),
      unreadCount: 0,
      isOnline: true
    }
  ]);

  const [messages, setMessages] = useState([
    {
      id: "1",
      conversationId: "1",
      senderId: "merchant-1",
      content: "Bonjour ! J'ai vu votre profil et j'aimerais collaborer avec vous.",
      timestamp: new Date("2024-01-15T14:00:00"),
      isRead: true
    },
    {
      id: "2",
      conversationId: "1", 
      senderId: "influencer",
      content: "Bonjour ! Merci pour votre intérêt. De quel type de collaboration s'agit-il ?",
      timestamp: new Date("2024-01-15T14:05:00"),
      isRead: true
    },
    {
      id: "3",
      conversationId: "1",
      senderId: "merchant-1", 
      content: "Nous lanceons une nouvelle gamme de produits de beauté et nous cherchons des influenceurs pour en faire la promotion via des posts Instagram.",
      timestamp: new Date("2024-01-15T14:10:00"),
      isRead: true
    },
    {
      id: "4",
      conversationId: "1",
      senderId: "influencer",
      content: "C'est exactement dans mon domaine ! Je peux vous proposer un post + story pour 150€. Qu'en pensez-vous ?",
      timestamp: new Date("2024-01-15T14:15:00"),
      isRead: true
    },
    {
      id: "5",
      conversationId: "1",
      senderId: "merchant-1",
      content: "Parfait ! J'attends votre création avec impatience 🎉",
      timestamp: new Date("2024-01-15T14:30:00"),
      isRead: true
    }
  ]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = messages.filter(m => m.conversationId === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderId: "influencer",
      content: newMessage,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gradient">
            Boîte de réception
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Gérez vos conversations avec les commerçants
          </p>
        </div>

        <Card className="border-0 shadow-xl h-[700px]">
          <div className="flex h-full">
            {/* Sidebar - Conversations List */}
            <div className="w-full md:w-1/3 border-r bg-gray-50 flex flex-col">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </CardTitle>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher une conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b hover:bg-gray-100 cursor-pointer transition-colors ${
                      selectedConversation === conversation.id ? "bg-white border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.participant.avatar} />
                          <AvatarFallback>
                            {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">
                            {conversation.participant.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-primary text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.participant.username}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex md:flex-col md:flex-1">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConv.participant.avatar} />
                          <AvatarFallback>
                            {selectedConv.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConv.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConv.participant.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedConv.isOnline ? "En ligne" : "Hors ligne"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-4">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === "influencer" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === "influencer"
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                                : "bg-white text-gray-800 border shadow-sm"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === "influencer" ? "text-pink-100" : "text-gray-500"
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessagesInbox;
