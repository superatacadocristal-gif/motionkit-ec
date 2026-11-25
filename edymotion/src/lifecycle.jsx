/* EdyMotion application records. Stored with the project, independent of panel sessions. */
var emRecordPattern=/\n?\[EdyMotion:v1\]([\s\S]*?)\[\/EdyMotion\]/;
function emRecords(layer){var m=String(layer.comment||'').match(emRecordPattern);if(!m)return [];var data=JSON.parse(m[1]);if(!(data instanceof Array)||data.length>40)throw Error('Registro EdyMotion inválido.');return data;}
function emSaveRecords(layer,records){var original=String(layer.comment||'').replace(emRecordPattern,'');var data=JSON.stringify(records);if(data.length>262144)throw Error('Limite de histórico desta camada atingido.');layer.comment=original+(records.length?'\n[EdyMotion:v1]'+data+'[/EdyMotion]':'');}
function emComparable(snapshot){var copy=JSON.parse(JSON.stringify(snapshot));for(var i=0;i<copy.keys.length;i++)delete copy.keys[i].selected;return JSON.stringify(copy);}
function emRecordObject(layer,p,st,jobs,before){
  var entries=[],seen={};
  for(var i=0;i<before.length;i++){
    var prop=before[i].prop,channel=null;
    for(var j=0;j<jobs.length;j++)for(var ch in jobs[j].props)if(jobs[j].props[ch].matchName===prop.matchName)channel=ch;
    if(!channel||seen[channel])continue;seen[channel]=true;
    entries.push({channel:channel,before:before[i].snapshot,after:emSnapshotProperty(prop)});
  }
  var records=emRecords(layer),segments=[];for(var k=0;k<jobs.length;k++)segments.push({begin:jobs[k].begin,dur:jobs[k].dur,dir:jobs[k].dir|| (chosenMode(st)===1?'out':k===1?'out':p.kind==='highlight'?'hl':'in')});
  records.push({name:p.name,kind:'object',entries:entries,segments:segments});emSaveRecords(layer,records);
}
function emRecordText(layer,p,st,animators,segments,dur,force){
  var entries=[],parts=[];
  for(var i=0;i<animators.length;i++){var g=animators[i].property('ADBE Text Animator Properties');for(var j=1;j<=g.numProperties;j++){var prop=g.property(j);entries.push({animator:animators[i].name,match:prop.matchName,after:emSnapshotProperty(prop)});}}
  for(var k=0;k<segments.length;k++)parts.push({begin:segments[k].begin,dur:dur,dir:segments[k].dir});
  var records=emRecords(layer);records.push({name:p.name,kind:'text',entries:entries,segments:parts});emSaveRecords(layer,records);
}
function emRecordProp(layer,record,entry){if(record.kind==='object')return layer.transform[entry.channel];var g=textGroup(layer),a=g&&g.property(entry.animator);return a&&a.property('ADBE Text Animator Properties').property(entry.match);}
function emValidateRecord(layer,record){
  if(layer.locked)throw Error('Desbloqueie '+layer.name+'.');
  for(var i=0;i<record.entries.length;i++){var e=record.entries[i],p=emRecordProp(layer,record,e);if(!p||p.expressionEnabled||emComparable(emSnapshotProperty(p))!==emComparable(e.after))throw Error('Animação alterada fora do EdyMotion em '+layer.name+'. Use as ferramentas de chaves.');}
}
function emRestoreText(layer,record){
  var g=textGroup(layer),seen={};for(var i=0;i<record.entries.length;i++){var e=record.entries[i];if(!seen[e.animator]){var old=g.property(e.animator);if(old)old.remove();var a=g.addProperty('ADBE Text Animator');a.name=e.animator;seen[e.animator]=a;}var prop=seen[e.animator].property('ADBE Text Animator Properties').addProperty(e.match);emRestoreProperty(prop,e.after);}
}
function emEditApplication(action,value){
  var co=context();if(!co)return false;var plans=[];
  try{
    var selected=co.selectedLayers;
    for(var n=0;n<selected.length;n++){
      var layer=selected[n],records=emRecords(layer);if(!records.length)throw Error('Nenhuma animação registrada em '+layer.name+'.');
      var record=records[records.length-1];emValidateRecord(layer,record);
      var revised=JSON.parse(JSON.stringify(record));
      if(action==='duration'){
        var d=num(value,co.frameDuration,Math.min(86400,co.duration));if(d===null)throw Error('Duração inválida.');
        for(var s=0;s<revised.segments.length;s++){var seg=revised.segments[s];seg.dur=d;if(seg.dir==='out')seg.begin=Math.min(co.duration,layer.outPoint)-d;if(seg.begin<Math.max(0,layer.inPoint)||seg.begin+d>Math.min(co.duration,layer.outPoint)+.000001)throw Error('Duração fora da camada.');}
        if(revised.segments.length>1&&revised.segments[0].begin+d>=revised.segments[1].begin)throw Error('Entrada e saída se sobrepõem.');
      }else if(action==='cursor'){
        var delta=co.time-record.segments[0].begin;
        for(var z=0;z<revised.segments.length;z++){revised.segments[z].begin+=delta;if(revised.segments[z].begin<Math.max(0,layer.inPoint)||revised.segments[z].begin+revised.segments[z].dur>Math.min(co.duration,layer.outPoint)+.000001)throw Error('Agulha não deixa espaço para a animação.');}
      }else if(action!=='remove')throw Error('Ação inválida.');
      if(action!=='remove')for(var e=0;e<revised.entries.length;e++){
        var entry=revised.entries[e],keys=entry.after.keys;
        for(var k=0;k<keys.length;k++){
          var existing=false;if(entry.before)for(var b=0;b<entry.before.keys.length;b++)if(Math.abs(entry.before.keys[b].time-keys[k].time)<.000001)existing=true;
          if(existing)continue;
          for(var j=0;j<record.segments.length;j++){var old=record.segments[j],next=revised.segments[j];if(keys[k].time>=old.begin-.000001&&keys[k].time<=old.begin+old.dur+.000001){var ratio=next.dur/old.dur;keys[k].time=next.begin+(keys[k].time-old.begin)*ratio;for(var x=0;x<keys[k].inEase.length;x++){keys[k].inEase[x].speed/=ratio;keys[k].outEase[x].speed/=ratio;}break;}}
        }
        keys.sort(function(a,b){return a.time-b.time;});for(var q=1;q<keys.length;q++)if(keys[q].time-keys[q-1].time<.000001)throw Error('Colisão com outra chave; ajuste a duração.');
      }
      plans.push({layer:layer,records:records,record:record,revised:revised,comment:layer.comment});
    }
  }catch(error){say('Não alterado: '+error.message);return false;}
  app.beginUndoGroup('EdyMotion - editar animação');var applied=[];
  try{
    for(var a=0;a<plans.length;a++){
      var plan=plans[a];applied.push(plan);
      if(action==='remove'){
        if(plan.record.kind==='object')for(var r=0;r<plan.record.entries.length;r++)emRestoreProperty(emRecordProp(plan.layer,plan.record,plan.record.entries[r]),plan.record.entries[r].before);
        else{var removed={};for(var t=0;t<plan.record.entries.length;t++){var name=plan.record.entries[t].animator;if(!removed[name]){textGroup(plan.layer).property(name).remove();removed[name]=true;}}}
        plan.records.pop();
      }else{
        for(var u=0;u<plan.revised.entries.length;u++){var en=plan.revised.entries[u],pr=emRecordProp(plan.layer,plan.record,en);emRestoreProperty(pr,en.after);en.after=emSnapshotProperty(pr);}
        plan.records[plan.records.length-1]=plan.revised;
      }
      emSaveRecords(plan.layer,plan.records);
    }
    say((action==='remove'?'Animação removida de ':'Animação atualizada em ')+plans.length+' camada(s).');return true;
  }catch(error){
    var rollback='';for(var z=applied.length-1;z>=0;z--)try{var oldPlan=applied[z];if(action==='remove'&&oldPlan.record.kind==='text')emRestoreText(oldPlan.layer,oldPlan.record);else for(var y=0;y<oldPlan.record.entries.length;y++){var original=oldPlan.record.entries[y];emRestoreProperty(emRecordProp(oldPlan.layer,oldPlan.record,original),original.after);}oldPlan.layer.comment=oldPlan.comment;}catch(fail){rollback=' Use Ctrl+Z para restaurar.';}
    say('Falha: '+error.message+rollback);return false;
  }finally{app.endUndoGroup();}
}
