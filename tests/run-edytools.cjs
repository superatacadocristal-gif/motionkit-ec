const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const work = path.resolve(root, '../work/edytools-tests');
fs.mkdirSync(work, { recursive: true });
const source = fs.readFileSync(path.join(root, 'EdyTools.jsx'), 'utf8');
const cases = fs.readFileSync(path.join(__dirname, 'edytools-cases.jsx'), 'utf8');
const script = path.join(work, 'regression.jsx');
fs.writeFileSync(script, source.replace('})(this);', cases + '\n})(this);'));
const cli = process.argv[2] || 'C:/Program Files/EffectCraft/effectcraft-cli.exe';
const result = spawnSync(cli, ['script', script, '--empty'], {
  encoding: 'utf8',
  env: { ...process.env, EFFECTCRAFT_CONFIG_DIR: path.join(work, 'config') }
});
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
if (result.error) process.stderr.write(result.error.message);
process.exit(result.status === null ? 1 : result.status);
