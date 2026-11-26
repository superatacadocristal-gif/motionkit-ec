const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,work=path.resolve(root,'../../work/edymotion-tests');fs.mkdirSync(work,{recursive:true});
fs.writeFileSync(path.join(work,'pixel.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=','base64'));
const wave=Buffer.alloc(8044,128);wave.write('RIFF',0);wave.writeUInt32LE(8036,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(8000,24);wave.writeUInt32LE(8000,28);wave.writeUInt16LE(1,32);wave.writeUInt16LE(8,34);wave.write('data',36);wave.writeUInt32LE(8000,40);fs.writeFileSync(path.join(work,'tone.wav'),wave);
let legacy=fs.readFileSync(path.join(root,'../tests/edytools-cases.jsx'),'utf8').replaceAll('EdyTools','EdyMotion').replaceAll('globalThis.EdyMotionTick()','globalThis.__EdyMotionInstances[instanceId]()');
legacy=legacy.replace("mkPresets[p].kind==='highlight'?animator.property('ADBE Text Animator Properties').property(1):animator.property('ADBE Text Selectors').property(1).property('ADBE Text Percent Start')","animator.property('ADBE Text Animator Properties').property(1)");
let cases='var fixtureDir='+JSON.stringify(work.replace(/\\/g,'/'))+';var emFixtureDir=fixtureDir;\n'+legacy;
for(const f of ['keyframes.jsx','content.jsx','engine-fixes.jsx','lifecycle.jsx','text-sequences.jsx','transitions.jsx']){const p=path.join(root,'tests',f);if(fs.existsSync(p)&&(!process.env.EM_TESTS||process.env.EM_TESTS.split(',').includes(f)))cases+='\n'+fs.readFileSync(p,'utf8').replace('emContentComp.time=1;','emContentComp.openInViewer();emContentComp.time=1;');}
cases+='\nwriteLn("Keyframe checks: "+emRunKeyframeTests());';
const source=fs.readFileSync(path.join(root,'EdyMotion.jsx'),'utf8').replace('})(this);',cases+'\n})(this);');
fs.writeFileSync(path.join(work,'regression.jsx'),source);
const run=cp.spawnSync('C:/Program Files/EffectCraft/effectcraft-cli.exe',['script',path.join(work,'regression.jsx'),'--empty'],{encoding:'utf8',env:{...process.env,EFFECTCRAFT_CONFIG_DIR:path.join(work,'config')}});
process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');if(run.error)throw run.error;process.exit(run.status??1);
