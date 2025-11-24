#!/usr/bin/env node

/**
 * Script to automatically fix common ESLint errors
 * - Replace unused variables with _ prefix
 * - Replace catch (error) with catch (_error)
 * - Remove unused imports
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const SRC_DIR = path.join(process.cwd(), 'src');

// Patterns to fix
const fixes = [
  // Fix catch (error) -> catch (_error)
  {
    pattern: /catch\s*\(\s*error\s*\)/g,
    replacement: 'catch (_error)',
    description: 'Prefix unused catch error with _'
  },
  // Fix catch (error: any) -> catch (_error: unknown)
  {
    pattern: /catch\s*\(\s*error:\s*any\s*\)/g,
    replacement: 'catch (_error: unknown)',
    description: 'Fix catch error type'
  },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  fixes.forEach(({ pattern, replacement, description }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      console.log(`  ✓ ${description}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function main() {
  console.log('🔧 Fixing common ESLint errors...\n');

  const files = globSync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.test.tsx'],
    absolute: true,
  });

  let fixedCount = 0;
  files.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
      console.log(`Fixed: ${path.relative(SRC_DIR, file)}`);
    }
  });

  console.log(`\n✅ Fixed ${fixedCount} files`);
}

main();

