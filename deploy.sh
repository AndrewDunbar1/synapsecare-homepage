#!/bin/bash
# Turn off TypeScript checking by temporarily modifying the file
sed -i.bak 's/ignoreBuildErrors: true/ignoreBuildErrors: true, transpileOnly: true/' next.config.mjs
# Run the build
npx next build
# Move the .nojekyll file
touch out/.nojekyll
# Deploy to GitHub Pages
npx gh-pages -d out -t true
# Restore the original config
mv next.config.mjs.bak next.config.mjs 