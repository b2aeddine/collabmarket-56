// Test script to generate missing revenues
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vklayzyhocjpicnblwfx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbGF5enlob2NqcGljbmJsd2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODA4MDMsImV4cCI6MjA2NzM1NjgwM30.pUSBHigrCNULCQAPdYCKixt7OYNICKHCgbBaelFqJE8'
);

async function test() {
  try {
    console.log('Calling generate-missing-revenues...');
    const { data, error } = await supabase.functions.invoke('generate-missing-revenues');
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();