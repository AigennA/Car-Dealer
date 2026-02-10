#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');

try {
  // force: true makes this operation safe even if file doesn't exist
  fs.rmSync(lockPath, { force: true });
} catch (error) {
  // Log any unexpected errors (e.g., permission issues)
  console.warn('Failed to remove lock file:', error.message);
}
