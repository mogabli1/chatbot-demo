@echo off
echo 🚀 Preparing to deploy Alex v3.0 to Production...
echo ----------------------------------------------------
echo.
:: Forces vercel to deploy directly to your production domain
vercel --prod --force
echo.
echo ----------------------------------------------------
echo ✅ Deployment complete! Press any key to exit.
pause