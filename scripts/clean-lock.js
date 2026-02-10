#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');

try {
  fs.rmSync(lockPath, { force: true });
} catch (error) {
  // Only warn about non-ENOENT errors (file not found is expected)
  if (error.code !== 'ENOENT') {
    console.warn('Failed to remove lock file:', error.message);
  }
}
