#!/bin/bash

# Exit on any error
set -e

echo "💫 Starting deployment process for GitHub Pages..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out node_modules/.cache

# Make sure we have the latest dependencies
echo "📦 Checking dependencies..."
npm install --legacy-peer-deps

# Build the Next.js app with static export
echo "🔨 Building Next.js app..."
export NEXT_SKIP_404_GENERATION=true
npm run build

# Ensure .nojekyll file exists to bypass Jekyll processing
echo "📄 Creating necessary files for GitHub Pages..."
touch out/.nojekyll

# Create a custom 404 page
echo "🔍 Creating custom 404 page..."
cp out/index.html out/404.html

# Add a root index.html file to the out directory
echo "🔄 Adding root-level index.html for GitHub Pages..."
cp public/fallback-index.html out/index.html

# Create a README file in the out directory to document the deployment
cat > out/README.md << EOF
# SynapseCare Homepage

This is the statically generated site for SynapseCare.

- Repository: https://github.com/AndrewDunbar1/synapsecare-homepage
- Last deployment: $(date)
EOF

# Add a debug file to check the files that were deployed
echo "📋 Creating build info file..."
cat > out/build-info.txt << EOF
Build timestamp: $(date)
Next.js Version: $(npm list next | grep next@ | cut -d' ' -f1)
Node.js Version: $(node -v)
Files in build directory:
$(find out -type f | sort)
EOF

# Deploy using gh-pages with special options
echo "🚀 Deploying to GitHub Pages..."
npx gh-pages -d out --dotfiles --add

echo "✅ Deployment complete! Your site should be available at:"
echo "   https://andrewdunbar1.github.io/synapsecare-homepage/"
echo ""
echo "If the site isn't working properly, check:"
echo "1. Repository settings -> Pages to confirm the source is set to gh-pages branch"
echo "2. Visit https://andrewdunbar1.github.io/synapsecare-homepage/build-info.txt to verify deployment"
