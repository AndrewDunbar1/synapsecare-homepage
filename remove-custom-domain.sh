#!/bin/bash

# Script to remove custom domain from gh-pages branch

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Checkout gh-pages branch
echo "Checking out gh-pages branch..."
git checkout gh-pages

# Remove CNAME file if it exists
if [ -f CNAME ]; then
  echo "Removing CNAME file..."
  rm CNAME
  git add -A
  git commit -m "Remove CNAME file to fix GitHub Pages URL"
  git push origin gh-pages
  echo "CNAME file removed and changes pushed."
else
  echo "No CNAME file found in gh-pages branch."
fi

# Return to original branch
echo "Returning to $CURRENT_BRANCH branch..."
git checkout $CURRENT_BRANCH
echo "Done!" 