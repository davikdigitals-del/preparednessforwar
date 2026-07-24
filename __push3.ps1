$git = "C:\Program Files\Git\cmd\git.exe"
$repo = "C:\Users\EMMAX\Documents\pre\preparednessforwar"

& $git -C $repo add src/pages/AdminLoginPage.tsx database/FIX_ROLE_ASSIGNMENT.sql
$commit = & $git -C $repo commit -m "Admin signup passes is_admin metadata to DB trigger, fix role assignment SQL" 2>&1
$commit | ForEach-Object { Write-Host $_ }
$push = & $git -C $repo push origin main 2>&1
$push | ForEach-Object { Write-Host $_ }
