@echo off
echo ==========================================
echo REPARATION DE LA SYNCHRONISATION SUPABASE
echo ==========================================

:: 1. Marquer les migrations distantes comme "reverted" pour permettre le pull
echo [1/2] Marquage des migrations distantes comme reverted...
call supabase migration repair --status reverted 20250924015651
call supabase migration repair --status reverted 20251002104231
call supabase migration repair --status reverted 20251007123614
call supabase migration repair --status reverted 20251114003912
call supabase migration repair --status reverted 20251120012059
call supabase migration repair --status reverted 20251120012614
call supabase migration repair --status reverted 20251120030558
call supabase migration repair --status reverted 20251123192901
call supabase migration repair --status reverted 20251123195635
call supabase migration repair --status reverted 20251123195656
call supabase migration repair --status reverted 20251123200818
call supabase migration repair --status reverted 20251124012839
call supabase migration repair --status reverted 20251124013321
call supabase migration repair --status reverted 20251124014829
call supabase migration repair --status reverted 20251124020942

:: 2. Pull du schema distant
echo [2/2] Pull du schema depuis la Remote DB...
call supabase db pull

echo ==========================================
echo TERMINE ! Verifie le fichier genere dans supabase/migrations/
echo ==========================================
pause
