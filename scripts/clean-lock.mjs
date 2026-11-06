#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');

try {
  // force: true makes this operation safe even if file doesn't exist
  fs.rmSync(lockPath, { force: true });
} catch (error) {
  // Log any unexpected errors (e.g., permission issues)
  console.warn('Failed to remove lock file:', error.message);
}
