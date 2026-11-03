export function nextSteps(projectName, installed) {
  const commands = [];
  if (projectName !== '.') {
    const directory = /\s/.test(projectName) ? JSON.stringify(projectName) : projectName;
    commands.push('cd ' + directory);
  }
  if (!installed) commands.push('npm install');
  commands.push('npm run dev');
  return 'Done. Now run:\n\n' + commands.map(command => '  ' + command).join('\n');
}
