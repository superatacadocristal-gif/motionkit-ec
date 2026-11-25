// Requires emFixtureDir containing pixel.png and tone.wav, provided by runner.
var emContentChecks=0;
function emContentAssert(ok,label){if(!ok)throw Error('Content: '+label);emContentChecks++;}
var emContentComp=app.project.items.addComp('EdyMotion content QA',640,360,1,8,30);
emContentComp.openInViewer();emContentComp.time=1;
for(var emTi=0;emTi<emTemplateIds.length;emTi++){
  var before=emContentComp.numLayers;
  var result=emCreateTemplate(emTemplateIds[emTi],{title:'EdyMotion',subtitle:'Detalhe 1|Detalhe 2|Detalhe 3',duration:4});
  emContentAssert(!!result,'Modelo '+emTemplateIds[emTi]);
  emContentAssert(result.layers.length>=3&&emContentComp.numLayers===before+result.layers.length,'Camadas criadas');
  var texts=0,shapes=0;
  for(var emLi=0;emLi<result.layers.length;emLi++){
    var layer=result.layers[emLi];
    emContentAssert(layer.inPoint===1&&layer.outPoint===5,'Limites do modelo');
    emContentAssert(layer.transform.opacity.numKeys===4,'Entrada e saída');
    emContentAssert(layer.transform.opacity.valueAtTime(2,false)===100,'Visível no meio');
    if(layer instanceof TextLayer){texts++;emContentAssert(layer.text.sourceText.value.fontSize>0,'Texto editável');}
    else {shapes++;emContentAssert(layer.property('ADBE Root Vectors Group').numProperties>0,'Forma vetorial');}
  }
  emContentAssert(texts>0&&shapes>0,'Texto e formas');
  for(var emRi=result.layers.length-1;emRi>=0;emRi--)result.layers[emRi].remove();
}
var beforeInvalid=emContentComp.numLayers;
emContentAssert(emCreateTemplate('title',{duration:99})===null&&emContentComp.numLayers===beforeInvalid,'Rejeita duração');
emContentAssert(emCreateTemplate('title',{color:[NaN,0,0]})===null&&emContentComp.numLayers===beforeInvalid,'Rejeita cor');
emContentAssert(emCreateTemplate('not-a-template',{})===null&&emContentComp.numLayers===beforeInvalid,'Rejeita modelo');
var savedLibrary=emMediaList();emMediaSave([]);
try{
  var emExistingImage=emMediaFindItem(emFixtureDir+'/pixel.png'),emExistingAudio=emMediaFindItem(emFixtureDir+'/tone.wav');
  var idx=emMediaAdd(emFixtureDir+'/pixel.png');emContentAssert(idx===0,'Adiciona imagem '+idx+' '+message);
  emContentAssert(emMediaAdd(emFixtureDir+'/pixel.png')===0&&emMediaList().length===1,'Não duplica biblioteca');
  emContentAssert(emMediaAdd('relative.png')===-1,'Rejeita caminho relativo');
  emContentAssert(emMediaAdd(emFixtureDir+'/missing.png')===-1,'Rejeita arquivo ausente');
  emContentAssert(emMediaAdd(emFixtureDir+'/unknown.jsx')===-1,'Rejeita script');
  emContentComp.time=2;var media=emMediaImport(0);
  emContentAssert(!!media&&!!media.layer,'Importa e adiciona camada');
  emContentAssert(media.layer.inPoint===2&&media.layer.outPoint===8,'Mídia na agulha');
  var count=app.project.numItems,second=emMediaImport(0);emContentAssert(second.item.id===media.item.id&&app.project.numItems===count,'Reutiliza footage');
  second.layer.remove();media.layer.remove();if(!emExistingImage)media.item.remove();
  var audioIndex=emMediaAdd(emFixtureDir+'/tone.wav'),audio=emMediaImport(audioIndex);
  emContentAssert(!!audio&&audio.item.hasAudio,'Importa áudio');
  emContentAssert(audio.layer.outPoint<=emContentComp.duration,'Limita duração áudio');
  audio.layer.remove();if(!emExistingAudio)audio.item.remove();
  emContentAssert(emMediaRemove(0)&&emMediaList().length===1,'Remove só da lista');
  var preserved=app.project.importFile(new ImportOptions(new File(emFixtureDir+'/pixel.png')));emContentAssert(!!preserved,'Arquivo preservado');preserved.remove();
  emMediaCache=null;emContentAssert(emMediaList().length===1,'Persistência biblioteca');
}finally{emMediaSave(savedLibrary);}
writeLn('EdyMotion conteúdo: '+emContentChecks+' verificações aprovadas');
