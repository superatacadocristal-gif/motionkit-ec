var emFixChecks=0;function emFixCheck(ok,label){if(!ok)throw Error('Engine: '+label);emFixChecks++;}
var fixComp=app.project.items.addComp('EdyMotion engine QA',640,360,1,8,30);fixComp.openInViewer();
var fixLayer=fixComp.layers.addSolid([1,1,1],'Rollback',100,100,1);fixLayer.selected=true;fixLayer.transform.rotation.setValueAtTime(6,20);
var beforePos=emComparable(emSnapshotProperty(fixLayer.transform.position)),beforeOp=emComparable(emSnapshotProperty(fixLayer.transform.opacity)),beforeRot=emComparable(emSnapshotProperty(fixLayer.transform.rotation));
var originalWrite=writeFrames;writeFrames=function(job,force,comp){originalWrite(job,force,comp);throw Error('falha injetada após escrita');};
objState.radios=[{value:true},{value:false},{value:false}];applyObjects(objState,mkPresets[1],1,1);writeFrames=originalWrite;
emFixCheck(beforePos===emComparable(emSnapshotProperty(fixLayer.transform.position))&&beforeOp===emComparable(emSnapshotProperty(fixLayer.transform.opacity))&&beforeRot===emComparable(emSnapshotProperty(fixLayer.transform.rotation)),'Rollback preserva original');emFixCheck(emRecords(fixLayer).length===0,'Sem registro de falha');fixLayer.remove();
var bounce=null;for(var bi=0;bi<mkPresets.length;bi++)if(mkPresets[bi].name==='Quicar')bounce=mkPresets[bi];
var fixText=fixComp.layers.addText('Overshoot');fixText.selected=true;textState.radios=[{value:true},{value:false},{value:false}];applyText(textState,bounce,1,1);
var anim=textGroup(fixText).property(1),pos=anim.property('ADBE Text Animator Properties').property('ADBE Text Position 3D');
emFixCheck(pos.numKeys===bounce.enter.length,'Todos os frames de bounce no texto');emFixCheck(pos.keyValue(2)[1]<0&&pos.keyValue(3)[1]>0,'Overshoot alterna sinal');
applyText(textState,bounce,1,1);emFixCheck(textGroup(fixText).numProperties===1,'Não duplica animação de texto');
var prior=fixText.comment;app.run('edit.undo',{}); // Last successful application is undoable.
emFixCheck(textGroup(fixText).numProperties===0,'Undo aplicação de texto');
writeLn('Engine checks: '+emFixChecks);
