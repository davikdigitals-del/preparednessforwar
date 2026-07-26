@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
set REPO=C:\Users\EMMAX\Documents\pre\preparednessforwar
%GIT% -C "%REPO%" add src/pages/AdminLoginPage.tsx
%GIT% -C "%REPO%" commit -m "Fix admin register: remove profile upsert that caused 500, detect duplicate emails, simplify flow"
%GIT% -C "%REPO%" push origin main
