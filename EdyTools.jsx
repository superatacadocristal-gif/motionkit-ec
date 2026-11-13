/* EdyTools 2.0.0-beta — by Edy Bastos — 11/2026
 * MIT. Interface original e motor de ferramentas derivado do MotionKit EC.
 */

(function(thisObj){
  var ui=thisObj instanceof Panel?thisObj:new Window('palette','EdyTools',undefined,{resizeable:true});
  ui.orientation='stack';ui.margins=0;ui.minimumSize=[300,720];ui.preferredSize=[420,820];
  var canvas=ui.add('panel',undefined,'',{name:'edy_canvas'});
  canvas.alignment=['fill','fill'];canvas.margins=0;ui.size=[420,820];
  var search=ui.add('edittext',undefined,'',{name:'edy_search'});
  var duration=ui.add('edittext',undefined,'0,65',{name:'edy_duration'});
  var category=ui.add('dropdownlist',undefined,['Todas','Movimento','Esmaecer','Pop-up','Torcao','Bounce','Destaques'],{name:'edy_category'});category.selection=0;
  var strength=ui.add('edittext',undefined,'100',{name:'edy_strength'});
  search.helpTip='Buscar por nome ou movimento';duration.helpTip='Duração em segundos';strength.helpTip='Intensidade de 10 a 200%';
  var tab=0,textMode=false,paused=false,previewStart=Date.now(),pausedTime=0;
  var dirty=true;
  var hits=[],hover='',themeStamp=0,selectionStamp=0,lastSelection='',message='Selecione uma camada para começar.',messageKind='hint';
  var palette,curveIndex=3,layoutMode=0,themeKey='';
  var categories=['Todas','Movimento','Esmaecer','Pop-up','Torcao','Bounce','Destaques'];
  var icons={
    play:[[[5,3],[19,12],[5,21],[5,3]]],
    pause:[[[7,4],[7,20]],[[17,4],[17,20]]],
    search:[[[15,15],[21,21]]],
    layers:[[[2,7],[12,2],[22,7],[12,12],[2,7]],[[2,12],[12,17],[22,12]],[[2,17],[12,22],[22,17]]],
    curve:[[[2,21],[5,20],[8,17],[11,11],[14,5],[18,2],[22,2]]],
    anchor:[[[12,2],[12,22]],[[2,12],[22,12]],[[7,7],[17,7],[17,17],[7,17],[7,7]]],
    arrow:[[[3,12],[21,12]],[[15,6],[21,12],[15,18]]],
    left:[[[15,5],[8,12],[15,19]]],right:[[[9,5],[16,12],[9,19]]],
    check:[[[3,12],[9,18],[21,5]]],
    reset:[[[4,8],[4,2]],[[4,8],[10,8]],[[4,8],[8,4],[16,4],[21,9],[21,16],[16,21],[8,21]]],
    text:[[[3,4],[21,4]],[[12,4],[12,21]],[[7,21],[17,21]]],
    object:[[[4,4],[20,4],[20,20],[4,20],[4,4]]],
    copy:[[[8,8],[21,8],[21,21],[8,21],[8,8]],[[3,16],[3,3],[16,3]]],
    stairs:[[[2,5],[10,5]],[[6,12],[16,12]],[[12,19],[22,19]]],
    reverse:[[[12,3],[12,21]],[[6,9],[12,3],[18,9]]],
    save:[[[3,3],[19,3],[21,5],[21,21],[3,21],[3,3]],[[7,3],[7,9],[17,9],[17,3]],[[7,21],[7,14],[17,14],[17,21]]],
    star:[[[12,2],[15,9],[22,12],[15,15],[12,22],[9,15],[2,12],[9,9],[12,2]]]
  };
  var curvePresets=[
    {name:'Linear',values:[33.33,1,33.33,1]},
    {name:'Acelerar',values:[65,0,33,1]},
    {name:'Desacelerar',values:[33,1,65,0]},
    {name:'Suave',values:[50,0,50,0]},
    {name:'Cinemática',values:[75,0,75,0]},
    {name:'Ágil',values:[60,0,20,2.2]}
  ];
  var curveValues=curvePresets[3].values.slice(0),personalCurves=[];
  var fieldOutInf={text:'50'},fieldOutVel={text:'0'},fieldInInf={text:'50'},fieldInVel={text:'0'};
  var curveSide={selection:{index:0}},curveName={text:'Minha curva'};
  var curveSelect={selection:{index:0},removeAll:function(){},add:function(){}};
  var curveGraph={notify:function(){},graphics:{}};
  var prefix={text:'VIDEO_'},step={text:'0,12'},direction={selection:{index:0}};
  function state(isText){return {text:isText,cat:{selection:{text:'Todas'}},search:search,dur:duration,strength:strength,
    selected:0,offset:0,visible:[],radios:[{value:true},{value:false},{value:false}]};}
  var objState=state(false),textState=state(true);
  function current(){return textMode?textState:objState;}
  function num(s,min,max){var n=Number(String(s).replace(',','.'));return isFinite(n)&&n>=min&&n<=max?n:null;}
  function number(s,min,max){return num(s,min,max);}
  function vcopy(a){return a.slice(0);}
  function propAt(p,t){return p.valueAtTime?p.valueAtTime(t,false):p.value;}
  function context(){var c=app.project.activeItem;if(!(c instanceof CompItem)){say('Abra uma composição.');return null;}
    if(!c.selectedLayers.length){say('Selecione uma camada.');return null;}return c;}
  function say(text){dirty=true;message=String(text);messageKind=/Falha|Erro|Nao |nao |Selecione|inval|fora|existe/i.test(message)?'hint':'success';}
  function appliedFeedback(st,n,skips){say('Efeito aplicado em '+n+(n===1?' camada':' camadas')+(skips?' · '+skips+' ignoradas':''));}
  function theme(){
    if(Date.now()-themeStamp<1000)return;themeStamp=Date.now();
    var a=app.run('prefs.get',{key:'appearance'});if(a&&a.appearance)a=a.appearance;
    var light=a&&(a.appearanceMode==='light'||a.theme==='light');
    var key=light?'light':'dark';if(key===themeKey)return;themeKey=key;dirty=true;
    palette=light?{bg:[.965,.97,.98,1],card:[1,1,1,1],edge:[.84,.86,.90,1],text:[.08,.10,.14,1],muted:[.35,.39,.46,1],accent:[.06,.32,.88,1],tint:[.88,.92,1,1],green:[.09,.44,.27,1]}:
      {bg:[.055,.061,.075,1],card:[.10,.11,.135,1],edge:[.20,.22,.26,1],text:[.95,.96,.98,1],muted:[.60,.63,.69,1],accent:[1,.40,.08,1],tint:[.22,.13,.085,1],green:[.36,.84,.57,1]};
    ui.graphics.backgroundColor=ui.graphics.newBrush(ui.graphics.BrushType.SOLID_COLOR,palette.bg);
  }
  function pen(g,c,w){return g.newPen(g.PenType.SOLID_COLOR,c,w||1);}
  function path(g,points,color,width){g.newPath();g.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.strokePath(pen(g,color,width));}
  function box(g,x,y,w,h,r,color,border){
    g.newPath();
    var centers=[[x+w-r,y+r],[x+w-r,y+h-r],[x+r,y+h-r],[x+r,y+r]];
    for(var k=0;k<4;k++)for(var i=0;i<=18;i++){
      var angle=(-90+k*90+i*5)*Math.PI/180,px=centers[k][0]+Math.cos(angle)*r,py=centers[k][1]+Math.sin(angle)*r;
      if(k===0&&i===0)g.moveTo(px,py);else g.lineTo(px,py);
    }
    g.closePath();g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR,color));if(border)g.strokePath(pen(g,border,1));
  }
  function label(g,text,x,y,size,color,bold,max){
    text=String(text);var font=ScriptUI.newFont('Segoe UI',bold?'BOLD':'REGULAR',size||12);
    if(max){while(text.length>1&&g.measureString(text,font)[0]>max)text=text.slice(0,-2)+'…';}
    g.drawString(text,pen(g,color||palette.text),x,y,font);
  }
  function icon(g,name,x,y,size,color){
    var lines=icons[name]||icons.object;
    for(var i=0;i<lines.length;i++){var p=[];for(var j=0;j<lines[i].length;j++)p.push([x+lines[i][j][0]*size/24,y+lines[i][j][1]*size/24]);path(g,p,color||palette.text,1.7);}
    if(name==='search'){g.newPath();g.ellipsePath(x+size*.12,y+size*.12,size*.57,size*.57);g.strokePath(pen(g,color||palette.text,1.7));}
  }
  function hit(id,x,y,w,h,fn,tip){hits.push({id:id,x:x,y:y,w:w,h:h,fn:fn,tip:tip||id});}
  function button(g,id,text,ico,x,y,w,h,fn,selected,primary){
    var fill=primary?palette.accent:selected?palette.tint:palette.card;
    box(g,x,y,w,h,9,fill,selected||hover===id?palette.accent:palette.edge);
    var color=primary?[1,1,1,1]:selected?palette.accent:palette.text;
    if(ico)icon(g,ico,x+11,y+(h-18)/2,18,color);
    if(text)label(g,text,x+(ico?36:12),y+(h-15)/2,12,color,true,w-(ico?44:20));
    hit(id,x,y,w,h,fn,text||id);
  }
  function restart(){dirty=true;previewStart=Date.now();pausedTime=0;}
  function switchTab(n){tab=n;search.visible=duration.visible=strength.visible=category.visible=n===0;restart();layout();}
  function editValue(field,title,min,max){var value=prompt(title,field.text);if(value===null)return;if(min!==undefined&&num(value,min,max)===null){say('Valor fora do intervalo.');return;}field.text=value;}
  function selection(){
    if(Date.now()-selectionStamp<250)return;selectionStamp=Date.now();
    var c=app.project.activeItem,names=[],ids=[];
    if(c instanceof CompItem)for(var i=0;i<c.selectedLayers.length;i++){var l=c.selectedLayers[i];names.push(l.name);ids.push(l.id);}
    var key=JSON.stringify([c&&c.id,ids,names,tab,textMode]);
    if(key!==lastSelection){dirty=true;lastSelection=key;message=names.length?names.join(', ')+' · '+(names.length===1?'selecionado':'selecionados'):'Selecione uma camada para começar.';messageKind=names.length?'success':'hint';if(tab===1&&names.length){message='Selecione quadros-chave para aplicar a curva.';messageKind='hint';}}
  }
  function phase(){
    var d=num(duration.text,.12,8)||.65;
    return Math.min(1,(paused?pausedTime:(Date.now()-previewStart)/1000)%(d+.65)/d);
  }
  function sample(frames,t){
    var left=frames[0],right=frames[frames.length-1];
    for(var i=1;i<frames.length;i++)if(t<=frames[i].t){left=frames[i-1];right=frames[i];break;}
    var u=right.t===left.t?0:(t-left.t)/(right.t-left.t),force=(num(strength.text,10,200)||100)/100;
    var v={};var keys=['x','y','s','r','o'];
    for(var j=0;j<keys.length;j++){var k=keys[j],base=k==='s'||k==='o'?1:0;v[k]=base+(left[k]+(right[k]-left[k])*u-base)*force;}
    return v;
  }
  function motion(g,p,x,y,w,h,isText,t){
    var mode=chosenMode(current()),frames=p.kind==='highlight'?p.frames:mode===1?p.exit:p.enter;
    if(mode===2&&p.kind!=='highlight'){frames=t<.5?p.enter:p.exit;t=t<.5?t*2:(t-.5)*2;}
    var v=sample(frames,t),color=palette.accent.slice(0);color[3]=Math.max(0,Math.min(1,v.o));
    var cx=x+w/2+v.x*w*.3,cy=y+h/2+v.y*h*.3;
    if(isText){
      var word='Edy',size=Math.max(7,Math.min(27,18*Math.abs(v.s)));

      var glyphs=[[[[-1,-1],[-1,1],[.65,1]],[[-1,-1],[.65,-1]],[[-1,0],[.3,0]]],[[[-1,-1],[-1,1],[.2,1],[.8,.4],[.8,-.4],[.2,-1],[-1,-1]]],[[[-1,-1],[0,0],[1,-1]],[[0,0],[0,1]]]];
      for(var letter=0;letter<3;letter++){
        var lv=v;
        if(p.kind!=='highlight'){
          var endpoint=mode===1?p.exit[p.exit.length-1]:p.enter[0];
          var amount=mode===1?Math.max(0,Math.min(1,t*3-letter)):1-Math.max(0,Math.min(1,t*3-letter));
          var force=(num(strength.text,10,200)||100)/100;
          lv={x:endpoint.x*amount*force,y:endpoint.y*amount*force,s:1+(endpoint.s-1)*amount*force,r:endpoint.r*amount*force,o:1+(endpoint.o-1)*amount*force};
        }
        var col=palette.accent.slice(0);col[3]=Math.max(0,Math.min(1,lv.o));
        var angle=lv.r*Math.PI/180,radius=Math.min(8,h*.22)*lv.s;
        for(var segment=0;segment<glyphs[letter].length;segment++){
          var points=[];
          for(var z=0;z<glyphs[letter][segment].length;z++){
            var dx=glyphs[letter][segment][z][0]*radius,dy=glyphs[letter][segment][z][1]*radius;
            points.push([x+w/2+(letter-1)*21+lv.x*w*.25+dx*Math.cos(angle)-dy*Math.sin(angle),y+h/2+lv.y*h*.25+dx*Math.sin(angle)+dy*Math.cos(angle)]);
          }
          path(g,points,col,2);
        }
      }
    }else{
      var r=Math.min(w,h)*.17*v.s,a=v.r*Math.PI/180,pts=[];
      var corner=.24*r,centers=[[r-corner,-r+corner],[r-corner,r-corner],[-r+corner,r-corner],[-r+corner,-r+corner]];
      for(var k=0;k<4;k++)for(var j=0;j<=12;j++){var angle=(-90+k*90+j*7.5)*Math.PI/180;var dx=centers[k][0]+corner*Math.cos(angle),dy=centers[k][1]+corner*Math.sin(angle);pts.push([cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)]);}
      g.newPath();g.moveTo(pts[0][0],pts[0][1]);for(var n=1;n<pts.length;n++)g.lineTo(pts[n][0],pts[n][1]);g.closePath();g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR,color));
    }
  }
  function drawAnimate(g,w,h){
    var st=current(),p=chosen(st),gap=8,cw=(w-40)/2;
    button(g,'objects','Objetos','object',16,76,cw,34,function(){textMode=false;current().cat.selection.text=category.selection.text;fillList(current());restart();},!textMode);
    button(g,'texts','Textos','text',24+cw,76,cw,34,function(){textMode=true;current().cat.selection.text=category.selection.text;fillList(current());restart();},textMode);
    button(g,'search','', 'search',w-54,122,38,32,function(){fillList(st);restart();});

    var cardH=cardHeight(),top=205;
    for(var i=0;i<6;i++)(function(slot){
      var index=st.offset+slot,preset=mkPresets[st.visible[index]],x=16+(slot%2)*(cw+8),y=top+Math.floor(slot/2)*(cardH+8);
      if(!preset)return;
      var selected=index===st.selected;
      box(g,x,y,cw,cardH,11,selected?palette.tint:palette.card,selected?palette.accent:palette.edge);
      motion(g,preset,x+4,y+3,cw-8,cardH-26,textMode,selected?phase():.48);
      label(g,preset.name,x+10,y+cardH-23,11,selected?palette.accent:palette.text,true,cw-20);
      hit('preset_'+slot,x,y,cw,cardH,function(){st.selected=index;restart();},preset.desc);
    })(i);
    if(!st.visible.length)label(g,'Nenhum preset encontrado.',24,260,13,palette.muted);
    var py=top+3*(cardH+8);
    button(g,'previous','', 'left',16,py,34,28,function(){st.offset=Math.max(0,st.offset-6);});
    label(g,st.visible.length?(1+st.offset/6)+' / '+Math.ceil(st.visible.length/6):'0 / 0',w/2-18,py+6,11,palette.muted);
    button(g,'next','', 'right',w-50,py,34,28,function(){if(st.offset+6<st.visible.length)st.offset+=6;});
    var yy=py+39,mw=(w-48)/3;
    var modes=['Entrada','Saída','Ambos'];
    for(var m=0;m<3;m++)(function(n){button(g,'mode_'+n,modes[n],null,16+n*(mw+8),yy,mw,30,function(){for(var k=0;k<3;k++)st.radios[k].value=k===n;restart();},chosenMode(st)===n);})(m);
    label(g,'Duração (s)',16,yy+41,11,palette.muted);
    label(g,'Intensidade (%)',w/2+4,yy+41,11,palette.muted);
    label(g,p&&p.kind==='highlight'?'Destaque na posição da agulha':chosenMode(st)===1?'Saída no fim da camada':chosenMode(st)===2?'Entrada e saída nos limites da camada':'Entrada no início da camada',16,yy+98,11,palette.muted,false,w-32);
    button(g,'pause',paused?'Reproduzir':'Pausar',paused?'play':'pause',16,yy+111,cw,30,function(){if(!paused)pausedTime=(Date.now()-previewStart)/1000;else previewStart=Date.now()-pausedTime*1000;paused=!paused;});
    button(g,'restart','Reiniciar','reset',24+cw,yy+111,cw,30,restart);
    button(g,'apply','Aplicar animação','play',16,yy+151,w-32,40,function(){applySelected(st);},false,true);
  }
  function curveDrawing(g,vals,x,y,w,h,color){
    var x1=vals[0]/100,y1=x1*vals[1],x2=1-vals[2]/100,y2=1-(1-x2)*vals[3],points=[];
    for(var i=0;i<=64;i++){var t=i/64,q=1-t;points.push([x+w*(3*q*q*t*x1+3*q*t*t*x2+t*t*t),y+h*(1-(3*q*q*t*y1+3*q*t*t*y2+t*t*t))]);}
    path(g,points,color,2);
  }
  function drawCurves(g,w){
    label(g,'Dê ritmo ao movimento',16,84,18,palette.text,true);
    label(g,'Selecione quadros-chave na timeline.',16,112,12,palette.muted);
    var cw=(w-40)/2;
    for(var i=0;i<6;i++)(function(n){var x=16+n%2*(cw+8),y=144+Math.floor(n/2)*75,c=curvePresets[n];
      box(g,x,y,cw,66,10,n===curveIndex?palette.tint:palette.card,n===curveIndex?palette.accent:palette.edge);
      curveDrawing(g,c.values,x+15,y+10,cw-30,28,palette.accent);
      label(g,c.name,x+12,y+44,12,palette.text,true);
      hit('curve_'+n,x,y,cw,66,function(){curveIndex=n;setCurve(c.values,c.name);});
    })(i);
    box(g,16,379,w-32,75,12,palette.card,palette.edge);
    hit('edit_curve',16,379,w-32,75,function(){editValue(fieldOutInf,'Influência de saída (0,1 a 100)',.1,100);editValue(fieldOutVel,'Velocidade de saída (0 a 10)',0,10);editValue(fieldInInf,'Influência de entrada (0,1 a 100)',.1,100);editValue(fieldInVel,'Velocidade de entrada (0 a 10)',0,10);var values=currentCurveFields(true);if(values)curveValues=values;},'Clique para editar a curva');
    curveDrawing(g,curveValues,32,391,w-64,50,palette.accent);
    button(g,'copy_curve','Copiar curva','copy',16,467,cw,36,readCurve);
    button(g,'save_curve','Salvar curva','save',24+cw,467,cw,36,function(){editValue(curveName,'Nome da curva');saveCurve();});
    button(g,'saved','Curvas salvas · '+personalCurves.length,'curve',16,513,w-32,36,function(){
      if(!personalCurves.length){say('Salve uma curva para reutilizar.');return;}
      var names=[];for(var i=0;i<personalCurves.length;i++)names.push((i+1)+' · '+personalCurves[i].name);
      var pick=prompt(names.join('\n')+'\nDigite -1, -2... para excluir.','1');if(pick===null)return;var index=Number(pick);if(index<0&&personalCurves[-index-1]){curveSelect.selection.index=-index;deleteCurve();return;}var c=personalCurves[index-1];if(c)setCurve(c.values,c.name);
    });
    button(g,'apply_curve','Aplicar curva','curve',16,563,w-32,40,applyCurve,false,true);
  }
  function drawLayout(g,w){
    label(g,'Posicione com precisão',16,84,18,palette.text,true);
    var cw=(w-40)/2;
    button(g,'anchor_mode','Âncora','anchor',16,124,cw,36,function(){layoutMode=0;},layoutMode===0);
    button(g,'align_mode','Alinhar','layers',24+cw,124,cw,36,function(){layoutMode=1;},layoutMode===1);
    var size=Math.min(78,(w-64)/3),left=(w-size*3-16)/2;
    var points=['topLeft','top','topRight','left','center','right','bottomLeft','bottom','bottomRight'];
    for(var i=0;i<9;i++)(function(n){var x=left+n%3*(size+8),y=190+Math.floor(n/3)*(size+8);
      box(g,x,y,size,size,12,palette.card,palette.edge);
      var ax=x+size*.25+(n%3)*size*.25,ay=y+size*.25+Math.floor(n/3)*size*.25;
      path(g,[[x+size*.25,y+size*.25],[x+size*.75,y+size*.25],[x+size*.75,y+size*.75],[x+size*.25,y+size*.75],[x+size*.25,y+size*.25]],palette.muted,1);
      box(g,ax-4,ay-4,8,8,2,palette.accent);
      hit('anchor_'+n,x,y,size,size,function(){if(layoutMode===0)setAnchor(points[n]);else alignLayers('grid'+Math.floor(n/3)+(n%3));},'Posição '+(n+1));
    })(i);
    label(g,layoutMode===0?'Escolha o ponto de âncora.':'Alinhe a camada na composição.',16,476,12,palette.muted);
    button(g,'controller','Criar controlador nulo','anchor',16,518,w-32,42,makeMotionController);
    label(g,'Reposicione uma camada animada pelo nulo.',16,573,11,palette.muted,false,w-32);
  }
  function drawLayers(g,w){
    label(g,'Organize sua timeline',16,84,18,palette.text,true);
    label(g,'Escalonar camadas',16,126,13,palette.text,true);
    var cw=(w-40)/2;
    for(var n=0;n<2;n++)(function(k){var x=16+k*(cw+8);
      box(g,x,153,cw,112,12,direction.selection.index===k?palette.tint:palette.card,direction.selection.index===k?palette.accent:palette.edge);
      for(var i=0;i<3;i++)box(g,x+16+(k?2-i:i)*14,170+i*18,cw-65,8,3,palette.accent);
      label(g,k?'De baixo para cima':'De cima para baixo',x+10,239,11,palette.text,true,cw-20);
      hit('direction_'+k,x,153,cw,112,function(){direction.selection.index=k;});
    })(n);
    button(g,'interval','Intervalo · '+step.text+' s',null,16,281,w-32,36,function(){editValue(step,'Intervalo entre camadas (segundos)',0,20);});
    button(g,'stagger','Escalonar seleção','stairs',16,329,w-32,42,stagger,false,true);
    label(g,'Ferramentas de produção',16,400,13,palette.text,true);
    button(g,'rename','Renomear com prefixo','text',16,429,w-32,42,function(){editValue(prefix,'Prefixo das camadas');rename();});
    button(g,'duplicate','Duplicar composição e precomps','copy',16,483,w-32,42,duplicateComposition);
    button(g,'null','Criar controlador nulo','anchor',16,537,w-32,42,makeMotionController);
  }
  function draw(){
    theme();var g=canvas.graphics,w=canvas.size.width,h=canvas.size.height;hits=[];
    box(g,0,0,w,h,0,palette.bg);
    box(g,16,15,31,31,9,palette.accent);icon(g,'play',23,22,17,[1,1,1,1]);
    label(g,'EdyTools',57,15,20,palette.text,true);label(g,'MOTION WORKSPACE',58,39,8,palette.muted);
    var navY=h-66,nw=(w-32)/4;
    if(tab===0)drawAnimate(g,w,h);else if(tab===1)drawCurves(g,w);else if(tab===2)drawLayout(g,w);else drawLayers(g,w);
    var footerY=navY-49;
    box(g,16,footerY,w-32,33,8,messageKind==='success'?palette.tint:palette.card);
    icon(g,messageKind==='success'?'check':'object',25,footerY+9,15,messageKind==='success'?palette.green:palette.muted);
    label(g,message,48,footerY+9,11,messageKind==='success'?palette.green:palette.muted,false,w-72);
    box(g,8,navY,w-16,55,13,palette.card,palette.edge);
    var titles=['Animar','Curvas','Layout','Camadas'],symbols=['play','curve','anchor','layers'];
    for(var i=0;i<4;i++)(function(n){
      var x=16+n*nw;
      if(n===tab)box(g,x,navY+5,nw,45,10,palette.tint);
      icon(g,symbols[n],x+nw/2-9,navY+9,18,n===tab?palette.accent:palette.muted);
      label(g,titles[n],x+nw/2-20,navY+32,10,n===tab?palette.accent:palette.muted,true);
      hit('tab_'+n,x,navY+3,nw,49,function(){switchTab(n);},titles[n]);
    })(i);
    label(g,'by Edy Bastos — 11/2026',16,57,8,palette.muted);
  }
  function layout(){
    dirty=true;
    var w=Math.max(280,(ui.size.width||432)-12),h=Math.max(720,(ui.size.height||832)-12);
    canvas.bounds=[0,0,w,h];
    search.bounds=[16,122,w-62,154];category.bounds=[16,164,w-16,194];
    duration.bounds=[16,topFields(),w/2-4,topFields()+31];
    strength.bounds=[w/2+4,topFields(),w-16,topFields()+31];
  }
  function cardHeight(){return Math.max(40,Math.min(72,(canvas.size.height-600)/3));}
  function topFields(){return 205+3*(cardHeight()+8)+39+59;}
  canvas.onDraw=draw;
  canvas.addEventListener('click',function(e){
    for(var i=hits.length-1;i>=0;i--){var r=hits[i];if(e.clientX>=r.x&&e.clientX<r.x+r.w&&e.clientY>=r.y&&e.clientY<r.y+r.h){try{r.fn();}catch(error){say('Falha: '+error.message);}break;}}
    canvas.notify('onDraw');
  });
  canvas.addEventListener('mousemove',function(e){hover='';for(var i=0;i<hits.length;i++){var r=hits[i];if(e.clientX>=r.x&&e.clientX<r.x+r.w&&e.clientY>=r.y&&e.clientY<r.y+r.h){hover=r.id;canvas.helpTip=r.tip;dirty=true;break;}}});
  category.onChange=function(){current().cat.selection.text=category.selection.text;fillList(current());restart();};
  search.onChanging=function(){fillList(current());restart();};
  search.onChange=search.onChanging;duration.onChange=strength.onChange=restart;
  var oldPresets=[];
  function F(t,x,y,s,r,o){return {t:t,x:x||0,y:y||0,s:(s===undefined?1:s),r:r||0,o:(o===undefined?1:o)};}
  function addPreset(group,name,desc,frames){
    oldPresets.push({group:group,name:name,desc:desc,frames:frames});
  }
  // Coordenadas de posicao sao multiplos da distancia em pixels.
  // Escala e opacidade sao multiplicadores dos valores originais da camada.
  // Ordem 1: chegada / 2: saida; posicoes e animacoes sem recursos proprietarios.
  addPreset(1,'Subir suave','Entra de baixo com transparencia', [F(0,0,1,1,0,0),F(1,0,0)]);
  addPreset(1,'Descer suave','Entra de cima com transparencia', [F(0,0,-1,1,0,0),F(1,0,0)]);
  addPreset(1,'Esquerda suave','Desliza da esquerda',[F(0,-1,0,1,0,0),F(1,0,0)]);
  addPreset(1,'Direita suave','Desliza da direita',[F(0,1,0,1,0,0),F(1,0,0)]);
  addPreset(1,'Zoom delicado','Cresce e ganha opacidade',[F(0,0,0,.72,0,0),F(1,0,0)]);
  addPreset(1,'Diagonal veloz','Desliza em diagonal',[F(0,-.8,.8,1,0,0),F(.72,.08,-.07),F(1,0,0)]);

  addPreset(2,'Sair por cima','Desaparece subindo',[F(0,0,0),F(1,0,-1,1,0,0)]);
  addPreset(2,'Sair por baixo','Desaparece descendo',[F(0,0,0),F(1,0,1,1,0,0)]);
  addPreset(2,'Sair esquerda','Desliza para esquerda',[F(0,0,0),F(1,-1,0,1,0,0)]);
  addPreset(2,'Sair direita','Desliza para direita',[F(0,0,0),F(1,1,0,1,0,0)]);
  addPreset(2,'Zoom distante','Afasta e desaparece',[F(0,0,0),F(1,0,0,.45,0,0)]);
  addPreset(2,'Sumir ampliando','Aumenta e perde opacidade',[F(0,0,0),F(1,0,0,1.45,0,0)]);

  addPreset(3,'Pop classico','Aumenta com ultrapassagem suave',[F(0,0,0,.20,0,0),F(.56,0,0,1.17),F(.80,0,0,.96),F(1,0,0)]);
  addPreset(3,'Pop instantaneo','Entrada rapida com impacto',[F(0,0,0,.3,0,0),F(.72,0,0,1.09),F(1,0,0)]);
  addPreset(3,'Pop duplo','Dois ressaltos de escala',[F(0,0,0,.15,0,0),F(.38,0,0,1.23),F(.58,0,0,.88),F(.80,0,0,1.08),F(1,0,0)]);
  addPreset(3,'Pop elasticidade','Escala com tres amortecimentos',[F(0,0,0,.2,0,0),F(.40,0,0,1.28),F(.66,0,0,.89),F(.84,0,0,1.07),F(1,0,0)]);
  addPreset(3,'Pop lateral','Surge deslizando com aumento',[F(0,-.5,0,.45,0,0),F(.65,.07,0,1.13),F(1,0,0)]);
  addPreset(3,'Pop giratorio','Aparece com pequena rotacao',[F(0,0,0,.25,-35,0),F(.60,0,0,1.13,8),F(1,0,0)]);

  addPreset(4,'Pop encolher','Encolhe ate desaparecer',[F(0,0,0),F(.35,0,0,1.10),F(1,0,0,.12,0,0)]);
  addPreset(4,'Pop explodir','Amplia e desaparece',[F(0,0,0),F(.38,0,0,.93),F(1,0,0,1.72,0,0)]);
  addPreset(4,'Pop inverso','Diminui, cresce e some',[F(0,0,0),F(.42,0,0,.78),F(.7,0,0,1.16),F(1,0,0,0,0,0)]);
  addPreset(4,'Pop giratorio','Sai com pequena torcao',[F(0,0,0),F(.35,0,0,1.10,8),F(1,0,0,.1,65,0)]);
  addPreset(4,'Pop lateral','Desliza para fora encolhendo',[F(0,0,0),F(.4,.1,0,1.06),F(1,1,0,.28,0,0)]);
  addPreset(4,'Pop vibrante','Dois ressaltos antes da saida',[F(0,0,0),F(.24,0,0,1.14),F(.46,0,0,.91),F(.65,0,0,1.05),F(1,0,0,.1,0,0)]);

  addPreset(5,'Giro positivo 90','Giro de 90 graus ate repouso',[F(0,0,0,.70,90,0),F(.74,0,0,1.07,-5),F(1,0,0)]);
  addPreset(5,'Giro negativo 90','Giro negativo de 90 graus',[F(0,0,0,.70,-90,0),F(.74,0,0,1.07,5),F(1,0,0)]);
  addPreset(5,'Meia-volta','Gira 180 graus ao surgir',[F(0,0,0,.55,180,0),F(.78,0,0,1.05,-6),F(1,0,0)]);
  addPreset(5,'Torcao curta','Pequena rotacao com escala',[F(0,0,0,.65,-25,0),F(.60,0,0,1.11,8),F(1,0,0)]);
  addPreset(5,'Espiral curta','Entra de lado girando',[F(0,-.65,.4,.35,160,0),F(.7,.07,-.05,1.08,-8),F(1,0,0)]);
  addPreset(5,'Giro elastico','Giro com tres amortecimentos',[F(0,0,0,.55,-95,0),F(.48,0,0,1.10,17),F(.72,0,0,.97,-8),F(1,0,0)]);

  addPreset(6,'Giro positivo 90','Gira para fora em 90 graus',[F(0,0,0),F(.25,0,0,1.04,-6),F(1,0,0,.50,90,0)]);
  addPreset(6,'Giro negativo 90','Gira para fora em -90 graus',[F(0,0,0),F(.25,0,0,1.04,6),F(1,0,0,.50,-90,0)]);
  addPreset(6,'Meia-volta','Sai com giro de 180 graus',[F(0,0,0),F(1,0,0,.4,180,0)]);
  addPreset(6,'Torcao curta','Torcao pequena e desaparecimento',[F(0,0,0),F(.45,0,0,1.10,14),F(1,0,0,.3,-45,0)]);
  addPreset(6,'Espiral curta','Deslocamento diagonal com giro',[F(0,0,0),F(.30,0,0,1.09,10),F(1,.8,-.7,.25,150,0)]);
  addPreset(6,'Giro elastico','Oscilacao antes de girar e sair',[F(0,0,0),F(.23,0,0,1.06,-16),F(.47,0,0,.96,12),F(1,0,0,.45,-110,0)]);

  addPreset(7,'Quicar de baixo','Entrada com ressalto vertical',[F(0,0,1,1,0,0),F(.50,0,-.18),F(.72,0,.10),F(.88,0,-.04),F(1,0,0)]);
  addPreset(7,'Quicar de cima','Entrada caindo e ressaltando',[F(0,0,-1,1,0,0),F(.50,0,.18),F(.72,0,-.10),F(.88,0,.04),F(1,0,0)]);
  addPreset(7,'Quicar esquerda','Entrada lateral com oscilacao',[F(0,-1,0,1,0,0),F(.50,.18,0),F(.72,-.10,0),F(.88,.04,0),F(1,0,0)]);
  addPreset(7,'Quicar direita','Entrada lateral com oscilacao',[F(0,1,0,1,0,0),F(.50,-.18,0),F(.72,.10,0),F(.88,-.04,0),F(1,0,0)]);
  addPreset(7,'Quicar escala','Escala elastica de entrada',[F(0,0,0,.30,0,0),F(.44,0,0,1.25),F(.67,0,0,.87),F(.86,0,0,1.07),F(1,0,0)]);
  addPreset(7,'Quicar diagonal','Entrada diagonal com ressaltos',[F(0,-.8,.75,1,0,0),F(.50,.18,-.12),F(.72,-.08,.06),F(1,0,0)]);

  addPreset(8,'Quicar para baixo','Sai quicando para baixo',[F(0,0,0),F(.25,0,-.11),F(.48,0,.12),F(1,0,1,1,0,0)]);
  addPreset(8,'Quicar para cima','Sai quicando para cima',[F(0,0,0),F(.25,0,.11),F(.48,0,-.12),F(1,0,-1,1,0,0)]);
  addPreset(8,'Quicar esquerda','Oscila e sai pela esquerda',[F(0,0,0),F(.25,.11,0),F(.48,-.12,0),F(1,-1,0,1,0,0)]);
  addPreset(8,'Quicar direita','Oscila e sai pela direita',[F(0,0,0),F(.25,-.11,0),F(.48,.12,0),F(1,1,0,1,0,0)]);
  addPreset(8,'Quicar escala','Sai com ressaltos de escala',[F(0,0,0),F(.22,0,0,1.14),F(.42,0,0,.90),F(.64,0,0,1.07),F(1,0,0,.12,0,0)]);
  addPreset(8,'Quicar diagonal','Oscila e sai em diagonal',[F(0,0,0),F(.22,.08,-.10),F(.45,-.10,.07),F(1,.9,.85,1,0,0)]);


  var mkPresets=[];
  function addPair(category,name,indexIn,indexOut,aliases){
    mkPresets.push({category:category,name:name,kind:'dual',enter:indexIn<0?[]:oldPresets[indexIn].frames,
      exit:indexOut<0?[]:oldPresets[indexOut].frames,desc:indexIn<0?'Aparece ou desaparece suavemente':oldPresets[indexIn].desc,aliases:aliases||''});
  }
  addPair('Esmaecer','Esmaecer',-1,-1,'fade fadein fadeout fade in fade out sumir aparecer transparencia opacidade desvanecer');
  // Corrige o par sem indices: opacidade pura em 0/100 e 100/0.
  mkPresets[0].enter=[F(0,0,0,1,0,0),F(1,0,0,1,0,1)];
  mkPresets[0].exit=[F(0,0,0,1,0,1),F(1,0,0,1,0,0)];
  var moves=['Subir','Descer','Deslizar esquerda','Deslizar direita','Zoom','Diagonal'];
  var pops=['Classico','Rapido','Duplo','Elastico','Lateral','Giratorio'];
  var twists=['Giro +90','Giro -90','Meia-volta','Torcao curta','Espiral','Giro elastico'];
  var bounces=['Baixo','Cima','Esquerda','Direita','Escala','Diagonal'];
  for(var k=0;k<6;k++){
    addPair('Movimento',moves[k],k,6+k,'slide deslizar entrada saida mover '+moves[k]);
    addPair('Pop-up',pops[k],12+k,18+k,'popup pop zoom crescimento escala '+pops[k]);
    addPair('Torcao',twists[k],24+k,30+k,'twister twist spin rotacao girar torcer '+twists[k]);
    addPair('Bounce',bounces[k],36+k,42+k,'bounce quicar elasticidade salto pular '+bounces[k]);
  }
  function addHighlight(name,frames,desc,aliases){mkPresets.push({category:'Destaques',name:name,kind:'highlight',frames:frames,desc:desc,aliases:aliases||''});}
  // Cada destaque retorna a posicao, escala, rotacao e opacidade de origem.
  addHighlight('Show Up',[F(0,0,0),F(.20,0,-.12,1.18,-3),F(.43,.06,0,1.11,3),F(.68,-.025,0,1.04,-1),F(1,0,0)],'Zoom e movimento, depois volta ao normal','to aqui olha chamar atencao look showup destaque zoom');
  addHighlight('Pulso',[F(0,0,0),F(.40,0,0,1.20),F(1,0,0)],'Aumenta e retorna ao tamanho','pulse respirar zoom destaque');
  addHighlight('Sacudir',[F(0,0,0),F(.18,-.17,0),F(.36,.16,0),F(.54,-.09,0),F(.72,.05,0),F(1,0,0)],'Vibracao lateral e retorno','shake tremer vibrar mexer atencao');
  addHighlight('Balancar',[F(0,0,0),F(.25,0,0,1,-11),F(.50,0,0,1,9),F(.76,0,0,1,-4),F(1,0,0)],'Oscila em rotacao e retorna','wiggle swing rotacao oscillacao');
  addHighlight('Enfatizar',[F(0,0,0),F(.20,0,-.08,1.12),F(.43,0,0,.94),F(.68,0,0,1.07),F(1,0,0)],'Salta e estabiliza','emphasis enfatizar aviso impacto alerta');
  addHighlight('Respirar',[F(0,0,0),F(.33,0,0,1.05),F(.66,0,0,1.10),F(1,0,0)],'Aumenta sutilmente e retorna','breath respirar pulsar suave');
  function norm(s){return String(s||'').toLowerCase().replace(/[áàâãä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i').replace(/[óòôõö]/g,'o').replace(/[úùûü]/g,'u').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,' ').replace(/^ +| +$/g,'');}
  function editDistance(a,b){var m=a.length,n=b.length,d=[],i,j;if(!m)return n;if(!n)return m;
    for(i=0;i<=m;i++){d[i]=[];d[i][0]=i;}for(j=0;j<=n;j++)d[0][j]=j;
    for(i=1;i<=m;i++)for(j=1;j<=n;j++){var cost=a.charAt(i-1)===b.charAt(j-1)?0:1;
      d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+cost);
      if(i>1&&j>1&&a.charAt(i-1)===b.charAt(j-2)&&a.charAt(i-2)===b.charAt(j-1))d[i][j]=Math.min(d[i][j],d[i-2][j-2]+cost);
    }return d[m][n];}
  function matchTerm(term,p){var words=norm(p.name+' '+p.category+' '+p.desc+' '+p.aliases).split(' '),full=words.join(' ');
    if(full.indexOf(term)>=0)return 0;
    var best=99,lim=term.length<=3?1:term.length<=6?2:3;
    for(var i=0;i<words.length;i++)if(words[i]){var distance=editDistance(term,words[i]);if(distance<=lim&&distance<best)best=distance;}
    return best;
  }
  function score(q,p){var words=norm(q).split(' '),total=0;
    for(var i=0;i<words.length;i++)if(words[i]){var m=matchTerm(words[i],p);if(m===99)return 99;total+=m;}
    return total;
  }
  function chosen(st){var i=st.selected;return i>=0&&i<st.visible.length?mkPresets[st.visible[i]]:null;}
  function fillList(st){var type=st.cat.selection?st.cat.selection.text:'Todas',terms=st.search.text,items=[];
    for(var i=0;i<mkPresets.length;i++){var p=mkPresets[i];if(type!=='Todas'&&type!==p.category)continue;
      var s=score(terms,p);if(s<99)items.push({idx:i,score:s});}
    items.sort(function(a,b){return a.score-b.score||a.idx-b.idx;});
    st.visible=[];st.offset=0;st.selected=0;
    for(var j=0;j<items.length;j++){st.visible.push(items[j].idx);}
    refreshTiles(st);
  }
  function refreshTiles(st){st.selected=Math.max(0,Math.min(st.selected,st.visible.length-1));}
  function describe(st){}
  function chosenMode(st){for(var i=0;i<st.radios.length;i++)if(st.radios[i].value)return i;return 0;}
  function within(p,beg,end,eps){if(!p||typeof p.setValueAtTime!=='function')return 'Propriedade nao animavel';
    try{if(p.expressionEnabled)return 'Expressao ativa';if(p.dimensionsSeparated)return 'Posicao separada';
      for(var k=1;k<=p.numKeys;k++){var kt=p.keyTime(k);if(kt>=beg-eps&&kt<=end+eps)return 'Ja existe quadro-chave no intervalo';}
    }catch(e){return 'Nao foi possivel verificar quadros-chave';}
    return '';
  }
  function channelsOf(frames){var found=[];for(var i=0;i<frames.length;i++){var f=frames[i];
    if((f.x||f.y)&&found.indexOf('position')<0)found.push('position');
    if(f.s!==1&&found.indexOf('scale')<0)found.push('scale');
    if(f.r&&found.indexOf('rotation')<0)found.push('rotation');
    if(f.o!==1&&found.indexOf('opacity')<0)found.push('opacity');
  }return found;}
  function animationSegments(layer,p,mode,co,dur){
    if(p.kind==='highlight')return [{begin:co.time,frames:p.frames,dir:'hl'}];
    var segments=[];
    if(mode!==1)segments.push({begin:Math.max(0,layer.inPoint),frames:p.enter,dir:'in'});
    if(mode!==0)segments.push({begin:Math.min(co.duration,layer.outPoint)-dur,frames:p.exit,dir:'out'});
    return segments;
  }
  function previewAt(co,begin){
    // Scrub only after applying, outside the animation undo group.
    if(begin!==null)co.time=begin;
  }
  function plans(layer,p,mode,co,dur){var out=[],eps=(co.frameDuration||1/30)*.2;
    if(layer.locked)return {error:'Camada bloqueada'};
    if(layer.threeDLayer)return {error:'Suporte apenas 2D'};
    var seq=animationSegments(layer,p,mode,co,dur);
    if(seq.length===2&&seq[0].begin+dur>=seq[1].begin-eps)return {error:'Entrada e saida se sobrepoem; reduza a duracao'};
    for(var s=0;s<seq.length;s++){
      var q=seq[s],end=q.begin+dur,cs=channelsOf(q.frames),props={},baseline={};
      if(q.begin<layer.inPoint-eps||end>layer.outPoint+eps||q.begin<0||end>co.duration+eps)return {error:'Intervalo fora da camada'};
      if(!cs.length)return {error:'Preset sem canais validos'};
      for(var j=0;j<cs.length;j++){
        var name=cs[j],prop=layer.transform?layer.transform[name]:null,err=within(prop,q.begin,end,eps);
        if(err)return {error:name+': '+err};
        var b=propAt(prop,q.begin);
        if((name==='position'||name==='scale')&&(!b||b.length<2))return {error:'Vetores invalidos: '+name};
        if((name==='rotation'||name==='opacity')&&typeof b!=='number')return {error:'Valor invalido: '+name};
        props[name]=prop;baseline[name]=b;
      }
      out.push({begin:q.begin,dur:dur,frames:q.frames,channels:cs,props:props,baseline:baseline});
    }
    return {jobs:out};
  }
  function writeFrames(j,force,co){var dist=Math.min(co.width,co.height)*.35,fr=j.frames;
    for(var k=0;k<j.channels.length;k++){
      var ch=j.channels[k],p=j.props[ch],base=j.baseline[ch],ts=[];
      for(var i=0;i<fr.length;i++){
        var f=fr[i],at=j.begin+f.t*j.dur,v;
        if(ch==='position')v=[base[0]+f.x*dist*force,base[1]+f.y*dist*force];
        else if(ch==='scale')v=[base[0]*(1+(f.s-1)*force),base[1]*(1+(f.s-1)*force)];
        else if(ch==='rotation')v=base+f.r*force;
        else v=Math.max(0,Math.min(100,base*(1+(f.o-1)*force)));
        if((ch==='position'||ch==='scale')&&base.length>2)v.push(base[2]);
        p.setValueAtTime(at,v);ts.push(at);
      }
      soften(p,ts);
    }
  }
  function soften(p,times){if(typeof KeyframeEase==='undefined'||typeof KeyframeInterpolationType==='undefined')return;
    for(var i=0;i<times.length;i++)try{var k=p.nearestKeyIndex(times[i]);if(Math.abs(p.keyTime(k)-times[i])>.0001)continue;
      var a=p.keyInTemporalEase(k),b=p.keyOutTemporalEase(k);if(!a||!b)continue;
      var x=[],y=[];for(var j=0;j<a.length;j++)x.push(new KeyframeEase(0,38));for(var l=0;l<b.length;l++)y.push(new KeyframeEase(0,38));
      p.setInterpolationTypeAtKey(k,KeyframeInterpolationType.BEZIER,KeyframeInterpolationType.BEZIER);p.setTemporalEaseAtKey(k,x,y);
    }catch(e){}
  }
  function applyObjects(st,p,dur,force){var co=context();if(!co)return;
    var done=0,first=null,skips=[],items=co.selectedLayers,mode=chosenMode(st);
    // Pre-valida todas as camadas; nenhuma sobrescrita silenciosa.
    var queue=[];for(var i=0;i<items.length;i++){var plan=plans(items[i],p,mode,co,dur);
      if(plan.error)skips.push(items[i].name+': '+plan.error);else queue.push(plan.jobs);
    }
    if(!queue.length){say('Nao aplicado: '+(skips.length?skips[0]:'Nenhuma camada valida'));return;}
    app.beginUndoGroup('EdyTools - '+p.name);
    try{for(var a=0;a<queue.length;a++)try{for(var k=0;k<queue[a].length;k++)writeFrames(queue[a][k],force,co);done++;if(first===null||queue[a][0].begin<first)first=queue[a][0].begin;}catch(ex){skips.push('Erro: '+ex.message);}}
    finally{app.endUndoGroup();}
    previewAt(co,first);
    if(done)appliedFeedback(st,done,skips.length);
    else say('Falha ao aplicar: '+(skips[0]||'nenhuma camada compatível'));
  }
  function textGroup(layer){try{var t=layer.property('ADBE Text Properties');if(!t)return null;return t.property('ADBE Text Animators');}catch(e){return null;}}
  function findP(x,keys){for(var i=0;i<keys.length;i++){try{var p=x.property(keys[i]);if(p)return p;}catch(e){}}
    return null;}
  function textValue(channel,f,force){
    var scale=100*(1+(f.s-1)*force);
    if(channel==='position')return [f.x*55*force,f.y*55*force,0];
    if(channel==='scale')return [scale,scale,100];
    if(channel==='rotation')return f.r*force;
    return Math.max(0,Math.min(100,100*(1+(f.o-1)*force)));
  }
  function setTextEffect(animator,frames,force,begin,dur,isHighlight){
    var matches={position:'ADBE Text Position 3D',scale:'ADBE Text Scale 3D',
      rotation:'ADBE Text Rotation',opacity:'ADBE Text Opacity'};
    var channels=channelsOf(frames);
    for(var i=0;i<channels.length;i++){
      var channel=channels[i];
      var prop=animator.property('ADBE Text Animator Properties').addProperty(matches[channel]);
      if(!prop)throw new Error('Animador nao aceita '+channel);
      if(isHighlight){
        for(var j=0;j<frames.length;j++){
          var f=frames[j];
          prop.setValueAtTime(begin+f.t*dur,textValue(channel,f,force));
        }
      }else prop.setValue(textValue(channel,frames[0],force));
    }
  }
  function setTextKeys(selector,begin,dur,direction,layerStart){var start=findP(selector,['ADBE Text Percent Start','start']);if(!start)throw new Error('Seletor Inicio nao encontrado');
    if(direction==='in'){start.setValueAtTime(begin,0);start.setValueAtTime(begin+dur,100);}
    else{if(layerStart<begin)start.setValueAtTime(layerStart,100);start.setValueAtTime(begin,100);start.setValueAtTime(begin+dur,0);}
  }
  function applyText(st,p,dur,force){var co=context();if(!co)return;
    var selected=co.selectedLayers,mode=chosenMode(st),good=0,first=null,skips=[];
    var queue=[];for(var i=0;i<selected.length;i++){
      var layer=selected[i],g=textGroup(layer),segments=[];
      if(layer.locked||!g){skips.push(layer.name+': selecione uma camada de texto desbloqueada');continue;}
      segments=animationSegments(layer,p,mode,co,dur);
      var bad='';for(var j=0;j<segments.length;j++){
        var begin=segments[j].begin;
        if(begin<Math.max(0,layer.inPoint)||begin+dur>Math.min(co.duration,layer.outPoint)+.0001)bad='Duracao fora do intervalo da camada';
      }
      if(segments.length===2&&segments[0].begin+dur>=segments[1].begin-0.001)bad='Entrada/saida se sobrepoem';
      if(bad)skips.push(layer.name+': '+bad);else queue.push({layer:layer,g:g,segments:segments});
    }
    if(!queue.length){say('Texto nao animado: '+(skips[0]||'sem camadas'));return;}
    app.beginUndoGroup('EdyTools - texto - '+p.name);
    try{for(var k=0;k<queue.length;k++)try{
      var q=queue[k],initialCount=q.g.numProperties;
      for(var z=0;z<q.segments.length;z++){
        var s=q.segments[z],anim=q.g.addProperty('ADBE Text Animator');
        if(!anim)throw new Error('Criacao do animador falhou');anim.name='MK '+p.name+' '+s.dir;
        var frames=s.dir==='hl'?p.frames:s.dir==='in'?p.enter:[p.exit[p.exit.length-1]];
        setTextEffect(anim,frames,force,s.begin,dur,s.dir==='hl');
        if(s.dir!=='hl'){
          var selectors=findP(anim,['ADBE Text Selectors']);
          if(!selectors)throw new Error('Seletores de texto indisponiveis');
          // EffectCraft ja cria um selector padrao: nunca adicionar outro.
          var selector=findP(selectors,[1]);if(!selector)selector=selectors.addProperty('ADBE Text Selector');
          setTextKeys(selector,s.begin,dur,s.dir,q.layer.inPoint);
        }
      }good++;
      if(first===null||q.segments[0].begin<first)first=q.segments[0].begin;
      }catch(err){
        for(var a=q.g.numProperties;a>initialCount;a--)q.g.property(a).remove();
        skips.push('Falha na camada de texto: '+err.message);
      }
    }finally{app.endUndoGroup();}
    previewAt(co,first);
    if(good)appliedFeedback(st,good,skips.length);
    else say('Falha ao aplicar: '+(skips[0]||'nenhum texto compatível'));
  }
  function applySelected(st){var p=chosen(st);if(!p){say('Escolha um preset na lista');return;}
    var dur=num(st.dur.text,.12,8),force=num(st.strength.text,10,200);
    if(dur===null||force===null){say('Duracao 0,12 a 8s; forca 10 a 200%');return;}
    if(st.text)applyText(st,p,dur,force/100);else applyObjects(st,p,dur,force/100);
  }
  function setAnchor(point){var co=context();if(!co)return;try{var r=app.run('layer.quickSetAnchor',{point:point});say('Ancora ajustada.');}catch(e){say('Falha ao ajustar ancora: '+e.message);}}
  function alignLayers(which){var co=context();if(!co)return;
    var isGrid=which.indexOf('grid')===0,x=isGrid?Number(which.charAt(4)):1,y=isGrid?Number(which.charAt(5)):1;
    // Compensa pelas bordas da camada no tempo atual, sem mexer nos keyframes.
    var done=0,skip=[];app.beginUndoGroup('EdyTools - alinhar camadas');try{
      for(var i=0;i<co.selectedLayers.length;i++)try{
        var la=co.selectedLayers[i],po=la.transform.position;
        if(la.locked||la.parent||la.threeDLayer||po.numKeys>0||po.expressionEnabled||po.dimensionsSeparated){skip.push(la.name);continue;}
        var rect=la.sourceRectAtTime(co.time,false),sc=la.transform.scale.value,anc=la.transform.anchorPoint.value;
        var left=rect.left*sc[0]/100,top=rect.top*sc[1]/100,w=rect.width*sc[0]/100,h=rect.height*sc[1]/100;
        // Visual layer origin is position - anchor + rect offset (adjusted by scale).
        var ax=(anc[0]||0)*sc[0]/100,ay=(anc[1]||0)*sc[1]/100;
        var desiredX=x===0?0:x===1?co.width/2:co.width;
        var desiredY=y===0?0:y===1?co.height/2:co.height;
        po.setValue([desiredX+ax-left-(x===0?0:x===1?w/2:w),desiredY+ay-top-(y===0?0:y===1?h/2:h)]);done++;
      }catch(e){skip.push(la.name+': '+e.message);}
    }finally{app.endUndoGroup();}
    say('Alinhadas: '+done+' / '+co.selectedLayers.length+(skip.length?' | ignoradas: '+skip.length:''));
  }
  function duplicateComposition(){
    var comp=app.project.activeItem;
    if(!(comp instanceof CompItem)){say('Abra a composição que deseja duplicar.');return;}
    var copies={},created=[],result;
    function copyTree(source){
      if(copies[source.id])return copies[source.id];
      var copy=source.duplicate();
      if(!copy)throw new Error('Falha ao duplicar '+source.name);
      copies[source.id]=copy;
      created.push(copy);
      for(var i=1;i<=copy.numLayers;i++){
        var layer=copy.layer(i),nested=layer.source;
        if(!(nested instanceof CompItem))continue;
        var replacement=copyTree(nested),locked=layer.locked;
        try{if(locked)layer.locked=false;layer.replaceSource(replacement,false);}
        finally{if(locked)layer.locked=true;}
      }
      return copy;
    }
    app.beginUndoGroup('EdyTools - Duplicar composição');
    try{result=copyTree(comp);}
    catch(error){
      for(var i=0;i<created.length;i++)created[i].remove();
      say('Falha ao duplicar: '+error.message);
    }finally{app.endUndoGroup();}
    if(result){result.openInViewer();say(created.length+' composição(ões) duplicada(s).');}
  }
  function rename(){var co=context();if(!co)return;var prefixValue=prefix.text;if(!prefixValue||prefixValue.length>40){say('Prefixo invalido');return;}
    var done=0;app.beginUndoGroup('EdyTools - renomear');try{for(var i=0;i<co.selectedLayers.length;i++){var la=co.selectedLayers[i];
      if(!la.locked&&la.name.indexOf(prefixValue)!==0){la.name=prefixValue+la.name;done++;}}
    }finally{app.endUndoGroup();}say(done+' camada(s) renomeada(s).');
  }
  function stagger(){var co=context();if(!co)return;var dt=num(step.text,0,20);if(dt===null){say('Intervalo invalido');return;}
    var layers=[],selected=co.selectedLayers;
    for(var j=0;j<selected.length;j++)if(!selected[j].locked)layers.push(selected[j]);
    if(layers.length<2){say('Selecione duas camadas desbloqueadas.');return;}
    layers.sort(function(a,b){return a.index-b.index;});
    if(direction.selection&&direction.selection.index===1)layers.reverse();
    var start=layers[0].inPoint,done=0;
    app.beginUndoGroup('EdyTools - escalonar');
    try{for(var i=0;i<layers.length;i++){
      var la=layers[i],target=start+i*dt;
      if(target<co.duration){la.startTime+=target-la.inPoint;done++;}
    }
    }finally{app.endUndoGroup();}say(done+' escalonada(s); '+(layers.length-done)+' fora da composição.');
  }
  function makeMotionController(){var co=context();if(!co)return;
    if(co.selectedLayers.length!==1){say('Selecione uma unica camada');return;}
    var layer=co.selectedLayers[0];if(layer.locked||layer.threeDLayer||layer.nullLayer){say('Requer camada 2D desbloqueada');return;}
    var parent=layer.parent||null,created=null;
    app.beginUndoGroup('EdyTools - criar controlador nulo');try{
      created=co.layers.addNull();created.name='CTRL - '+layer.name;
      var piv=vcopy(propAt(layer.transform.position,co.time));
      created.transform.anchorPoint.setValue(piv);created.transform.position.setValue(piv);
      if(parent){if(typeof created.setParentWithJump==='function')created.setParentWithJump(parent);else created.parent=parent;}
      if(typeof layer.setParentWithJump!=='function')throw new Error('API para parentear sem salto indisponivel');layer.setParentWithJump(created);
      layer.selected=false;created.selected=true;say('Nulo criado: mova para deslocar animacao.');
    }catch(e){try{if(created&&layer.parent!==created)created.remove();}catch(er){}say('Falha ao criar controlador: '+e.message);}finally{app.endUndoGroup();}
  }
  // ---------------------------------------------------------- Curvas
  function currentCurveFields(strict){
    var f=[fieldOutInf,fieldOutVel,fieldInInf,fieldInVel],out=[];
    for(var i=0;i<4;i++){
      var max=(i%2===0)?90:20,min=(i%2===0)?0.1:0;
      var n=number(f[i].text,min,max);
      if(n===null){if(strict)say('Curva: influencia 0,1 a 90%; velocidade 0 a 20.');return null;}
      out.push(n);
    }
    return out;
  }
  function refreshCurve(){
    try{if(curveGraph&&curveGraph.notify)curveGraph.notify('onDraw');}catch(ignore){}
    try{if(curveGraph&&curveGraph.graphics&&curveGraph.graphics.invalidate)curveGraph.graphics.invalidate();}catch(ignore){}
  }
  function setCurve(vals,title){
    curveValues=vals.slice(0);
    fieldOutInf.text=String(vals[0]).replace('.',',');fieldOutVel.text=String(vals[1]).replace('.',',');
    fieldInInf.text=String(vals[2]).replace('.',',');fieldInVel.text=String(vals[3]).replace('.',',');
    refreshCurve();say('Curva: '+title+'. Clique em aplicar.');
  }
  function getKeyProps(){
    var co=app.project.activeItem;
    if(!(co instanceof CompItem)){say('Abra uma composicao.');return null;}
    var ps=co.selectedProperties||[];
    var found=[];
    for(var i=0;i<ps.length;i++){
      var p=ps[i];
      try{if(p.numKeys>0 && p.selectedKeys && p.selectedKeys.length && typeof p.setTemporalEaseAtKey==='function')found.push(p);}catch(ignore){}
    }
    if(!found.length){say('Selecione quadros-chave, nao apenas a camada.');return null;}
    return found;
  }
  function numericDifference(a,b,dim,spatial){
    if(typeof a==='number'&&typeof b==='number')return Math.abs(b-a);
    if(!(a instanceof Array)||!(b instanceof Array)||a.length!==b.length)return null;
    var j,sum=0;
    if(spatial){for(j=0;j<a.length;j++){
      if(typeof a[j]!=='number'||typeof b[j]!=='number')return null;
      sum+=Math.pow(b[j]-a[j],2);
    }return Math.sqrt(sum);}
    if(dim>=a.length||typeof a[dim]!=='number'||typeof b[dim]!=='number')return null;
    return Math.abs(b[dim]-a[dim]);
  }
  function speedOfSegment(p,i,j,dim,spatial){
    var dt=p.keyTime(j)-p.keyTime(i);
    if(!isFinite(dt)||dt<=0)return null;
    var diff=numericDifference(p.keyValue(i),p.keyValue(j),dim,spatial);
    return diff===null?null:diff/dt;
  }
  function easeFor(prop,key,which,arr,count){
    var target=[];var before=which==='in'?key-1:key,after=which==='in'?key:key+1;
    for(var d=0;d<count;d++){
      var avg=speedOfSegment(prop,before,after,d,count===1);
      if(avg===null)return null;
      var inf=which==='in'?arr[2]:arr[0],ratio=which==='in'?arr[3]:arr[1];
      target.push(new KeyframeEase(avg*ratio,inf));
    }
    return target;
  }
  function applyCurve(){
    var arr=currentCurveFields(true);if(!arr)return;
    var props=getKeyProps();if(!props)return;
    curveValues=arr;refreshCurve();
    var side=curveSide.selection?curveSide.selection.index:0;
    var changed=0,skipped=0,firstError='';
    app.beginUndoGroup('EdyTools - ajustar curvas');
    try{
      for(var i=0;i<props.length;i++){
        var p=props[i],keys=p.selectedKeys;
        for(var j=0;j<keys.length;j++){
          var k=keys[j];
          try{
            var roving=false;
            try{if(typeof p.keyRoving==='function')roving=!!p.keyRoving(k);}catch(ignoreRoving){}
            if(roving){skipped++;continue;}
            if(p.numKeys<2){skipped++;continue;}
            var oldIn=p.keyInTemporalEase(k),oldOut=p.keyOutTemporalEase(k);
            if(!oldIn||!oldOut||!oldIn.length||!oldOut.length){skipped++;continue;}
            var doIn=(side===0||side===1)&&k>1;
            var doOut=(side===0||side===2)&&k<p.numKeys;
            var newIn=doIn?easeFor(p,k,'in',arr,oldIn.length):oldIn;
            var newOut=doOut?easeFor(p,k,'out',arr,oldOut.length):oldOut;
            if((doIn&&!newIn)||(doOut&&!newOut)||(!doIn&&!doOut)){skipped++;continue;}
            // Preserva o tipo de interpolacao do lado nao alterado.
            var inType=p.keyInInterpolationType(k),outType=p.keyOutInterpolationType(k);
            var bez=(typeof KeyframeInterpolationType!=='undefined')?KeyframeInterpolationType.BEZIER:null;
            if(bez===null){skipped++;continue;}
            if(typeof p.setInterpolationTypeAtKey==='function'){
              p.setInterpolationTypeAtKey(k,doIn?bez:inType,doOut?bez:outType);
            }
            p.setTemporalEaseAtKey(k,newIn,newOut);
            changed++;
          }catch(err){skipped++;if(!firstError)firstError=String(err.message||err);}
        }
      }
    }finally{app.endUndoGroup();}
    say('Curvas: '+changed+' | Ignoradas: '+skipped+(firstError?' (ver dica)':''));
    if(firstError)status.helpTip=firstError;
  }
  function readCurve(){
    var props=getKeyProps();if(!props)return;
    for(var i=0;i<props.length;i++){
      var p=props[i],keys=p.selectedKeys;
      for(var j=0;j<keys.length;j++){
        var k=keys[j];
        try{
          if(j+1>=keys.length||keys[j+1]!==k+1)continue;
          var a=p.keyOutTemporalEase(k),b=p.keyInTemporalEase(k+1);
          if(!a||!b||!a.length||!b.length)continue;
          var vOut=speedOfSegment(p,k,k+1,0,a.length===1);
          var vIn=speedOfSegment(p,k,k+1,0,b.length===1);
          if(vOut===null||vIn===null)continue;
          setCurve([a[0].influence,vOut>0?a[0].speed/vOut:0,b[0].influence,vIn>0?b[0].speed/vIn:0],'lida dos quadros');
          return;
        }catch(ignore){}
      }
    }
    say('Selecione dois quadros-chave consecutivos.');
  }
  function refreshPersonalList(){
    try{
      curveSelect.removeAll();curveSelect.add('item','CURVAS SALVAS');
      for(var i=0;i<personalCurves.length;i++)curveSelect.add('item',personalCurves[i].name);
      curveSelect.selection=0;
    }catch(ignore){}
  }
  function loadCurves(){
    try{
      if(app.settings.haveSetting('EdyTools','curves')){
        var obj=JSON.parse(app.settings.getSetting('EdyTools','curves'));
        if(obj instanceof Array){for(var i=0;i<obj.length&&i<20;i++){
          if(obj[i]&&typeof obj[i].name==='string'&&obj[i].values&&obj[i].values.length===4)
            personalCurves.push({name:obj[i].name,values:obj[i].values});
        }}
      }
    }catch(ignore){}
    refreshPersonalList();
  }
  function persistCurves(){
    try{app.settings.saveSetting('EdyTools','curves',JSON.stringify(personalCurves));return true;}
    catch(err){say('Nao foi possivel salvar: '+err.message);return false;}
  }
  function saveCurve(){
    var arr=currentCurveFields(true);if(!arr)return;
    var name=String(curveName.text).replace(/^\s+|\s+$/g,'').substring(0,26);
    if(!name){say('Digite um nome para a curva.');return;}
    for(var i=0;i<personalCurves.length;i++)if(personalCurves[i].name===name){personalCurves[i].values=arr;persistCurves();refreshPersonalList();say('Curva atualizada: '+name);return;}
    if(personalCurves.length>=20){say('Limite de 20 curvas pessoais.');return;}
    personalCurves.push({name:name,values:arr});persistCurves();refreshPersonalList();say('Curva salva: '+name);
  }
  function deleteCurve(){
    var idx=curveSelect.selection?curveSelect.selection.index:0;
    if(idx<=0||idx>personalCurves.length){say('Escolha uma curva salva para excluir.');return;}
    var name=personalCurves[idx-1].name;
    personalCurves.splice(idx-1,1);persistCurves();refreshPersonalList();say('Excluida: '+name);
  }


  fillList(objState);fillList(textState);loadCurves();theme();layout();
  ui.onResize=ui.onResizing=layout;
  globalThis.EdyToolsTick=function(){theme();selection();if(dirty||(tab===0&&!paused)){canvas.notify('onDraw');dirty=false;}};
  var task=app.scheduleTask('globalThis.EdyToolsTick()',80,true);
  ui.onClose=function(){app.cancelTask(task);};
  if(ui instanceof Window)ui.show();else ui.layout.layout(true);
  layout();
})(this);
