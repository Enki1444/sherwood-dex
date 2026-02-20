#!/bin/bash

# Sherwood DEX Deployment Script
# Run this after setting up GitHub and Vercel

echo "🏹 Sherwood DEX Deployment"
echo "=========================="

# Check GitHub authentication
echo ""
echo "1. GitHub Authentication"
echo "   Run: gh auth login"
echo "   Or visit: https://github.com/login/device"
echo "   Code: 9539-155D"

# After GitHub auth, create repo and push
echo ""
echo "2. Create GitHub Repository and Push"
echo "   cd /home/workspace/sherwood"
echo "   gh repo create sherwood-dex --public --source=. --push"

# Deploy to Vercel
echo ""
echo "3. Deploy to Vercel"
echo "   cd /home/workspace/sherwood/frontend"
echo "   vercel --prod"

# Update contract addresses after deployment
echo ""
echo "4. After Contract Deployment"
echo "   Update frontend/src/config/contracts.json with deployed addresses"
echo "   Rebuild and redeploy frontend"

echo ""
echo "✅ Project built and ready at: /home/workspace/sherwood/frontend/dist"
