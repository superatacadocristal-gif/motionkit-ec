const fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const parts=['engine.jsx','keyframes.jsx','content.jsx','lifecycle.jsx','text-sequences.jsx','transitions.jsx','workspace.jsx','startup.jsx'];
const source=parts.map(p=>fs.readFileSync(path.join(root,'src',p),'utf8')).join('\n');
new Function(source);
fs.writeFileSync(path.join(root,'EdyMotion.jsx'),source);
console.log('EdyMotion compilado: '+source.length+' caracteres');
