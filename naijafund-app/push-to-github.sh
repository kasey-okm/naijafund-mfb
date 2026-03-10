#!/bin/bash
# Run this script from inside the naijafund-app folder
# Usage: bash push-to-github.sh YOUR_GITHUB_USERNAME

GITHUB_USER=${1:-"your-username"}
REPO_NAME="naijafund-mfb"

echo "📦 Setting up GitHub remote..."
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git branch -M main

echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Visit: https://github.com/$GITHUB_USER/$REPO_NAME"
