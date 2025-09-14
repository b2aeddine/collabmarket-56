
-- Créer la table conversations pour organiser les échanges
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(merchant_id, influencer_id)
);

-- Mettre à jour la table messages pour référencer les conversations
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversations_merchant ON public.conversations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_influencer ON public.conversations(influencer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Activer RLS sur conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (merchant_id = auth.uid() OR influencer_id = auth.uid());

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (merchant_id = auth.uid() OR influencer_id = auth.uid());

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (merchant_id = auth.uid() OR influencer_id = auth.uid());

-- Fonction pour mettre à jour last_message_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement last_message_at
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Activer les notifications en temps réel
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Ajouter les tables aux publications realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
