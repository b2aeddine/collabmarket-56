#!/usr/bin/env node

/**
 * Script to check for hardcoded secrets in the codebase
 * 
 * Usage:
 *   node scripts/check-secrets.js
 * 
 * This script scans for:
 * - Hardcoded API keys
 * - Passwords in plain text
 * - Private keys
 * - Tokens
 * - Other sensitive data
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');

// Patterns to detect (regular expressions)
const SECRET_PATTERNS = [
  {
    name: 'Hardcoded Password',
    pattern: /password\s*[=:]\s*["'][^"']{6,}["']/gi,
    severity: 'HIGH',
  },
  {
    name: 'API Key Pattern',
    pattern: /(api[_-]?key|apikey)\s*[=:]\s*["'][^"']{20,}["']/gi,
    severity: 'HIGH',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/gi,
    severity: 'CRITICAL',
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    severity: 'MEDIUM',
  },
  {
    name: 'Generic Secret',
    pattern: /(secret|token)\s*[=:]\s*["'][^"']{20,}["']/gi,
    severity: 'MEDIUM',
  },
  {
    name: 'Database URL with credentials',
    pattern: /[a-z]+:\/\/[^:]+:[^@]+@[^/]+/gi,
    severity: 'HIGH',
  },
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.*',
  '**/__tests__/**',
  '**/check-secrets.js', // Exclude this script itself
];

// Files to allow (exceptions)
const ALLOWED_FILES = [
  'client.ts', // Supabase client with public anon key
];

let totalIssues = 0;
const issuesByFile = new Map();

function findFiles() {
  return glob.globSync(path.join(SRC_DIR, '**/*'), {
    ignore: EXCLUDE_PATTERNS,
    nodir: true,
    absolute: true,
  }).filter(file => {
    const ext = path.extname(file);
    return ['.ts', '.tsx', '.js', '.jsx', '.env'].includes(ext) || file.includes('.env');
  });
}

function isAllowedFile(filePath) {
  const basename = path.basename(filePath);
  return ALLOWED_FILES.includes(basename);
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  const fileIssues = [];
  
  SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
    const matches = content.match(pattern);
    
    if (matches) {
      matches.forEach(match => {
        // Get line number
        const lines = content.split('\n');
        let lineNumber = 1;
        let charCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount >= content.indexOf(match)) {
            lineNumber = i + 1;
            break;
          }
        }
        
        fileIssues.push({
          type: name,
          severity,
          line: lineNumber,
          preview: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
        });
        
        totalIssues++;
      });
    }
  });
  
  if (fileIssues.length > 0) {
    issuesByFile.set(relativePath, fileIssues);
  }
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'CRITICAL': return '🔴';
    case 'HIGH': return '🟠';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
}

function printResults() {
  console.log('🔐 Security: Checking for hardcoded secrets...\n');
  
  if (totalIssues === 0) {
    console.log('✅ No hardcoded secrets found!\n');
    return;
  }
  
  console.log(`⚠️  Found ${totalIssues} potential secret(s) in ${issuesByFile.size} file(s):\n`);
  
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  
  issuesByFile.forEach((issues, file) => {
    console.log(`📄 ${file}:`);
    
    issues.forEach(issue => {
      console.log(`   ${getSeverityIcon(issue.severity)} [${issue.severity}] Line ${issue.line}: ${issue.type}`);
      console.log(`      Preview: ${issue.preview}`);
      
      switch (issue.severity) {
        case 'CRITICAL': criticalCount++; break;
        case 'HIGH': highCount++; break;
        case 'MEDIUM': mediumCount++; break;
      }
    });
    
    console.log('');
  });
  
  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   🔴 Critical: ${criticalCount}`);
  console.log(`   🟠 High: ${highCount}`);
  console.log(`   🟡 Medium: ${mediumCount}`);
  console.log('='.repeat(60));
  
  console.log('\n💡 Recommendations:');
  console.log('   1. Move secrets to environment variables (.env)');
  console.log('   2. Use import.meta.env.VITE_* for frontend vars');
  console.log('   3. Never commit .env files to git');
  console.log('   4. Rotate any exposed credentials immediately');
  console.log('   5. Use a secret management service for production\n');
}

function main() {
  const files = findFiles();
  
  files.forEach(file => {
    if (!isAllowedFile(file)) {
      scanFile(file);
    }
  });
  
  printResults();
  
  // Exit with error code if critical or high severity issues found
  const hasCritical = Array.from(issuesByFile.values())
    .some(issues => issues.some(i => ['CRITICAL', 'HIGH'].includes(i.severity)));
  
  process.exit(hasCritical ? 1 : 0);
}

try {
  main();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

