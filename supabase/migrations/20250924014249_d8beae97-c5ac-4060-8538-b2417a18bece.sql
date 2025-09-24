-- Fix search path for remaining functions
ALTER FUNCTION public.update_contact_messages_updated_at() SET search_path = public;
ALTER FUNCTION public.update_contestations_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_conversation_timestamp() SET search_path = public;