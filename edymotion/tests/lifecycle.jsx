var emLifeChecks=0;
function emLifeCheck(ok,msg){if(!ok)throw Error('Lifecycle: '+msg);emLifeChecks++;}
var lifeComp=app.project.items.addComp('EdyMotion lifecycle',640,360,1,8,30),lifeLayer=lifeComp.layers.addSolid([1,1,1],'Lifecycle',100,100,1);lifeComp.openInViewer();lifeLayer.inPoint=1;lifeLayer.outPoint=7;lifeLayer.selected=true;lifeLayer.comment='Comentário pessoal';
var lifePreset=mkPresets[1];objState.radios=[{value:true},{value:false},{value:false}];
applyObjects(objState,lifePreset,1,1);
emLifeCheck(emRecords(lifeLayer).length===1,'Persistir aplicação '+message);
emLifeCheck(emRecords(lifeLayer)[0].entries.length>0,'Canais registrados');
emLifeCheck(emEditApplication('duration','2'),'Retiming '+message);
var lrec=emRecords(lifeLayer)[0];emLifeCheck(lrec.segments[0].dur===2,'Duração atualizada');
lifeComp.time=3;emLifeCheck(emEditApplication('cursor'),'Mover agulha '+message);emLifeCheck(emRecords(lifeLayer)[0].segments[0].begin===3,'Tempo atualizado');
emLifeCheck(emEditApplication('remove'),'Remover '+message);emLifeCheck(lifeLayer.transform.position.numKeys===0&&lifeLayer.comment==='Comentário pessoal','Restaurar original');
applyObjects(objState,lifePreset,1,1);lifeLayer.transform.opacity.setValueAtTime(2,42);var unchanged=JSON.stringify(emSnapshotProperty(lifeLayer.transform.opacity));
emLifeCheck(!emEditApplication('remove'),'Proteger edição externa');emLifeCheck(JSON.stringify(emSnapshotProperty(lifeLayer.transform.opacity))===unchanged,'Edição intacta');lifeLayer.remove();
var txt=lifeComp.layers.addText('EdyMotion');txt.selected=true;txt.inPoint=1;txt.outPoint=7;
applyText(textState,lifePreset,1,1);emLifeCheck(emRecords(txt).length===1,'Registro texto '+message);
emLifeCheck(emEditApplication('duration',2),'Retiming texto '+message);emLifeCheck(emEditApplication('remove'),'Remover texto '+message);emLifeCheck(textGroup(txt).numProperties===0,'Animadores removidos');
for(var ep=0;ep<5;ep++){emNavigate(ep);ui.size=[292,572];layout();draw();emLifeCheck(hits.length>0,'Página '+ep);}
emNavigate(4,5);draw();emLifeCheck(emShift.visible,'Campo de keyframes');emNavigate(0);draw();emLifeCheck(!emShift.visible&&search.visible,'Visibilidade nativa');
writeLn('Lifecycle checks: '+emLifeChecks);
