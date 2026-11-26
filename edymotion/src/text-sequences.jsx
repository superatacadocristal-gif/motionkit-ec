/* EdyMotion sequential text. Original selectors for EffectCraft. MIT. */
var emSequencePrefix='EMSEQ:v1:';
function emSequenceGroup(layer){try{var text=layer.property('ADBE Text Properties');return text&&text.property('ADBE Text Animators');}catch(error){return null;}}
function emSequenceSource(layer){var text=layer.property('ADBE Text Properties');return text&&text.property('ADBE Text Document');}
function emSequenceName(mode,unit,preset){return emSequencePrefix+mode+':'+unit+':'+preset;}
function emTextSequence(opts){
  opts=opts||{};var co=app.project.activeItem;
  if(!(co instanceof CompItem)){say('Abra uma composição.');return false;}
  var unit=opts.unit||'characters',preset=opts.preset||'fade',mode=opts.mode||'in',duration=Number(opts.duration===undefined?1:opts.duration);
  if(['characters','words'].indexOf(unit)<0||['fade','rise','typewriter'].indexOf(preset)<0||['in','out','both'].indexOf(mode)<0){say('Opção de texto inválida.');return false;}
  if(!isFinite(duration)||duration<co.frameDuration||duration>86400){say('Duração inválida.');return false;}
  var selected=co.selectedLayers,queue=[],created=[];
  if(!selected.length||selected.length>200){say('Selecione de 1 a 200 camadas de texto.');return false;}
  try{
    for(var i=0;i<selected.length;i++){
      var layer=selected[i],group=emSequenceGroup(layer),source=group&&emSequenceSource(layer);
      if(layer.locked||!source)throw Error('Selecione somente textos desbloqueados.');
      if(source.expression||source.expressionEnabled||source.numKeys)throw Error('Texto com expressão ou conteúdo animado: '+layer.name);
      if(!String(source.value.text).replace(/\s/g,''))throw Error('Texto vazio: '+layer.name);
      var start=Math.max(0,layer.inPoint),end=Math.min(co.duration,layer.outPoint),segments=[];
      if(mode!=='out')segments.push({mode:'in',begin:start});
      if(mode!=='in')segments.push({mode:'out',begin:end-duration});
      if(end-start<duration-0.000001||mode==='both'&&duration*2>=end-start)throw Error('Duração fora dos limites: '+layer.name);
      for(var s=0;s<segments.length;s++)for(var a=1;a<=group.numProperties;a++)if(group.property(a).name.indexOf(emSequencePrefix+segments[s].mode+':')===0)throw Error('Já existe sequência de '+(segments[s].mode==='in'?'entrada':'saída')+'. Remova a sequência anterior.');
      queue.push({layer:layer,group:group,segments:segments});
    }
  }catch(error){say('Não aplicado: '+error.message);return false;}
  app.beginUndoGroup('EdyMotion - texto em sequência');
  try{
    for(var q=0;q<queue.length;q++)for(var n=0;n<queue[q].segments.length;n++){
      var entry=queue[q],seg=entry.segments[n],anim=entry.group.addProperty('ADBE Text Animator');created.push(anim);anim.name=emSequenceName(seg.mode,unit,preset);
      var props=anim.property('ADBE Text Animator Properties');props.addProperty('ADBE Text Opacity').setValue(0);
      if(preset==='rise')props.addProperty('ADBE Text Position 3D').setValue([0,Math.min(co.width,co.height)*.08,0]);
      var selectors=anim.property('ADBE Text Selectors'),selector=selectors.property(1)||selectors.addProperty('ADBE Text Selector'),adv=selector.property('advanced');
      adv.property('units').setValue(1);adv.property('basedOn').setValue(unit==='words'?3:1);adv.property('shape').setValue(1);adv.property('smoothness').setValue(preset==='typewriter'?0:100);adv.property('randomize').setValue(false);
      var startProp=selector.property('ADBE Text Percent Start'),endProp=selector.property('ADBE Text Percent End');startProp.setValue(0);endProp.setValue(seg.mode==='in'?100:0);
      var animated=seg.mode==='in'?startProp:endProp;animated.setValueAtTime(seg.begin,0);animated.setValueAtTime(seg.begin+duration,100);
      for(var k=1;k<=animated.numKeys;k++)animated.setInterpolationTypeAtKey(k,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
    }
    var layers=[];for(var j=0;j<queue.length;j++)layers.push(queue[j].layer);
    co.time=queue[0].segments[0].begin;say('Texto animado em '+queue.length+' camada(s). Ajuste pelas chaves do seletor.');
    return {count:queue.length,layers:layers,animators:created};
  }catch(error){
    var incomplete=false;for(var r=created.length-1;r>=0;r--)try{created[r].remove();}catch(ignore){incomplete=true;}
    say('Falha no texto: '+error.message+(incomplete?' · use Ctrl+Z para restaurar.':''));return false;
  }finally{app.endUndoGroup();}
}
function emRemoveTextSequences(){
  var co=app.project.activeItem;if(!(co instanceof CompItem)){say('Abra uma composição.');return false;}
  var selected=co.selectedLayers,queue=[];
  if(!selected.length){say('Selecione as camadas de texto.');return false;}
  for(var i=0;i<selected.length;i++){
    var layer=selected[i],group=emSequenceGroup(layer);if(!group)continue;
    for(var j=group.numProperties;j>=1;j--){var anim=group.property(j);if(anim.name.indexOf(emSequencePrefix)===0){if(layer.locked){say('Desbloqueie '+layer.name+'.');return false;}queue.push(anim);}}
  }
  if(!queue.length){say('Nenhuma sequência EdyMotion selecionada.');return false;}
  app.beginUndoGroup('EdyMotion - remover sequência de texto');
  try{for(var k=0;k<queue.length;k++)queue[k].remove();say(queue.length+' sequência(s) removida(s).');return true;}
  catch(error){say('Falha ao remover: '+error.message+' · use Ctrl+Z para restaurar.');return false;}
  finally{app.endUndoGroup();}
}
