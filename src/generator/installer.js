import { spawn } from 'node:child_process';

/**
 * Executes npm install in a given directory safely across platforms.
 * @param {string} cwd
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export function runInstall(cwd) {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const npmCli = process.env.npm_execpath;
    const options = { cwd, stdio: 'inherit' };
    let child;
    if (npmCli && /npm-cli\.js$/i.test(npmCli)) {
      child = spawn(process.execPath, [npmCli, 'install'], options);
    } else if (isWindows) {
      child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'npm.cmd install'], options);
    } else {
      child = spawn('npm', ['install'], options);
    }

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
