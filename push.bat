@echo off
cd /d "c:\Users\EMMAX\Documents\pre\preparednessforwar"
echo Adding files...
git add -A
echo Committing...
git commit -m "restore: Index page + fix header full width"
echo Pushing...
git push origin main
echo.
echo PUSH COMPLETE
pause
