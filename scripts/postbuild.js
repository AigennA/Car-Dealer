const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '../src/app/api');
const apiBackupPath = path.join(__dirname, '../api.backup');

// Restore API routes after build
if (fs.existsSync(apiBackupPath) && !fs.existsSync(apiPath)) {
  console.log('Restoring API routes after build...');
  fs.renameSync(apiBackupPath, apiPath);
}

// Fix for GitHub Pages: Copy HTML files into their directories as index.html
// This ensures that URLs like /admin/ work correctly (looking for /admin/index.html)
const outPath = path.join(__dirname, '../out');
if (fs.existsSync(outPath)) {
  console.log('Fixing page routes for GitHub Pages...');
  
  // Get all HTML files at the root level (except index.html, 404.html, and _not-found.html)
  const htmlFiles = fs.readdirSync(outPath)
    .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== '404.html' && file !== '_not-found.html');
  
  htmlFiles.forEach(htmlFile => {
    const pageName = htmlFile.replace('.html', '');
    const pageDir = path.join(outPath, pageName);
    
    // Only process if the directory exists (created by Next.js)
    if (fs.existsSync(pageDir) && fs.statSync(pageDir).isDirectory()) {
      const indexPath = path.join(pageDir, 'index.html');
      
      // Copy the HTML file into the directory as index.html
      if (!fs.existsSync(indexPath)) {
        fs.copyFileSync(path.join(outPath, htmlFile), indexPath);
        console.log(`  ✓ Created ${pageName}/index.html`);
      }
    }
  });
}
