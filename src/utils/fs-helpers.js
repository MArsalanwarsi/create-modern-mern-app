import fs from 'node:fs';
import path from 'node:path';

/**
 * Ensures a directory exists synchronously.
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes an object map of relative file paths to string contents.
 * @param {string} targetDir
 * @param {Record<string, string>} files
 */
export async function writeFileTree(targetDir, files) {
  ensureDir(targetDir);
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(targetDir, relativePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content, { encoding: 'utf8', flag: 'wx', mode: relativePath === '.env' ? 0o600 : 0o666 });
  }
}

/**
 * Recursively copies a directory tree from src to dest.
 */
export function copyDirectory(srcDir, destDir) {
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
