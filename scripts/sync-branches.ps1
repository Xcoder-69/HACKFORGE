# Script to push changes to both darshil and main branches on GitHub
Write-Host "Syncing darshil branch to origin/darshil and origin/main..." -ForegroundColor Cyan

# Push darshil to origin/darshil
git push origin darshil

# Push darshil directly to origin/main
git push origin darshil:main

Write-Host "Successfully synced both branches!" -ForegroundColor Green
