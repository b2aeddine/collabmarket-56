import { supabase } from "@/integrations/supabase/client";

export const testGenerateRevenues = async () => {
  try {
    console.log('Testing generate-missing-revenues function...');
    
    const response = await fetch('https://vklayzyhocjpicnblwfx.supabase.co/functions/v1/generate-missing-revenues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbGF5enlob2NqcGljbmJsd2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODA4MDMsImV4cCI6MjA2NzM1NjgwM30.pUSBHigrCNULCQAPdYCKixt7OYNICKHCgbBaelFqJE8`,
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Function response:', data);
    return data;
  } catch (error) {
    console.error('Error calling function:', error);
    throw error;
  }
};

// Fonction pour appeler la génération des revenus
export const callGenerateRevenues = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-missing-revenues', {
      body: {}
    });

    if (error) {
      console.error('Error calling generate-missing-revenues:', error);
      throw error;
    }

    console.log('Revenues generated successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to generate revenues:', error);
    throw error;
  }
};

// Appel automatique immédiat pour générer les revenus manquants
(async () => {
  try {
    console.log('Auto-generating missing revenues...');
    const result = await callGenerateRevenues();
    console.log('✅ Revenues generated successfully:', result);
    
    // Recharger la page après génération pour voir les nouveaux revenus
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (err) {
    console.error('❌ Failed to generate revenues:', err);
  }
})();