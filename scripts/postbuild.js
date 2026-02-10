const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '../src/app/api');
const apiBackupPath = path.join(__dirname, '../api.backup');

// Restore API routes after build
if (fs.existsSync(apiBackupPath) && !fs.existsSync(apiPath)) {
  console.log('Restoring API routes after build...');
  fs.renameSync(apiBackupPath, apiPath);
}

// Fix GitHub Pages routing by reorganizing HTML files
const outDir = path.join(__dirname, '../out');

function reorganizeHtmlFiles(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    // Skip index.html, 404.html, and files starting with underscore or dot
    if (file === 'index.html' || file === '404.html' || file.startsWith('_') || file.startsWith('.')) {
      return;
    }
    
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    // Only process HTML files
    if (stat.isFile() && file.endsWith('.html')) {
      const routeName = file.replace('.html', '');
      const routeDir = path.join(directory, routeName);
      const targetPath = path.join(routeDir, 'index.html');
      
      // Create directory for the route if it doesn't exist
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      
      // Move the HTML file to routeName/index.html if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.renameSync(filePath, targetPath);
        const relativePath = path.relative(outDir, targetPath);
        console.log(`  Moved ${path.relative(outDir, filePath)} to ${relativePath}`);
      }
    } else if (stat.isDirectory() && !file.startsWith('_') && !file.startsWith('.')) {
      // Recursively process subdirectories
      reorganizeHtmlFiles(filePath);
    }
  });
}

if (fs.existsSync(outDir)) {
  console.log('Reorganizing HTML files for GitHub Pages routing...');
  reorganizeHtmlFiles(outDir);
  console.log('GitHub Pages routing reorganization complete!');
}
