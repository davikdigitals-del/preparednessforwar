@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
set REPO=C:\Users\EMMAX\Documents\pre\preparednessforwar
%GIT% -C "%REPO%" add src/integrations/supabase/client.ts database/FIX_RLS_POLICIES.sql
%GIT% -C "%REPO%" commit -m "Fix 401 errors: explicit localStorage storage, RLS policies for profiles/notifications/media_items"
%GIT% -C "%REPO%" push origin main
