import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, MailOpen, MessageSquare, Clock, User, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useContactMessages, ContactMessage } from "@/hooks/useContactMessages";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ContactMessagesSection = () => {
  const { messages, isLoading, markAsRead, addAdminNotes, isMarkingAsRead, isAddingNotes } = useContactMessages();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Aucun message de contact"
        description="Les messages de contact des utilisateurs apparaîtront ici."
      />
    );
  }

  const handleMarkAsRead = (message: ContactMessage) => {
    markAsRead({ id: message.id, isRead: !message.is_read });
  };

  const handleSaveNotes = () => {
    if (selectedMessage && adminNotes.trim()) {
      addAdminNotes({ id: selectedMessage.id, notes: adminNotes });
      setAdminNotes("");
      setSelectedMessage(null);
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Messages de Contact</h2>
          <p className="text-muted-foreground">
            Gérez les messages reçus via le formulaire de contact
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className={`transition-all ${!message.is_read ? 'border-primary/50 shadow-md' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {message.is_read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">
                      {message.subject || "Nouveau message"}
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{message.name}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{message.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(message.created_at), "dd MMM yyyy à HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  {!message.is_read && (
                    <Badge variant="secondary" className="text-xs">
                      Non lu
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
                
                {message.admin_notes && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Notes administrateur :</h4>
                    <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                      {message.admin_notes}
                    </p>
                    {message.responded_at && (
                      <p className="text-xs text-blue-600 mt-2">
                        Répondu le {format(new Date(message.responded_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={message.is_read ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleMarkAsRead(message)}
                    disabled={isMarkingAsRead}
                    className="text-xs"
                  >
                    {message.is_read ? (
                      <>
                        <Mail className="h-3 w-3 mr-1" />
                        Marquer non lu
                      </>
                    ) : (
                      <>
                        <MailOpen className="h-3 w-3 mr-1" />
                        Marquer lu
                      </>
                    )}
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMessage(message);
                          setAdminNotes(message.admin_notes || "");
                        }}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {message.admin_notes ? "Modifier notes" : "Ajouter notes"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Notes administrateur</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Message de <strong>{message.name}</strong> ({message.email})
                          </p>
                          <div className="bg-muted/50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                            {message.message}
                          </div>
                        </div>
                        <div>
                          <Textarea
                            placeholder="Ajoutez vos notes ou votre réponse..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedMessage(null);
                              setAdminNotes("");
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={handleSaveNotes}
                            disabled={isAddingNotes || !adminNotes.trim()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};