const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const work = path.resolve(root, '../work/edytools-tests');
fs.mkdirSync(work, { recursive: true });
const source = fs.readFileSync(path.join(root, 'EdyTools.jsx'), 'utf8');
const cases = fs.readFileSync(path.join(__dirname, 'edytools-cases.jsx'), 'utf8');
const script = path.join(work, 'regression.jsx');
fs.writeFileSync(path.join(work, 'pixel.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', 'base64'));
const wave = Buffer.alloc(8044, 128);
wave.write('RIFF',0);wave.writeUInt32LE(8036,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);
wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(8000,24);wave.writeUInt32LE(8000,28);
wave.writeUInt16LE(1,32);wave.writeUInt16LE(8,34);wave.write('data',36);wave.writeUInt32LE(8000,40);
fs.writeFileSync(path.join(work, 'tone.wav'), wave);

fs.writeFileSync(script, source.replace('})(this);', 'var fixtureDir='+JSON.stringify(work.replace(/\\/g,'/'))+';\n'+cases + '\n})(this);'));
const cli = process.argv[2] || 'C:/Program Files/EffectCraft/effectcraft-cli.exe';
const result = spawnSync(cli, ['script', script, '--empty'], {
  encoding: 'utf8',
  env: { ...process.env, EFFECTCRAFT_CONFIG_DIR: path.join(work, 'config') }
});
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
if (result.error) process.stderr.write(result.error.message);
process.exit(result.status === null ? 1 : result.status);
