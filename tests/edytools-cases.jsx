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
  textMode=false;fillList(objState);search.text='sacudir';fillList(objState);check(chosen(objState).name==='Sacudir','Busca');
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
  writeLn(checks+' verificacoes aprovadas');

