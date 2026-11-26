/* Original, non-destructive cut-cover transitions for EffectCraft. */
function emCreateTransition(opts){
  opts=opts||{};var co=app.project.activeItem;if(!(co instanceof CompItem)){say('Abra uma composição.');return false;}
  var kind=opts.kind||'wipe',direction=opts.direction||'left',duration=Number(opts.duration),center=co.time,color=opts.color||[0,0,0],selected=co.selectedLayers;
  try{
    if(['wipe','flash','dip'].indexOf(kind)<0||['left','right','up','down'].indexOf(direction)<0)throw Error('Transição inválida.');
    if(!isFinite(duration)||duration<co.frameDuration*4||duration>co.duration)throw Error('Duração mínima: quatro frames.');
    if(!(color instanceof Array)||color.length!==3)throw Error('Cor inválida.');for(var ci=0;ci<3;ci++)if(typeof color[ci]!=='number'||!isFinite(color[ci])||color[ci]<0||color[ci]>1)throw Error('Cor inválida.');
    if(opts.at!=='cursor'){
      if(selected.length!==2)throw Error('Selecione os dois clipes ou escolha Na agulha.');
      var a=selected[0],b=selected[1];if(a.inPoint>b.inPoint){var temp=a;a=b;b=temp;}
      if(!a.hasVideo||!b.hasVideo||a.inPoint===b.inPoint||a.outPoint<b.inPoint-co.frameDuration*.1)throw Error('Selecione clipes visuais consecutivos, sem espaço entre eles.');
      center=b.inPoint;
      if(a.inPoint>center-duration/2||a.outPoint<center||b.outPoint<center+duration/2)throw Error('A transição excede o tempo disponível nos clipes.');
    }
    if(center-duration/2<0||center+duration/2>co.duration)throw Error('A transição não cabe nesta posição.');
  }catch(error){say('Não aplicado: '+error.message);return false;}
  var layer=null;app.beginUndoGroup('EdyMotion - transição');
  try{
    layer=co.layers.addShape();layer.name='EdyMotion · '+(kind==='wipe'?'Cortina':kind==='flash'?'Flash':'Escurecer');
    var begin=center-duration/2,end=center+duration/2,hold=co.frameDuration/2;
    layer.inPoint=begin;layer.outPoint=end;var vectors=layer.property('ADBE Root Vectors Group'),group=vectors.addProperty('ADBE Vector Group').property('ADBE Vectors Group');
    group.addProperty('ADBE Vector Shape - Rect').property('ADBE Vector Rect Size').setValue([co.width+4,co.height+4]);
    var fill=kind==='flash'?[1,1,1]:kind==='dip'?[0,0,0]:color;group.addProperty('ADBE Vector Graphic - Fill').property('ADBE Vector Fill Color').setValue(fill);
    layer.transform.position.setValue([co.width/2,co.height/2]);
    if(kind==='wipe'){
      var dx=direction==='left'?-(co.width+4):direction==='right'?co.width+4:0,dy=direction==='up'?-(co.height+4):direction==='down'?co.height+4:0;
      var pos=layer.transform.position;pos.setValueAtTime(begin,[co.width/2-dx,co.height/2-dy]);pos.setValueAtTime(center-hold,[co.width/2,co.height/2]);pos.setValueAtTime(center+hold,[co.width/2,co.height/2]);pos.setValueAtTime(end,[co.width/2+dx,co.height/2+dy]);
    }else{
      var opacity=layer.transform.opacity;opacity.setValueAtTime(begin,0);opacity.setValueAtTime(center-hold,100);opacity.setValueAtTime(center+hold,100);opacity.setValueAtTime(end,0);
    }
    layer.comment=JSON.stringify({edymotionTransition:1,kind:kind,direction:direction,center:center,duration:duration});
    say('Transição criada em camada editável. Ctrl+Z desfaz.');return layer;
  }catch(error){if(layer)try{layer.remove();}catch(ignore){}say('Falha: '+error.message);return false;}finally{app.endUndoGroup();}
}
