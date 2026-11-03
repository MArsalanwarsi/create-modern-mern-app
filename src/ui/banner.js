import pc from 'picocolors';
import pkg from '../../package.json' with { type: 'json' };

export function renderBanner(columns = process.stdout.columns ?? 80, options = {}) {
  const color = pc.createColors(Boolean(options.isTTY ?? process.stdout.isTTY) && !options.plain && !process.env.NO_COLOR);
  const name = color.bold('Modern MERN');
  const version = color.dim('v' + (options.version ?? pkg.version));
  if (!(columns >= 40)) return name + '\n' + version;
  return name + '  ' + version + '\n' + color.dim('Full-stack application setup');
}
