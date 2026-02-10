const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '../src/app/api');
const apiBackupPath = path.join(__dirname, '../api.backup');

// Restore API routes after build
if (fs.existsSync(apiBackupPath) && !fs.existsSync(apiPath)) {
  console.log('Restoring API routes after build...');
  fs.renameSync(apiBackupPath, apiPath);
}
