// EdyMotion original editable content and personal media library.
// by Edy Bastos — 11/2026. MIT.
var emTemplateIds=['title','lowerThird','offer','callout','list','background'];
function emCreateTemplate(id,opts){
  opts=opts||{};var co=app.project.activeItem;
  if(!(co instanceof CompItem)){say('Abra uma composição para criar um elemento.');return null;}
  if(emTemplateIds.indexOf(id)<0){say('Modelo desconhecido.');return null;}
  var start=co.time,duration=opts.duration===undefined?Math.min(4,co.duration-start):Number(opts.duration);
  if(!isFinite(duration)||duration<Math.max(.4,co.frameDuration*4)||start<0||start+duration>co.duration+.000001){say('Duração fora dos limites da composição.');return null;}
  var color=opts.color===undefined?[1,.36,.08]:opts.color;
  if(!(color instanceof Array)||color.length!==3){say('Cor inválida.');return null;}
  for(var ci=0;ci<3;ci++)if(typeof color[ci]!=='number'||!isFinite(color[ci])||color[ci]<0||color[ci]>1){say('Cor inválida.');return null;}
  var title=String(opts.title===undefined?'Sua mensagem':opts.title).substring(0,240),subtitle=String(opts.subtitle===undefined?'Edite o texto na composição':opts.subtitle).substring(0,500);
  var layers=[],end=start+duration,w=co.width,h=co.height,u=Math.min(w/1920,h/1080),white=[.97,.98,1],ink=[.055,.065,.09],soft=[.72,.77,.84],token='EM '+id+' '+Date.now();
  function retain(layer,name){layers.push(layer);layer.name='EdyMotion · '+name;layer.inPoint=start;layer.outPoint=end;layer.comment=JSON.stringify({edymotion:1,template:id,group:token});return layer;}
  function shape(name,x,y,width,height,fill,round){
    var layer=retain(co.layers.addShape(),name),root=layer.property('ADBE Root Vectors Group'),group=root.addProperty('ADBE Vector Group');group.name=name;
    var contents=group.property('ADBE Vectors Group'),rect=contents.addProperty('ADBE Vector Shape - Rect');
    rect.property('ADBE Vector Rect Size').setValue([width,height]);
    if(round)rect.property('ADBE Vector Rect Roundness').setValue(round);
    contents.addProperty('ADBE Vector Graphic - Fill').property('ADBE Vector Fill Color').setValue(fill);
    layer.transform.position.setValue([x,y]);return layer;
  }
  function text(name,value,x,y,size,fill,maxWidth){
    var layer=retain(co.layers.addText(value),name),source=layer.property('ADBE Text Properties').property('ADBE Text Document'),doc=source.value;
    doc.fontSize=size;doc.fillColor=fill;doc.justification=ParagraphJustification.CENTER_JUSTIFY;source.setValue(doc);
    var rect=layer.sourceRectAtTime(start,false);layer.transform.anchorPoint.setValue([rect.left+rect.width/2,rect.top+rect.height/2]);layer.transform.position.setValue([x,y]);
    if(rect.width>maxWidth){var sc=maxWidth/rect.width*100;layer.transform.scale.setValue([sc,sc]);}return layer;
  }
  app.beginUndoGroup('EdyMotion - criar '+id);
  try{
    if(id==='title'){
      shape('Acento',w/2,h*.38,100*u,6*u,color,3*u);
      text('Título',title,w/2,h*.48,84*u,white,w*.82);
      text('Subtítulo',subtitle,w/2,h*.60,30*u,soft,w*.76);
    }else if(id==='lowerThird'){
      shape('Tarja',w*.30,h*.80,w*.48,h*.16,ink,14*u);
      shape('Acento',w*.065,h*.80,7*u,h*.12,color,2*u);
      text('Nome',title,w*.30,h*.775,46*u,white,w*.40);
      text('Cargo',subtitle,w*.30,h*.83,25*u,soft,w*.40);
    }else if(id==='offer'){
      shape('Cartão oferta',w/2,h/2,w*.65,h*.55,ink,32*u);
      shape('Faixa oferta',w/2,h*.30,w*.56,h*.085,color,12*u);
      text('Chamada',subtitle,w/2,h*.30,34*u,white,w*.50);
      text('Preço',title,w/2,h*.49,126*u,white,w*.56);
      text('Nota editável','OFERTA ESPECIAL',w/2,h*.67,26*u,color,w*.50);
    }else if(id==='callout'){
      shape('Linha',w*.38,h*.56,w*.20,4*u,color,2*u);
      shape('Marcador',w*.28,h*.56,16*u,16*u,color,8*u);
      shape('Etiqueta',w*.65,h*.48,w*.36,h*.22,ink,18*u);
      text('Destaque',title,w*.65,h*.45,42*u,white,w*.31);
      text('Detalhe',subtitle,w*.65,h*.52,24*u,soft,w*.31);
    }else if(id==='list'){
      text('Título da lista',title,w/2,h*.25,54*u,white,w*.80);
      var lines=subtitle.split(/\r?\n|\|/);while(lines.length<3)lines.push('Item '+(lines.length+1));
      for(var li=0;li<Math.min(4,lines.length);li++){
        var y=h*.42+li*h*.11;shape('Marcador '+(li+1),w*.17,y,12*u,12*u,color,6*u);
        text('Item '+(li+1),String(lines[li]).substring(0,120),w*.52,y,34*u,white,w*.62);
      }
    }else{
      shape('Fundo',w/2,h/2,w,h,ink,0);
      shape('Faixa principal',w*.80,h*.50,w*.25,h*1.6,color,40*u).transform.rotation.setValue(-24);
      shape('Faixa secundária',w*.90,h*.50,w*.08,h*1.6,[color[0]*.5,color[1]*.5,color[2]*.5],20*u).transform.rotation.setValue(-24);
      text('Título do fundo',title,w*.38,h*.46,68*u,white,w*.56);
      text('Descrição',subtitle,w*.38,h*.59,28*u,soft,w*.52);
    }
    var ramp=Math.min(.4,duration/4);
    for(var n=0;n<layers.length;n++){
      var layer=layers[n],p=layer.transform.opacity;
      p.setValueAtTime(start,0);p.setValueAtTime(start+ramp,100);p.setValueAtTime(end-ramp,100);p.setValueAtTime(end,0);
      for(var ki=1;ki<=p.numKeys;ki++)p.setInterpolationTypeAtKey(ki,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
      if(id!=='background'){
        var pos=layer.transform.position,base=pos.value;
        pos.setValueAtTime(start,[base[0],base[1]+24*u]);pos.setValueAtTime(start+ramp,base);
      }
    }
    say('Elemento criado: '+layers.length+' camadas editáveis.');
    return {id:id,layers:layers,start:start,end:end};
  }catch(error){
    var failed=false;for(var j=layers.length-1;j>=0;j--)try{layers[j].remove();}catch(ignore){failed=true;}
    say('Falha ao criar elemento: '+error.message+(failed?' · use Ctrl+Z para reverter.':''));return null;
  }finally{app.endUndoGroup();}
}
var emMediaCache=null;
function emMediaPath(path){return String(path||'').replace(/\\/g,'/').replace(/\/+/g,'/');}
function emMediaAllowed(path){return /\.(png|jpe?g|gif|bmp|tiff?|webp|svg|exr|hdr|mp4|mov|avi|mkv|webm|m4v|mp3|wav|aiff?|aac|m4a|ogg|flac)$/i.test(path);}
function emMediaList(){
  if(emMediaCache===null){
    emMediaCache=[];
    try{
      if(app.settings.haveSetting('EdyMotion','mediaLibrary')){
        var parsed=JSON.parse(app.settings.getSetting('EdyMotion','mediaLibrary'));
        if(!(parsed instanceof Array)||parsed.length>500)throw Error('Formato inválido');
        for(var i=0;i<parsed.length;i++)if(parsed[i]&&typeof parsed[i].path==='string'&&emMediaAllowed(parsed[i].path))emMediaCache.push({path:parsed[i].path,name:String(parsed[i].name||new File(parsed[i].path).name)});
      }
    }catch(error){say('Não foi possível ler a biblioteca: '+error.message);}
  }
  return emMediaCache.slice(0);
}
function emMediaSave(items){app.settings.saveSetting('EdyMotion','mediaLibrary',JSON.stringify(items));emMediaCache=items;}
function emMediaFindItem(path){
  for(var i=1;i<=app.project.numItems;i++){var candidate=app.project.item(i);if(candidate instanceof FootageItem&&candidate.file&&emMediaPath(candidate.file.fsName).toLowerCase()===emMediaPath(path).toLowerCase())return candidate;}
  return null;
}
function emMediaAdd(path){
  try{
    path=emMediaPath(path);
    if(!/^(?:[a-z]:\/|\/)/i.test(path))throw Error('Use um caminho absoluto.');
    if(!emMediaAllowed(path))throw Error('Escolha uma imagem, vídeo ou áudio compatível.');
    var file=new File(path);
    var list=emMediaList();
    for(var i=0;i<list.length;i++)if(emMediaPath(list[i].path).toLowerCase()===path.toLowerCase()){say('Arquivo já está na biblioteca.');return i;}
    if(list.length>=500)throw Error('A biblioteca aceita até 500 itens.');
    var active=app.project.activeItem;app.beginUndoGroup('EdyMotion - adicionar à biblioteca');try{if(!emMediaFindItem(path))app.project.importFile(new ImportOptions(file));}finally{app.endUndoGroup();}
    if(active instanceof CompItem)active.openInViewer();
    list.push({path:path,name:file.name});emMediaSave(list);say('Arquivo importado no Projeto e adicionado à biblioteca.');return list.length-1;
  }catch(error){say('Biblioteca: '+error.message);return -1;}
}
function emMediaRemove(index){
  try{var list=emMediaList();if(Math.floor(index)!==index||index<0||index>=list.length)throw Error('Selecione um arquivo.');list.splice(index,1);emMediaSave(list);say('Item removido da biblioteca. O arquivo foi mantido.');return true;}
  catch(error){say('Biblioteca: '+error.message);return false;}
}
function emMediaImport(index){
  var list=emMediaList(),entry=list[index],co=app.project.activeItem,layer=null,item=null,created=false;
  if(!entry||Math.floor(index)!==index){say('Selecione um arquivo da biblioteca.');return null;}
  var file=new File(entry.path);
  if(co instanceof CompItem&&co.time>=co.duration-co.frameDuration){say('Posicione a agulha antes do fim da composição.');return null;}
  app.beginUndoGroup('EdyMotion - importar mídia');
  try{
    for(var i=1;i<=app.project.numItems;i++){
      var candidate=app.project.item(i);
      if(candidate instanceof FootageItem&&candidate.file&&emMediaPath(candidate.file.fsName).toLowerCase()===emMediaPath(file.fsName).toLowerCase()){item=candidate;break;}
    }
    if(!item){item=app.project.importFile(new ImportOptions(file));created=true;}
    if(co instanceof CompItem){
      layer=co.layers.add(item);layer.startTime=co.time;layer.inPoint=co.time;
      layer.outPoint=item.mainSource.isStill?co.duration:Math.min(co.duration,co.time+item.duration);
      if(layer.outPoint<=layer.inPoint)throw Error('A mídia não tem duração utilizável.');
    }
    say(layer?'Mídia inserida na agulha.':'Mídia importada no projeto.');return {item:item,layer:layer};
  }catch(error){
    if(layer)try{layer.remove();}catch(ignore){}
    if(created&&item)try{item.remove();}catch(ignore){}
    say('Falha ao importar mídia: '+error.message);return null;
  }finally{app.endUndoGroup();}
}
