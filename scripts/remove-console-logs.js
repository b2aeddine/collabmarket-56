#!/usr/bin/env node

/**
 * Script to remove console.log statements from production code
 * 
 * Usage:
 *   node scripts/remove-console-logs.js
 * 
 * This script:
 * 1. Finds all .ts and .tsx files in src/
 * 2. Removes console.log statements
 * 3. Keeps console.error and console.warn
 * 4. Creates backups before modification
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const BACKUP_DIR = path.join(__dirname, '..', '.backups', new Date().toISOString().replace(/:/g, '-'));
const DRY_RUN = process.argv.includes('--dry-run');

// Patterns to remove
const CONSOLE_LOG_PATTERNS = [
  /console\.log\([^)]*\);?\s*\n?/g,
  /console\.debug\([^)]*\);?\s*\n?/g,
  /console\.info\([^)]*\);?\s*\n?/g,
];

// Files to process
const FILE_PATTERNS = [
  path.join(SRC_DIR, '**/*.ts'),
  path.join(SRC_DIR, '**/*.tsx'),
];

// Directories to exclude
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/__tests__/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/test/**',
];

let totalFiles = 0;
let modifiedFiles = 0;
let removedLogs = 0;

function findFiles() {
  const files = [];
  
  FILE_PATTERNS.forEach(pattern => {
    const matches = glob.globSync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      absolute: true,
    });
    files.push(...matches);
  });
  
  return [...new Set(files)]; // Remove duplicates
}

function createBackup(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
}

function processFile(filePath) {
  totalFiles++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let fileRemovedLogs = 0;
  
  CONSOLE_LOG_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      fileRemovedLogs += matches.length;
      modified = true;
      content = content.replace(pattern, '');
    }
  });
  
  if (modified) {
    modifiedFiles++;
    removedLogs += fileRemovedLogs;
    
    if (!DRY_RUN) {
      createBackup(filePath);
      fs.writeFileSync(filePath, content, 'utf-8');
    }
    
    console.log(`✅ ${path.relative(process.cwd(), filePath)}: Removed ${fileRemovedLogs} console.log(s)`);
  }
}

function main() {
  console.log('🔍 Searching for console.log statements...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  const files = findFiles();
  
  if (files.length === 0) {
    console.log('❌ No files found to process');
    return;
  }
  
  console.log(`Found ${files.length} files to process\n`);
  
  files.forEach(processFile);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   console.log() removed: ${removedLogs}`);
  
  if (!DRY_RUN && modifiedFiles > 0) {
    console.log(`\n💾 Backups created in: ${BACKUP_DIR}`);
  }
  
  if (DRY_RUN && modifiedFiles > 0) {
    console.log('\n💡 Run without --dry-run to actually remove console.log statements');
  }
  
  if (modifiedFiles === 0) {
    console.log('\n✨ No console.log statements found - code is clean!');
  }
  
  console.log('='.repeat(50) + '\n');
}

// Run the script
try {
  main();
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

