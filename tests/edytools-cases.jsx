  var checks=0,co=app.project.items.addComp('EdyTools QA',640,360,1,5,30);
  function check(ok,label){if(!ok)throw Error(label);checks++;}
  for(var p=0;p<mkPresets.length;p++){
    for(var m=0;m<(mkPresets[p].kind==='highlight'?1:3);m++){
      for(var text=0;text<2;text++){
        textMode=!!text;var st=current();
        var layer=text?co.layers.addText('EdyTools'):co.layers.addSolid([1,.4,0],'Produto',100,100,1);
        layer.inPoint=1;layer.outPoint=4;layer.selected=true;co.time=2;
        st.visible=[p];st.selected=0;st.offset=0;
        for(var r=0;r<3;r++)st.radios[r].value=r===m;
        applySelected(st);
        check(message.indexOf('Efeito aplicado em 1 camada')===0,'Aplicacao '+p+' modo '+m+' '+message);
        var expected=mkPresets[p].kind==='highlight'?2:m===1?3.35:1;
        check(Math.abs(co.time-expected)<=co.frameDuration,'Tempo incorreto '+p+' '+m+' '+text+' '+co.time+' esperado '+expected);
        if(text){
          var group=textGroup(layer);
          check(group.numProperties===(m===2?2:1),'Animadores');
          var animator=group.property(1);
          var prop=mkPresets[p].kind==='highlight'?animator.property('ADBE Text Animator Properties').property(1):animator.property('ADBE Text Selectors').property(1).property('ADBE Text Percent Start');
          check(prop.numKeys>=2,'Chaves texto');
        }else{
          var t=layer.transform;
          check(t.position.numKeys+t.scale.numKeys+t.rotation.numKeys+t.opacity.numKeys>=2,'Chaves objeto');
        }
        layer.remove();
      }
    }
  }
  textMode=false;objState.section=3;fillList(objState);search.text='sacudir';fillList(objState);check(chosen(objState).name==='Sacudir','Busca');
  search.text='zzzzzzzzzzzz';fillList(objState);check(objState.visible.length===0,'Busca vazia');
  search.text='';fillList(objState);
  var lower=co.layers.addText('Inferior'),upper=co.layers.addText('Superior');
  lower.selected=upper.selected=true;lower.startTime=upper.startTime=1;step.text='.5';
  direction.selection.index=0;stagger();check(Math.abs(lower.inPoint-1.5)<.01&&upper.inPoint===1,'Escada direta');
  lower.startTime=upper.startTime=1;direction.selection.index=1;stagger();check(Math.abs(upper.inPoint-1.5)<.01&&lower.inPoint===1,'Escada reversa');
  for(var themeMode=0;themeMode<2;themeMode++){
    app.run('prefs.set',{values:{'appearance.appearanceMode':themeMode?'light':'dark','appearance.theme':themeMode?'light':'dark'}});
    themeStamp=0;theme();check(themeKey===(themeMode?'light':'dark'),'Tema');
    for(var page=0;page<4;page++){switchTab(page);draw();check(hits.length>0,'Navegacao');}
  }
  lower.remove();upper.remove();
  var ct=co.layers.addText('1000');ct.selected=true;ct.inPoint=1;ct.outPoint=4;
  var src=ct.property('ADBE Text Properties').property('ADBE Text Document');
  var fx=ct.property('ADBE Effect Parade');
  countStart.text='500';countEnd.text='1000';countDuration.text='2';co.time=3;
  applyCounter();check(message.indexOf('Contagem aplicada')===0,'Contador '+message);
  check(src.valueAtTime(1,false).text==='500','Valor inicial');
  check(src.valueAtTime(2,false).text==='750','Valor intermediario');
  check(src.valueAtTime(3,false).text==='1000','Valor final');
  check(src.valueAtTime(4,false).text==='1000','Valor permanece');
  check(fx.numProperties===1,'Um efeito');
  countStart.text='1000';countEnd.text='-100';applyCounter();
  check(fx.numProperties===1,'Reaplicar sem duplicar');
  check(src.valueAtTime(2,false).text==='450','Regressiva');
  check(src.valueAtTime(3,false).text==='-100','Final negativo');
  var expression=src.expression;
  countDuration.text='8';applyCounter();check(src.expression===expression&&fx.numProperties===1,'Limite preserva contagem');
  countAtCursor=true;countToEnd=true;co.time=2;applyCounter();
  check(src.valueAtTime(2,false).text==='1000'&&src.valueAtTime(4,false).text==='-100','Agulha ate fim');
  var slider=fx.property(1).property(1);slider.removeKey(2);slider.setValueAtTime(3,-100);
  check(src.valueAtTime(2.5,false).text==='450','Retiming na timeline');
  countStart.text='';expression=src.expression;applyCounter();check(src.expression===expression,'Vazio rejeitado');
  countStart.text='1.5';applyCounter();check(src.expression===expression,'Fracao rejeitada');
  src.expression='"externa"';countStart.text='500';applyCounter();check(src.expression==='"externa"','Expressao externa preservada');
  ct.remove();
  for(var dp=0;dp<mkPresets.length;dp++)if(mkPresets[dp].directional){
    for(var di=0;di<4;di++){
      objState.directionIndex=di;var preset=resolveDirection(mkPresets[dp],objState);
      var entry=preset.enter[0],out=preset.exit[preset.exit.length-1];
      check(di===0?entry.y>0&&out.y<0:di===1?entry.y<0&&out.y>0:di===2?entry.x>0&&out.x<0:entry.x<0&&out.x>0,'Direcao coerente '+dp+' '+di);
      var dl=co.layers.addSolid([1,1,1],'Direcao',100,100,1);dl.selected=true;
      objState.visible=[dp];objState.selected=0;objState.radios=[{value:true},{value:false},{value:false}];applySelected(objState);
      check(message.indexOf('Efeito aplicado')===0,'Aplicar direcao');dl.remove();
    }
  }
  animateMode(2);switchTab(0);draw();check(countStart.visible&&!search.visible,'Campos contador');
  ui.size=[300,720];layout();draw();
  for(var hi=0;hi<hits.length;hi++)if(hits[hi].id==='apply_counter')check(hits[hi].y+hits[hi].h<canvas.size.height-80,'Sem sobreposicao contador');
  animateMode(0);check(!countStart.visible&&search.visible,'Voltar animacoes');
  search.text='';
  for(var sec=0;sec<4;sec++){
    setSection(objState,sec);check(objState.visible.length>0,'Subaba preenchida '+sec);
    for(var vi=0;vi<objState.visible.length;vi++)check((mkPresets[objState.visible[vi]].kind==='highlight')===(sec===3),'Filtro subaba');
    check(chosenMode(objState)===(sec===3?0:sec),'Modo da subaba');
  }
  ui.size=[292,572];animateMode(0);setSection(objState,0);layout();draw();
  check(canvas.size.height===560,'Altura compacta');
  for(var ht=0;ht<hits.length;ht++)if(hits[ht].id==='apply')check(hits[ht].y+hits[ht].h<canvas.size.height-80,'Aplicar sem sobrepor rodape');
  dirty=false;selection();dirty=false;previewUntil=0;var beforeDraw=drawCount;
  globalThis.EdyToolsTick();globalThis.EdyToolsTick();check(drawCount===beforeDraw,'Sem redraw ocioso');
  togglePreview();check(previewing(),'Previa sob demanda');globalThis.EdyToolsTick();check(drawCount>beforeDraw,'Previa desenha');
  previewUntil=Date.now()-1;globalThis.EdyToolsTick();check(previewUntil===0,'Previa encerra automaticamente');
  beforeDraw=drawCount;globalThis.EdyToolsTick();check(drawCount===beforeDraw,'Retorno ao repouso');
  writeLn(checks+' verificacoes aprovadas');

