const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '../src/app/api');
const apiBackupPath = path.join(__dirname, '../api.backup');

// Always move API routes before build (they don't work with static export anyway)
if (fs.existsSync(apiPath)) {
  console.log('Moving API routes for static export...');
  fs.renameSync(apiPath, apiBackupPath);
}
