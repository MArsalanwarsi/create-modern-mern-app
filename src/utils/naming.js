import fs from 'node:fs';
import path from 'node:path';

/**
 * Sanitizes a project name for use in package.json.
 * Validates npm package name rules: lowercase, url-friendly, no special characters except hyphen, dot, or scope.
 */
export function sanitizePackageName(rawName) {
  if (!rawName) return 'my-app';
  
  const trimmed = rawName.trim();
  
  // Handle scoped packages like @scope/name
  if (trimmed.startsWith('@')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const scope = parts[0].slice(1).toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const name = parts[1].toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      return `@${scope}/${name}`;
    }
  }

  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validates target directory for scaffolding.
 */
export function validateTargetDir(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return { valid: true, exists: false, isEmpty: true };
  }

  const files = fs.readdirSync(targetPath);
  // Ignore .git or system files if present
  const validFiles = files.filter(f => f !== '.git' && f !== '.DS_Store' && f !== 'Thumbs.db');
  
  if (validFiles.length > 0) {
    return {
      valid: false,
      exists: true,
      isEmpty: false,
      error: `Directory "${path.basename(targetPath)}" already exists and is not empty.`
    };
  }

  return { valid: true, exists: true, isEmpty: true };
}
