import { spawn } from 'node:child_process';

/**
 * Executes npm install in a given directory safely across platforms.
 * @param {string} cwd
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export function runInstall(cwd) {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';

    const child = spawn(npmCmd, ['install'], {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: `Installation exited with code ${code}`
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });
  });
}
