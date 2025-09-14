import { supabase } from "@/integrations/supabase/client";

export const generateMissingRevenues = async () => {
  try {
    console.log('Calling generate-missing-revenues function...');
    
    const { data, error } = await supabase.functions.invoke('generate-missing-revenues', {
      body: {}
    });

    if (error) {
      console.error('Error calling function:', error);
      throw error;
    }

    console.log('Function response:', data);
    return data;
  } catch (error) {
    console.error('Error generating missing revenues:', error);
    throw error;
  }
};