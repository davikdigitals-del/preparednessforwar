@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
set REPO=C:\Users\EMMAX\Documents\pre\preparednessforwar
%GIT% -C "%REPO%" add src/pages/SignInPage.tsx
%GIT% -C "%REPO%" commit -m "Show actual Supabase error on password reset for debugging"
%GIT% -C "%REPO%" push origin main
