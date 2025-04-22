#!/bin/bash

# Exit on any error
set -e

echo "💫 Starting deployment process for SynapseCare.ai..."

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

# Make sure CNAME file is present
echo "🌐 Setting up custom domain..."
echo "synapsecare.ai" > out/CNAME

# Create a custom 404 page
echo "🔍 Creating custom 404 page..."
cp out/index.html out/404.html

# Add a root index.html file to the out directory
echo "🔄 Adding root-level index.html..."
cp public/fallback-index.html out/index.html

# Create a README file in the out directory to document the deployment
cat > out/README.md << EOF
# SynapseCare

This is the statically generated site for SynapseCare.

- Repository: https://github.com/AndrewDunbar1/synapsecare-homepage
- Website: https://synapsecare.ai
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
echo "   https://synapsecare.ai"
echo ""
echo "If the site isn't working properly, check:"
echo "1. Repository settings -> Pages to confirm the source is set to gh-pages branch"
echo "2. Visit https://synapsecare.ai/build-info.txt to verify deployment"
echo "3. DNS settings for synapsecare.ai to ensure they point to GitHub Pages"
