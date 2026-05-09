@echo off
echo.
echo ================================
echo   SmartOffice AI - Auto Deploy
echo ================================
echo.

cd /d "C:\Users\Rasha\chatbot-demo"

echo Installing packages...
npm install

echo.
echo Deploying to Vercel...
vercel --prod

echo.
echo Done! Your bot is live.
pause
