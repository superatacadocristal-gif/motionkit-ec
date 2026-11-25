/* EdyMotion numeric keyframe tools — by Edy Bastos — 11/2026. MIT. */
var emEaseClipboard=null;
function emNumericValue(value){
  if(typeof value==='number'&&isFinite(value))return value;
  if(value instanceof Array&&value.length>0&&value.length<=4){var a=[];for(var i=0;i<value.length;i++){if(typeof value[i]!=='number'||!isFinite(value[i]))throw Error('Valor de chave não numérico.');a.push(value[i]);}return a;}
  throw Error('Esta ferramenta aceita somente propriedades numéricas.');
}
function emCopyEase(eases,sign){var out=[];for(var i=0;i<eases.length;i++)out.push({speed:eases[i].speed*(sign===undefined?1:sign),influence:eases[i].influence});return out;}
function emEaseObjects(eases){var out=[];for(var i=0;i<eases.length;i++)out.push(new KeyframeEase(eases[i].speed,eases[i].influence));return out;}
function emSnapshotProperty(p){
  if(!p||typeof p.setValueAtTime!=='function')throw Error('Propriedade não animável.');
  if(p.numKeys>2500)throw Error('Limite de 2500 chaves por propriedade.');
  var snapshot={keys:[],spatial:!!p.isSpatial,value:null};
  if(!p.numKeys)snapshot.value=emNumericValue(p.valueAtTime(0,true));
  for(var i=1;i<=p.numKeys;i++){
    var key={time:p.keyTime(i),value:emNumericValue(p.keyValue(i)),inType:p.keyInInterpolationType(i),outType:p.keyOutInterpolationType(i),inEase:emCopyEase(p.keyInTemporalEase(i)),outEase:emCopyEase(p.keyOutTemporalEase(i)),continuous:p.keyTemporalContinuous(i),autoBezier:p.keyTemporalAutoBezier(i),roving:p.keyRoving(i),selected:p.keySelected(i)};
    if(snapshot.spatial){key.inTangent=p.keyInSpatialTangent(i);key.outTangent=p.keyOutSpatialTangent(i);key.spatialContinuous=p.keySpatialContinuous(i);key.spatialAutoBezier=p.keySpatialAutoBezier(i);}
    snapshot.keys.push(key);
  }
  return snapshot;
}
function emWriteKeyMetadata(p,index,key,spatial){
  p.setInterpolationTypeAtKey(index,key.inType,key.outType);
  p.setTemporalEaseAtKey(index,emEaseObjects(key.inEase),emEaseObjects(key.outEase));
  p.setTemporalContinuousAtKey(index,!!key.continuous);p.setTemporalAutoBezierAtKey(index,!!key.autoBezier);
  if(spatial){
    p.setSpatialTangentsAtKey(index,key.inTangent,key.outTangent);
    if(key.spatialAutoBezier)p.setSpatialAutoBezierAtKey(index,true);
    else p.setSpatialContinuousAtKey(index,!!key.spatialContinuous);
  }
  // Setting ease can promote LINEAR/HOLD to BEZIER; restore interpolation last.
  p.setInterpolationTypeAtKey(index,key.inType,key.outType);
}
function emRestoreProperty(p,snapshot){
  for(var i=p.numKeys;i>=1;i--)p.removeKey(i);
  if(!snapshot.keys.length){p.setValue(snapshot.value);return;}
  for(var k=0;k<snapshot.keys.length;k++)p.setValueAtTime(snapshot.keys[k].time,snapshot.keys[k].value);
  for(var j=0;j<snapshot.keys.length;j++)emWriteKeyMetadata(p,j+1,snapshot.keys[j],snapshot.spatial);
  // Roving can retime interior keys, so restore it after all values and metadata.
  for(var r=0;r<snapshot.keys.length;r++)if(snapshot.keys[r].roving)p.setRovingAtKey(r+1,true);
  for(var s=0;s<snapshot.keys.length;s++)if(snapshot.keys[s].selected)p.setSelectedAtKey(s+1,true);
}
function emCloneKey(key){var result={};for(var field in key){var value=key[field];if(value instanceof Array){result[field]=[];for(var i=0;i<value.length;i++){var v=value[i];result[field].push(v&&typeof v==='object'?{speed:v.speed,influence:v.influence}:v);}}else result[field]=value;}return result;}
function emKeyAction(action,amount){
  var allowed=['reverse','shift','alignStart','alignEnd','clone','copyEase','pasteEase'];
  if(allowed.indexOf(action)<0){say('Ação de chaves desconhecida.');return false;}
  var comp=app.project.activeItem;if(!(comp instanceof CompItem)){say('Abra uma composição.');return false;}
  var props=getKeyProps();if(!props||!props.length)return false;
  if(props.length>100){say('Selecione no máximo 100 propriedades.');return false;}
  if(action==='shift'){amount=Number(String(amount).replace(',','.'));if(!isFinite(amount)){say('Informe um deslocamento válido em segundos.');return false;}}
  var plans=[],globalStart=Infinity,globalEnd=-Infinity,epsilon=0.000001;
  try{
    for(var i=0;i<props.length;i++){
      var p=props[i];if(p.expression||p.expressionEnabled)throw Error('Remova a expressão antes de editar estas chaves.');
      if(p.dimensionsSeparated)throw Error('Selecione os eixos separados individualmente.');
      var owner=p.propertyGroup(p.propertyDepth);if(owner&&owner.locked)throw Error('Desbloqueie a camada antes de editar chaves.');
      var before=emSnapshotProperty(p),selected=[];
      for(var j=0;j<before.keys.length;j++){
        if(before.keys[j].roving)throw Error('Chaves móveis (roving) não são compatíveis com esta operação.');
        if(before.keys[j].selected){selected.push(before.keys[j]);globalStart=Math.min(globalStart,before.keys[j].time);globalEnd=Math.max(globalEnd,before.keys[j].time);}
      }
      if(selected.length)plans.push({prop:p,before:before,selected:selected});
    }
    if(!plans.length)throw Error('Selecione quadros-chave.');
    if(action==='copyEase'){
      var first=plans[0].selected[0];emEaseClipboard={spatial:plans[0].before.spatial,inType:first.inType,outType:first.outType,inEase:emCopyEase(first.inEase),outEase:emCopyEase(first.outEase),continuous:first.continuous,autoBezier:first.autoBezier};
      say('Curva copiada da primeira chave selecionada.');return true;
    }
    if(action==='pasteEase'&&!emEaseClipboard)throw Error('Copie uma curva primeiro.');
    var changed=0;
    for(var n=0;n<plans.length;n++){
      var plan=plans[n],original=plan.before.keys,next=[],delta=action==='alignStart'||action==='clone'?comp.time-globalStart:action==='alignEnd'?comp.time-globalEnd:amount;
      for(var u=0;u<original.length;u++){
        var old=original[u];
        if(!old.selected||action==='clone'){var keep=emCloneKey(old);if(action==='clone')keep.selected=false;next.push(keep);}
        if(!old.selected)continue;
        var key=emCloneKey(old);
        if(action==='pasteEase'){
          if(plan.before.spatial!==emEaseClipboard.spatial||key.inEase.length!==emEaseClipboard.inEase.length||key.outEase.length!==emEaseClipboard.outEase.length)throw Error('A curva copiada exige o mesmo tipo de propriedade.');
          key.inType=emEaseClipboard.inType;key.outType=emEaseClipboard.outType;key.inEase=emCopyEase(emEaseClipboard.inEase);key.outEase=emCopyEase(emEaseClipboard.outEase);key.continuous=emEaseClipboard.continuous;key.autoBezier=emEaseClipboard.autoBezier;
        }else if(action==='reverse'){
          key.time=globalStart+globalEnd-old.time;key.inType=old.outType;key.outType=old.inType;
          var sign=plan.before.spatial?1:-1;key.inEase=emCopyEase(old.outEase,sign);key.outEase=emCopyEase(old.inEase,sign);
          if(plan.before.spatial){key.inTangent=old.outTangent.slice(0);key.outTangent=old.inTangent.slice(0);}
        }else key.time=old.time+delta;
        if(!isFinite(key.time)||key.time<-epsilon||key.time>comp.duration+epsilon)throw Error('As chaves ficariam fora da composição.');
        key.time=Math.max(0,Math.min(comp.duration,key.time));next.push(key);changed++;
      }
      next.sort(function(a,b){return a.time-b.time;});
      for(var c=1;c<next.length;c++)if(Math.abs(next[c].time-next[c-1].time)<epsilon)throw Error('Há outra chave no tempo de destino.');
      plan.after={keys:next,spatial:plan.before.spatial,value:plan.before.value};
    }
  }catch(error){say('Não aplicado: '+error.message);return false;}
  app.beginUndoGroup('EdyMotion - chaves '+action);
  var written=[];
  try{
    for(var q=0;q<plans.length;q++){written.push(plans[q]);emRestoreProperty(plans[q].prop,plans[q].after);}
  }catch(writeError){
    var rollbackFailed=false;for(var b=written.length-1;b>=0;b--)try{emRestoreProperty(written[b].prop,written[b].before);}catch(restoreError){rollbackFailed=true;}
    say('Falha: '+writeError.message+(rollbackFailed?' · use Ctrl+Z para restaurar.':' · alterações revertidas.'));return false;
  }finally{app.endUndoGroup();}
  say(changed+' chaves atualizadas. Ctrl+Z desfaz.');return true;
}
