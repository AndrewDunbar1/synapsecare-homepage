#!/bin/bash

# Exit on any error
set -e

# Display what's happening
set -x

echo "Starting deployment process..."

# Clean previous builds
rm -rf .next out

# Build the Next.js app with static export
export NEXT_SKIP_404_GENERATION=true
npm run build

# Ensure .nojekyll file exists to bypass Jekyll processing
touch out/.nojekyll

# Create a README file in the out directory to document the deployment
cat > out/README.md << EOF
# SynapseCare Homepage

This is the statically generated site for SynapseCare.

- Repository: https://github.com/AndrewDunbar1/synapsecare-homepage
- Last deployment: $(date)
EOF

# Deploy using gh-pages
echo "Deploying to GitHub Pages..."
npx gh-pages -d out

echo "Deployment complete! Site should be available at: https://andrewdunbar1.github.io/synapsecare-homepage/"
