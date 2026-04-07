@echo off

git add .
git commit -m "update" 2>nul
git push

echo.
echo Done.
pause
