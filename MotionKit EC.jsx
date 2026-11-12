/* MotionKit EC 0.8.1-beta — by Edy Bastos, 11/2026
 * Painel ScriptUI original para EffectCraft. Licenca MIT.
 * Interface com abas nativas, controles compativeis com temas claro/escuro.
 * Presets: animacoes genericas originais; sem codigo de terceiros.
 */
(function(thisObj){
  var ui=thisObj instanceof Panel ? thisObj : new Window('palette','MotionKit EC 0.8.1',undefined,{resizeable:true});
  // v0.8.1: avoid nested ScriptUI tabbedpanels. They overlap in narrow EffectCraft docked panels.
  // Use a two-level button navigation + one stack of mutually exclusive content pages.
  ui.orientation='column'; ui.alignChildren=['fill','top']; ui.spacing=6; ui.margins=10;
  ui.minimumSize=[390,650]; ui.preferredSize=[404,665];
  var orange=[.96,.43,.08,1],faint=[.60,.57,.54,1];
  var line=ui.add('group');line.orientation='row';line.alignment=['fill','top'];line.spacing=12;
  line.alignChildren=['left','center'];line.preferredSize.height=27;
  var header=line.add('statictext',undefined,'MOTIONKIT EC');header.preferredSize=[161,24];
  try{header.graphics.font=ScriptUI.newFont('Segoe UI','BOLD',12);header.graphics.foregroundColor=header.graphics.newPen(header.graphics.PenType.SOLID_COLOR,orange,1);}catch(e){}
  var version=line.add('statictext',undefined,'v0.8.1 beta');version.preferredSize=[101,21];
  // Main navigation: fixed height and width, independent of the contents.
  var topNav=ui.add('group',undefined,undefined,{name:'mk_main_navigation'});
  topNav.orientation='row';topNav.alignment=['fill','top'];topNav.alignChildren=['fill','center'];topNav.spacing=4;topNav.margins=0;
  topNav.preferredSize.height=34;topNav.minimumSize.height=34;
  var mainNames=['Âncora','Animações','Curvas','Camadas'],mainWidths=[81,103,68,85],mainButtons=[];
  for(var ni=0;ni<mainNames.length;ni++){
    var nb=topNav.add('button',undefined,mainNames[ni],{name:'mk_main_'+ni});
    nb.preferredSize=[mainWidths[ni],30];nb.minimumSize=[mainWidths[ni],30];nb.helpTip='Abrir '+mainNames[ni];mainButtons.push(nb);
  }
  // Subtabs are separate controls, NOT nested tabbedpanels.
  var subNav=ui.add('group',undefined,undefined,{name:'mk_sub_navigation'});
  subNav.orientation='row';subNav.alignment=['fill','top'];subNav.alignChildren=['left','center'];subNav.spacing=5;subNav.margins=0;
  subNav.preferredSize.height=33;subNav.minimumSize.height=33;
  var subButtons=[];
  for(var si=0;si<2;si++){
    var sb=subNav.add('button',undefined,'',{name:'mk_sub_'+si});
    sb.preferredSize=[132,29];sb.minimumSize=[102,29];subButtons.push(sb);
  }
  var sectionCaption=ui.add('statictext',undefined,'ANIMACOES  /  OBJETOS',{name:'mk_section_caption'});
  sectionCaption.alignment=['fill','top'];sectionCaption.preferredSize.height=19;
  try{sectionCaption.graphics.font=ScriptUI.newFont('Segoe UI','BOLD',10);sectionCaption.graphics.foregroundColor=sectionCaption.graphics.newPen(sectionCaption.graphics.PenType.SOLID_COLOR,orange,1);}catch(ignore){}
  // Pages all share a single, explicit content rectangle, so rows cannot overlap.
  var stage=ui.add('group',undefined,undefined,{name:'mk_content_stage'});
  stage.orientation='stack';stage.alignChildren=['fill','top'];stage.alignment=['fill','fill'];
  stage.margins=0;stage.spacing=0;stage.preferredSize=[364,438];stage.minimumSize=[334,418];
  function page(name){
    var p=stage.add('group',undefined,undefined,{name:name});
    p.orientation='column';p.alignChildren=['fill','top'];p.spacing=7;p.margins=4;
    p.alignment=['fill','fill'];p.visible=false;
    return p;
  }
  var aAnchor=page('mk_page_ancora'),aAlign=page('mk_page_alinhar');
  var aObjects=page('mk_page_objetos'),aTexts=page('mk_page_textos');
  var tCurves=page('mk_page_curvas'),aOrganize=page('mk_page_organizar'),aMover=page('mk_page_mover');
  var mainSections=[
    {name:'ANCORA',subs:[{label:'Ponto',page:aAnchor},{label:'Alinhar',page:aAlign}]},
    {name:'ANIMACOES',subs:[{label:'Objetos',page:aObjects},{label:'Textos',page:aTexts}]},
    {name:'CURVAS',subs:[{label:'Curvas',page:tCurves}]},
    {name:'CAMADAS',subs:[{label:'Organizar',page:aOrganize},{label:'Mover',page:aMover}]}
  ];
  var allPages=[aAnchor,aAlign,aObjects,aTexts,tCurves,aOrganize,aMover];
  function repaintLayout(){try{stage.layout.layout(true);ui.layout.layout(true);}catch(ignore){}}
  function selectSub(mainIndex,subIndex){
    var sec=mainSections[mainIndex],sub=sec.subs[subIndex]||sec.subs[0];
    for(var i=0;i<allPages.length;i++)allPages[i].visible=(allPages[i]===sub.page);
    sectionCaption.text=sec.name+'  /  '+String(sub.label).toUpperCase();
    for(var k=0;k<subButtons.length;k++){
      if(k<sec.subs.length){
        subButtons[k].visible=true;subButtons[k].enabled=true;
        subButtons[k].text=(k===subIndex?'• ':'')+sec.subs[k].label;
      }else{subButtons[k].visible=false;subButtons[k].enabled=false;}
    }
    repaintLayout();
  }
  function selectMain(mainIndex,subIndex){
    var sec=mainSections[mainIndex];
    for(var k=0;k<mainButtons.length;k++)mainButtons[k].text=mainNames[k];
    for(var j=0;j<subButtons.length;j++)(function(i){subButtons[i].onClick=function(){selectSub(mainIndex,i);};})(j);
    selectSub(mainIndex,subIndex||0);
  }
  for(var mn=0;mn<mainButtons.length;mn++)(function(i){mainButtons[i].onClick=function(){selectMain(i,0);};})(mn);
  function grp(parent,center){var x=parent.add('group');x.orientation='row';x.spacing=5;x.alignment=center?['center','top']:['fill','top'];x.alignChildren=['left','center'];return x;}
  function info(parent,txt){var x=parent.add('statictext',undefined,txt);x.alignment=['fill','top'];x.preferredSize.height=19;return x;}
  function accentText(parent,txt){var x=info(parent,txt);try{x.graphics.foregroundColor=x.graphics.newPen(x.graphics.PenType.SOLID_COLOR,orange,1);x.graphics.font=ScriptUI.newFont('Segoe UI','BOLD',11);}catch(e){}return x;}
  function input(parent,val,width,tip){var x=parent.add('edittext',undefined,val);x.preferredSize=[width||68,25];x.helpTip=tip||'';return x;}
  function choice(parent,items,tip){var x=parent.add('dropdownlist',undefined,items);x.selection=0;x.alignment=['fill','top'];x.preferredSize.height=26;x.helpTip=tip||'';return x;}
  function btn(parent,label,fn,tip){var x=parent.add('button',undefined,label);x.onClick=fn;x.helpTip=tip||label;x.alignment=['fill','top'];x.preferredSize.height=29;return x;}
  var status=ui.add('statictext',undefined,'Pronto - selecione uma camada.');status.alignment=['fill','bottom'];status.preferredSize.height=20;
  var credit=ui.add('statictext',undefined,'by Edy Bastos');credit.alignment=['center','bottom'];credit.preferredSize=[120,15];
  try{credit.graphics.foregroundColor=credit.graphics.newPen(credit.graphics.PenType.SOLID_COLOR,[.65,.65,.65,.10],1);}catch(e){}
  function say(s){s=String(s||'');status.text=s.length>52?s.slice(0,49)+'...':s;status.helpTip=s;}
  function context(){var co=app.project.activeItem;
    if(!(co instanceof CompItem)){say('Abra uma composicao primeiro.');return null;}
    if(!co.selectedLayers||!co.selectedLayers.length){say('Selecione uma ou mais camadas.');return null;}
    return co;}
  function num(s,min,max){var n=Number(String(s).replace(',','.'));return isFinite(n)&&n>=min&&n<=max?n:null;}
  function number(s,min,max){return num(s,min,max);}
  function vcopy(x){var a=[];for(var i=0;i<x.length;i++)a.push(x[i]);return a;}
  function propAt(p,t){try{if(p.valueAtTime)return p.valueAtTime(t,false);}catch(e){}return p.value;}
  function shapePen(g,color,width){return g.newPen(g.PenType.SOLID_COLOR,color,width);}
  function shapePath(g,p,pts){g.newPath();g.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.strokePath(p);}
  function shapeLine(g,p,x,y,xx,yy){shapePath(g,p,[[x,y],[xx,yy]]);}
  function shapeCircle(g,p,x,y,r){g.newPath();g.ellipsePath(x-r,y-r,2*r,2*r);g.strokePath(p);}
  function anchorButton(parent,id,tip,fn){var b=parent.add('button',undefined,'',{name:'mk_anchor_'+id});b.preferredSize=[45,38];b.minimumSize=[45,38];b.helpTip=tip;b.onClick=fn;
    b.onDraw=function(){try{var g=this.graphics;if(typeof g.drawOSControl==='function'){try{g.drawOSControl();}catch(osErr){}}var weak=shapePen(g,faint,1.2),strong=shapePen(g,orange,2.1);g.newPath();g.rectPath(8,8,24,22);g.strokePath(weak);
      if(id>=0&&id<=8){for(var i=0;i<9;i++){var x=8+12*(i%3),y=8+11*Math.floor(i/3);shapeCircle(g,i===id?strong:weak,x,y,i===id?3.4:1.1);}}
      else{shapeLine(g,strong,20,4,20,34);shapeLine(g,strong,4,19,36,19);shapeCircle(g,strong,20,19,3);}
    }catch(err){}};return b;}
  // ANCORA: somente icones nas nove posicoes. Alinhamento usa texto legivel.
  accentText(aAnchor,'Ponto de ancora');info(aAnchor,'Clique na posicao desejada:');
  var anchorTypes=['topLeft','top','topRight','left','center','right','bottomLeft','bottom','bottomRight'];
  var anchorTips=['Superior esquerdo','Superior','Superior direito','Esquerda','Centro','Direita','Inferior esquerdo','Inferior','Inferior direito'];
  for(var ay=0;ay<3;ay++){var ar=grp(aAnchor,true);for(var ax=0;ax<3;ax++)(function(i){anchorButton(ar,i,anchorTips[i],function(){setAnchor(anchorTypes[i]);});})(ay*3+ax);}
  info(aAnchor,'Centralizacao rapida na composicao');
  var ac=grp(aAnchor,true);anchorButton(ac,9,'Centralizar camada visualmente na composicao',function(){alignLayers('centerBoth');});
  accentText(aAlign,'Alinhamento na composicao');
  info(aAlign,'Alinha pelas bordas visiveis da camada.');
  for(var y=0;y<3;y++){var lineA=grp(aAlign);for(var x=0;x<3;x++)(function(ix,iy){
    var names=[['Topo esq.','Topo','Topo dir.'],['Meio esq.','Centro','Meio dir.'],['Base esq.','Base','Base dir.']];
    var b=btn(lineA,names[iy][ix],function(){alignLayers('grid'+iy+ix);});b.preferredSize=[99,29];
  })(x,y);}
  info(aAlign,'Camadas animadas sao preservadas.');
  // Animacoes: duas subabas, mesmo fluxo de categoria, pesquisa, modo, duracao e aplicar.
  function animPanel(parent,isText){
    info(parent,isText?'Escolha um preset para o texto:':'Escolha um preset para o objeto:');
    var cat=choice(parent,['Todas','Movimento','Esmaecer','Pop-up','Torcao','Bounce','Destaques'],'Filtrar a familia');
    var search=input(parent,'',288,'Digite o nome ou uma palavra parecida');search.alignment=['fill','top'];search.preferredSize.height=26;
    var list=parent.add('listbox',undefined,[],{name:isText?'mk_text_presets':'mk_object_presets'});list.alignment=['fill','top'];list.preferredSize.height=138;
    var descriptor=info(parent,'Selecione um preset.');
    var modeRow=grp(parent);var radios=[];
    var modeNames=['Entrada','Saida','Ambos'];
    for(var i=0;i<3;i++)(function(idx){var r=modeRow.add('radiobutton',undefined,modeNames[idx]);r.helpTip='Aplicar: '+modeNames[idx];r.preferredSize.width=91;radios.push(r);})(i);
    radios[0].value=true;
    var controls=grp(parent);controls.add('statictext',undefined,'Tempo (s)');var dur=input(controls,'0,65',56,'Duracao da animacao');
    controls.add('statictext',undefined,'Forca');var strength=input(controls,'100',48,'Forca em porcentagem');
    var apply=btn(parent,isText?'Aplicar no texto':'Aplicar no objeto',function(){applySelected(state);},'Aplicar o preset nas camadas selecionadas');
    var state={text:isText,cat:cat,search:search,list:list,desc:descriptor,radios:radios,dur:dur,strength:strength,apply:apply,visible:[]};
    search.onChanging=function(){fillList(state);};search.onChange=function(){fillList(state);};cat.onChange=function(){fillList(state);};
    list.onChange=function(){describe(state);};
    for(var k=0;k<radios.length;k++)(function(idx){radios[idx].onClick=function(){for(var j=0;j<radios.length;j++)radios[j].value=(j===idx);};})(k);
    return state;
  }
  var objState=animPanel(aObjects,false),textState=animPanel(aTexts,true);
  // CURVAS: preserve controle dedicado de curvas personalizaveis.
  accentText(tCurves,'Curvas de movimento');
  var curvePresets=[
    {name:'Linear',values:[33.33,1,33.33,1]},
    {name:'Saida suave',values:[65,0,33,1]},
    {name:'Entrada suave',values:[33,1,65,0]},
    {name:'Suave nos dois lados',values:[50,0,50,0]},
    {name:'Cinematica',values:[75,0,75,0]},
    {name:'Agil',values:[60,0,20,2.2]}
  ];
  var curveValues=[50,0,50,0];
  var curveChoice=choice(tCurves,['Linear','Saida suave','Entrada suave','Suave nos dois lados','Cinematica','Agil'],'Escolher curva');curveChoice.selection=3;
  btn(tCurves,'Carregar curva',function(){var c=curvePresets[curveChoice.selection?curveChoice.selection.index:3];setCurve(c.values,c.name);});
  var graphRow=grp(tCurves,true);var curveGraph=graphRow.add('panel',undefined,'');curveGraph.preferredSize=[198,78];
  curveGraph.onDraw=function(){try{var g=this.graphics,grey=shapePen(g,faint,1),or=shapePen(g,orange,2),x=10,y=8,w=174,h=55;
    shapeLine(g,grey,x,y,x,y+h);shapeLine(g,grey,x,y+h,x+w,y+h);
    var v=(fieldOutInf&&fieldOutVel&&fieldInInf&&fieldInVel)?(currentCurveFields(false)||curveValues):curveValues;
    var x1=v[0]/100,y1=x1*v[1],x2=1-v[2]/100,y2=1-(1-x2)*v[3],pts=[];
    for(var i=0;i<=32;i++){var t=i/32,q=1-t,px=3*q*q*t*x1+3*q*t*t*x2+t*t*t,py=3*q*q*t*y1+3*q*t*t*y2+t*t*t;pts.push([x+w*px,y+h*(1-py)]);}
    shapePath(g,or,pts);
  }catch(e){}};
  var rowOut=grp(tCurves);rowOut.add('statictext',undefined,'Saida');var fieldOutInf=input(rowOut,'50',69,'Influencia saida'),fieldOutVel=input(rowOut,'0',69,'Velocidade saida');
  var rowIn=grp(tCurves);rowIn.add('statictext',undefined,'Entrada');var fieldInInf=input(rowIn,'50',69,'Influencia entrada'),fieldInVel=input(rowIn,'0',69,'Velocidade entrada');
  info(tCurves,'Influencias / velocidades');
  var curveSide=choice(tCurves,['Ambos','Entrada','Saida']);
  var curveRow=grp(tCurves);btn(curveRow,'Aplicar',applyCurve);btn(curveRow,'Ler chaves',readCurve);
  var curveName=input(tCurves,'Minha curva',220,'Nome da curva');
  var curveSelect=choice(tCurves,['CURVAS SALVAS']);
  var personalCurves=[];
  curveSelect.onChange=function(){var i=curveSelect.selection?curveSelect.selection.index:0;if(i>0&&i<=personalCurves.length)setCurve(personalCurves[i-1].values,personalCurves[i-1].name);};
  var curveRow2=grp(tCurves);btn(curveRow2,'Salvar',saveCurve);btn(curveRow2,'Excluir',deleteCurve);
  for(var ci=0;ci<4;ci++)(function(f){f.onChanging=refreshCurve;})([fieldOutInf,fieldOutVel,fieldInInf,fieldInVel][ci]);
  // CAMADAS: org e movimento em subabas nativas, sem dropdown de navegacao.
  accentText(aOrganize,'Organizar camadas');info(aOrganize,'Renomear camadas selecionadas');
  var renRow=grp(aOrganize),prefix=input(renRow,'VIDEO_',130,'Prefixo para renomeacao');btn(renRow,'Renomear',rename);
  info(aOrganize,'Distribuir inicio das camadas');var stRow=grp(aOrganize),step=input(stRow,'0,12',125,'Intervalo em segundos');btn(stRow,'Escalonar',stagger);
  accentText(aMover,'Mover sem alterar keyframes');info(aMover,'Cria um nulo de controle para a camada.');
  btn(aMover,'Criar controlador nulo',makeMotionController,'Cria controlador, mantendo a animacao original');
  info(aMover,'Depois mova o nulo na composicao.');
  // DADOS: presets proprios, criados para o MotionKit EC.
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
  function chosen(st){var i=st.list.selection?st.list.selection.index:-1;return i>=0&&i<st.visible.length?mkPresets[st.visible[i]]:null;}
  function fillList(st){var type=st.cat.selection?st.cat.selection.text:'Todas',terms=st.search.text,items=[];
    for(var i=0;i<mkPresets.length;i++){var p=mkPresets[i];if(type!=='Todas'&&type!==p.category)continue;
      var s=score(terms,p);if(s<99)items.push({idx:i,score:s});}
    items.sort(function(a,b){return a.score-b.score||a.idx-b.idx;});
    st.list.removeAll();st.visible=[];
    for(var j=0;j<items.length;j++){var p2=mkPresets[items[j].idx];st.visible.push(items[j].idx);st.list.add('item',p2.name);}
    if(st.visible.length)st.list.selection=0;
    describe(st);
  }
  function describe(st){var p=chosen(st),hi=p&&p.kind==='highlight';
    st.desc.text=p?(p.desc.length>43?p.desc.slice(0,40)+'...':p.desc):'Nenhum resultado.';
    st.desc.helpTip=p?p.desc:'Digite outra palavra.';
    for(var i=0;i<st.radios.length;i++)st.radios[i].enabled=!hi;
    st.apply.text=hi?'Aplicar destaque':(st.text?'Aplicar no texto':'Aplicar no objeto');
  }
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
  function plans(layer,p,mode,co,dur){var out=[],eps=(co.frameDuration||1/30)*.2;
    if(layer.locked)return {error:'Camada bloqueada'};
    if(layer.threeDLayer)return {error:'Suporte apenas 2D'};
    var seq=[];
    if(p.kind==='highlight')seq.push({begin:co.time,frames:p.frames});
    else{
      if(mode===0||mode===2)seq.push({begin:layer.inPoint,frames:p.enter});
      if(mode===1||mode===2)seq.push({begin:layer.outPoint-dur,frames:p.exit});
    }
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
    var done=0,skips=[],items=co.selectedLayers,mode=chosenMode(st);
    // Pre-valida todas as camadas; nenhuma sobrescrita silenciosa.
    var queue=[];for(var i=0;i<items.length;i++){var plan=plans(items[i],p,mode,co,dur);
      if(plan.error)skips.push(items[i].name+': '+plan.error);else queue.push(plan.jobs);
    }
    if(!queue.length){say('Nao aplicado: '+(skips.length?skips[0]:'Nenhuma camada valida'));return;}
    app.beginUndoGroup('MotionKit - '+p.name);
    try{for(var a=0;a<queue.length;a++)try{for(var k=0;k<queue[a].length;k++)writeFrames(queue[a][k],force,co);done++;}catch(ex){skips.push('Erro: '+ex.message);}}
    finally{app.endUndoGroup();}
    say(done+' camada(s) animada(s). '+(skips.length?skips.length+' ignorada(s): '+skips[0]:''));
  }
  function textGroup(layer){try{var t=layer.property('ADBE Text Properties');if(!t)return null;return t.property('ADBE Text Animators');}catch(e){return null;}}
  function findP(x,keys){for(var i=0;i<keys.length;i++){try{var p=x.property(keys[i]);if(p)return p;}catch(e){}}
    return null;}
  function setTextEffect(animator,p,force,dir){var props=findP(animator,['ADBE Text Animator Properties']);if(!props)throw new Error('Propriedades de texto indisponiveis');
    var fs=dir==='out'?p.exit:p.enter,f=dir==='out'?fs[fs.length-1]:fs[0],ch=channelsOf(fs),any=0;
    for(var i=0;i<ch.length;i++){
      var name=ch[i],match=name==='position'?'ADBE Text Position':name==='opacity'?'ADBE Text Opacity':name==='scale'?'ADBE Text Scale':'ADBE Text Rotation';
      var v=name==='position'?[f.x*55*force,f.y*55*force]:name==='opacity'?0:name==='scale'?[100*(1+(f.s-1)*force),100*(1+(f.s-1)*force)]:f.r*force;
      try{var pr=props.addProperty(match);if(pr){pr.setValue(v);any++;}}catch(e){throw new Error('Animador nao aceita '+name+': '+e.message);}
    }
    if(!any){var opa=props.addProperty('ADBE Text Opacity');opa.setValue(0);}
  }
  function setTextKeys(selector,begin,dur,direction,layerStart){var start=findP(selector,['start','ADBE Text Percent Start']);if(!start)throw new Error('Seletor Inicio nao encontrado');
    if(direction==='in'){start.setValueAtTime(begin,0);start.setValueAtTime(begin+dur,100);}
    else{start.setValueAtTime(layerStart,100);start.setValueAtTime(begin,100);start.setValueAtTime(begin+dur,0);}
  }
  function textHighlight(animator,p,begin,dur,force){var props=findP(animator,['ADBE Text Animator Properties']);if(!props)throw new Error('Animador incompleto');
    // Destaques sao aplicados a letras por animador de escala/posicao, sem alterar Transform da camada.
    var sc=props.addProperty('ADBE Text Scale'),ps=props.addProperty('ADBE Text Position');
    if(!sc||!ps)throw new Error('Escala/Posicao de texto indisponivel');
    for(var j=0;j<p.frames.length;j++){var f=p.frames[j],t=begin+f.t*dur;sc.setValueAtTime(t,[100*(1+(f.s-1)*force),100*(1+(f.s-1)*force)]);
      ps.setValueAtTime(t,[f.x*36*force,f.y*36*force]);}
  }
  function applyText(st,p,dur,force){var co=context();if(!co)return;
    var selected=co.selectedLayers,mode=chosenMode(st),good=0,skips=[];
    var queue=[];for(var i=0;i<selected.length;i++){
      var layer=selected[i],g=textGroup(layer),segments=[];
      if(layer.locked||!g){skips.push(layer.name+': selecione uma camada de texto desbloqueada');continue;}
      if(p.kind==='highlight')segments.push({begin:co.time,dir:'hl'});
      else{
        if(mode===0||mode===2)segments.push({begin:layer.inPoint,dir:'in'});
        if(mode===1||mode===2)segments.push({begin:layer.outPoint-dur,dir:'out'});
      }
      var bad='';for(var j=0;j<segments.length;j++)if(segments[j].begin<layer.inPoint||segments[j].begin+dur>layer.outPoint+0.0001)bad='Duracao fora do intervalo da camada';
      if(segments.length===2&&segments[0].begin+dur>=segments[1].begin-0.001)bad='Entrada/saida se sobrepoem';
      if(bad)skips.push(layer.name+': '+bad);else queue.push({layer:layer,g:g,segments:segments});
    }
    if(!queue.length){say('Texto nao animado: '+(skips[0]||'sem camadas'));return;}
    app.beginUndoGroup('MotionKit - texto - '+p.name);
    try{for(var k=0;k<queue.length;k++)try{
      var q=queue[k];for(var z=0;z<q.segments.length;z++){
        var s=q.segments[z],anim=q.g.addProperty('ADBE Text Animator');
        if(!anim)throw new Error('Criacao do animador falhou');anim.name='MK '+p.name+' '+s.dir;
        if(s.dir==='hl')textHighlight(anim,p,s.begin,dur,force);
        else{
          setTextEffect(anim,p,force,s.dir);
          var selectors=findP(anim,['ADBE Text Selectors']);
          if(!selectors)throw new Error('Seletores de texto indisponiveis');
          // EffectCraft ja cria um selector padrao: nunca adicionar outro.
          var selector=findP(selectors,[1]);if(!selector)selector=selectors.addProperty('ADBE Text Selector');
          setTextKeys(selector,s.begin,dur,s.dir,q.layer.inPoint);
        }
      }good++;
      }catch(err){skips.push('Falha na camada de texto: '+err.message);}
    }finally{app.endUndoGroup();}
    say(good+' texto(s) animado(s). '+(skips.length?skips[0]:''));
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
    var done=0,skip=[];app.beginUndoGroup('MotionKit - alinhar camadas');try{
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
  function rename(){var co=context();if(!co)return;var prefixValue=prefix.text;if(!prefixValue||prefixValue.length>40){say('Prefixo invalido');return;}
    var done=0;app.beginUndoGroup('MotionKit - renomear');try{for(var i=0;i<co.selectedLayers.length;i++){var la=co.selectedLayers[i];
      if(!la.locked&&la.name.indexOf(prefixValue)!==0){la.name=prefixValue+la.name;done++;}}
    }finally{app.endUndoGroup();}say(done+' camada(s) renomeada(s).');
  }
  function stagger(){var co=context();if(!co)return;var dt=num(step.text,0,20);if(dt===null){say('Intervalo invalido');return;}
    var done=0;app.beginUndoGroup('MotionKit - escalonar');try{for(var i=0;i<co.selectedLayers.length;i++){
      var la=co.selectedLayers[i];if(!la.locked){la.startTime=la.startTime+i*dt;done++;}}
    }finally{app.endUndoGroup();}say(done+' camada(s) escalonada(s).');
  }
  function makeMotionController(){var co=context();if(!co)return;
    if(co.selectedLayers.length!==1){say('Selecione uma unica camada');return;}
    var layer=co.selectedLayers[0];if(layer.locked||layer.threeDLayer||layer.nullLayer){say('Requer camada 2D desbloqueada');return;}
    var parent=layer.parent||null,created=null;
    app.beginUndoGroup('MotionKit - criar controlador nulo');try{
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
    app.beginUndoGroup('MotionKit EC - ajustar curvas');
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
          if(k<=1||k>=p.numKeys)continue;
          var a=p.keyOutTemporalEase(k),b=p.keyInTemporalEase(k);
          // Lemos os dois lados do mesmo quadro-chave (ambos precisam existir).
          if(!a||!b||!a.length||!b.length)continue;
          var vOut=speedOfSegment(p,k,k+1,0,a.length===1);
          var vIn=speedOfSegment(p,k-1,k,0,b.length===1);
          if(vOut===null||vIn===null)continue;
          setCurve([a[0].influence,vOut>0?a[0].speed/vOut:0,b[0].influence,vIn>0?b[0].speed/vIn:0],'lida dos quadros');
          return;
        }catch(ignore){}
      }
    }
    say('Para ler, selecione uma chave entre duas outras.');
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
      if(app.settings.haveSetting('MotionKit EC','curves')){
        var obj=JSON.parse(app.settings.getSetting('MotionKit EC','curves'));
        if(obj instanceof Array){for(var i=0;i<obj.length&&i<20;i++){
          if(obj[i]&&typeof obj[i].name==='string'&&obj[i].values&&obj[i].values.length===4)
            personalCurves.push({name:obj[i].name,values:obj[i].values});
        }}
      }
    }catch(ignore){}
    refreshPersonalList();
  }
  function persistCurves(){
    try{app.settings.saveSetting('MotionKit EC','curves',JSON.stringify(personalCurves));return true;}
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

  fillList(objState);fillList(textState);loadCurves();selectMain(1,0);
  ui.onResize=ui.onResizing=function(){try{this.layout.resize();}catch(ignore){}};
  if(ui instanceof Window)ui.show();else ui.layout.layout(true);
})(this);