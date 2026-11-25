/* EdyMotion workspace: browse / edit / create / personal library / tools. */
var emPage=0,emTool=0,emLibraryMode=0,emFavoriteOnly=false,emFavorites=[],emSaved=[];
function emLoadSetting(key,fallback){try{return JSON.parse(app.settings.getSetting('EdyMotion',key));}catch(e){return fallback;}}
function emPersist(key,data){app.settings.saveSetting('EdyMotion',key,JSON.stringify(data));}
emFavorites=emLoadSetting('favorites',[]);emSaved=emLoadSetting('recipes',[]);
if(!(emFavorites instanceof Array))emFavorites=[];if(!(emSaved instanceof Array))emSaved=[];
var emEditDuration=ui.add('edittext',undefined,'1',{name:'em_edit_duration'});
var emTitle=ui.add('edittext',undefined,'Sua mensagem',{name:'em_title'});
var emSubtitle=ui.add('edittext',undefined,'Seu detalhe aqui',{name:'em_subtitle'});
var emTemplateDuration=ui.add('edittext',undefined,'4',{name:'em_template_duration'});
var emTemplateColor=ui.add('edittext',undefined,'FF6614',{name:'em_template_color'});
var emTemplate=ui.add('dropdownlist',undefined,['Título','Lower third','Oferta','Callout','Lista','Fundo'],{name:'em_template'});emTemplate.selection=0;
var emLibrary=ui.add('listbox',undefined,[],{name:'em_library'});
var emShift=ui.add('edittext',undefined,'0,1',{name:'em_shift'});
var emExtraFields=[emEditDuration,emTitle,emSubtitle,emTemplateDuration,emTemplateColor,emTemplate,emLibrary,emShift];
function emPresetKey(p){return p.category+'/'+p.name;}
var emFillOriginal=fillList;
fillList=function(st){emFillOriginal(st);if(emFavoriteOnly){var list=[];for(var i=0;i<st.visible.length;i++)if(emFavorites.indexOf(emPresetKey(mkPresets[st.visible[i]]))>=0)list.push(st.visible[i]);st.visible=list;st.selected=0;st.offset=0;}};
function emToggleFavorite(){var p=chosen(current());if(!p){say('Escolha uma animação.');return;}var key=emPresetKey(p),i=emFavorites.indexOf(key);if(i>=0)emFavorites.splice(i,1);else emFavorites.push(key);emPersist('favorites',emFavorites);fillList(current());dirty=true;}
function emSaveRecipe(){var st=current(),p=chosen(st);if(!p)return;var name=prompt('Nome do seu preset',p.name);if(name===null||!String(name).replace(/\s/g,''))return;if(emSaved.length>=100){say('Limite de 100 presets pessoais.');return;}emSaved.push({name:String(name).slice(0,60),preset:emPresetKey(p),text:textMode,section:st.section,duration:duration.text,strength:strength.text,direction:st.directionIndex});emPersist('recipes',emSaved);say('Preset salvo na sua biblioteca.');}
function emRefreshLibrary(){emLibrary.removeAll();var list=emLibraryMode?emMediaList():emSaved;for(var i=0;i<list.length;i++)emLibrary.add('item',list[i].name||list[i].path);if(list.length)emLibrary.selection=0;dirty=true;}
function emUseLibrary(){var i=emLibrary.selection?emLibrary.selection.index:-1;if(i<0){say('Selecione um item da biblioteca.');return;}if(emLibraryMode){emMediaImport(i);return;}var recipe=emSaved[i];emFavoriteOnly=false;emNavigate(0);animateMode(recipe.text?1:0);setSection(current(),recipe.section);duration.text=recipe.duration;strength.text=recipe.strength;current().directionIndex=recipe.direction;var st=current();for(var j=0;j<st.visible.length;j++)if(emPresetKey(mkPresets[st.visible[j]])===recipe.preset){st.selected=j;st.offset=Math.floor(j/6)*6;break;}layout();say('Preset carregado. Selecione a camada e aplique.');}
function emNavigate(page,tool){emPage=page;emTool=tool||0;projectMode=emPage===4&&emTool===4;tab=emPage===0?0:emPage===4&&emTool>0&&emTool<5?(emTool===4?3:emTool):-1;previewUntil=0;if(page===3)emRefreshLibrary();layout();if(page===2){message=app.project.activeItem instanceof CompItem?"Edite os campos e crie seu elemento.":"Abra uma composição para criar.";messageKind="hint";}if(page===3){message="Seus presets e arquivos de mídia.";messageKind="hint";}dirty=true;}
var emOldLayout=layout;
layout=function(){emOldLayout();var w=Math.max(280,(ui.size.width||332)-12),legacy=emPage===4&&emTool>0&&emTool<4;canvas.bounds=[0,0,w,Math.max(legacy?720:560,(ui.size.height||600)-12)];
  for(var i=0;i<emExtraFields.length;i++)emExtraFields[i].visible=false;
  if(emPage!==0)search.visible=duration.visible=strength.visible=category.visible=countStart.visible=countEnd.visible=countDuration.visible=false;
  if(emPage===0&&!countMode)category.bounds=[16,170,w-94,194];
  emEditDuration.visible=emPage===1;emEditDuration.bounds=[16,240,w-16,274];
  emTemplate.visible=emTitle.visible=emSubtitle.visible=emTemplateDuration.visible=emTemplateColor.visible=emPage===2;
  emTemplate.bounds=[16,108,w-16,140];emTitle.bounds=[16,174,w-16,208];emSubtitle.bounds=[16,242,w-16,276];emTemplateDuration.bounds=[16,310,w/2-4,344];emTemplateColor.bounds=[w/2+4,310,w-16,344];
  emLibrary.visible=emPage===3;emLibrary.bounds=[16,150,w-16,350];emShift.visible=emPage===4&&emTool===5;emShift.bounds=[16,332,w-16,364];
};
function emDrawEdit(g,w){
  label(g,'Ajuste sem reaplicar',16,82,18,palette.text,true);
  var co=app.project.activeItem,rec=null,count=0;try{if(co instanceof CompItem){count=co.selectedLayers.length;if(count){var all=emRecords(co.selectedLayers[0]);rec=all.length?all[all.length-1]:null;}}}catch(e){}
  box(g,16,119,w-32,72,10,palette.card,palette.edge);label(g,rec?rec.name:'Selecione uma animação EdyMotion',28,134,12,palette.text,true,w-56);label(g,rec?count+' camada(s) · última aplicação':'Aplique um preset na aba Animar.',28,160,11,palette.muted,false,w-56);
  label(g,'Nova duração (segundos)',16,216,12,palette.muted);
  button(g,'retime','Atualizar duração','curve',16,290,w-32,34,function(){emEditApplication('duration',emEditDuration.text);},false,true);
  button(g,'to_cursor','Mover início para a agulha','arrow',16,334,w-32,34,function(){emEditApplication('cursor');});
  button(g,'remove_animation','Remover última animação','reset',16,378,w-32,34,function(){emEditApplication('remove');});
  label(g,'Alterações manuais são protegidas.',16,436,11,palette.muted,false,w-32);
}
function emDrawCreate(g,w){
  label(g,'Elementos editáveis',16,80,18,palette.text,true);
  label(g,'Texto principal',16,152,12,palette.muted);label(g,'Detalhe / itens separados por |',16,220,12,palette.muted);
  label(g,'Duração (s)',16,288,11,palette.muted);label(g,'Cor (HEX)',w/2+4,288,11,palette.muted);
  label(g,'Criado na composição, a partir da agulha.',16,366,11,palette.muted,false,w-32);
  button(g,'create_template','Criar elemento','star',16,408,w-32,38,function(){var hex=String(emTemplateColor.text).replace('#','');if(!/^[0-9a-fA-F]{6}$/.test(hex)){say('Use seis dígitos na cor HEX.');return;}var color=[parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255];emCreateTemplate(['title','lowerThird','offer','callout','list','background'][emTemplate.selection.index],{title:emTitle.text,subtitle:emSubtitle.text,duration:Number(emTemplateDuration.text.replace(',','.')),color:color});},false,true);
}
function emDrawLibrary(g,w){
  var cw=(w-40)/2;label(g,'Sua biblioteca',16,80,18,palette.text,true);
  button(g,'library_recipes','Presets',null,16,112,cw,28,function(){emLibraryMode=0;emRefreshLibrary();},!emLibraryMode);
  button(g,'library_files','Arquivos',null,24+cw,112,cw,28,function(){emLibraryMode=1;emRefreshLibrary();},!!emLibraryMode);
  button(g,'library_use',emLibraryMode?'Importar selecionado':'Carregar preset','play',16,362,w-32,34,emUseLibrary,false,true);
  if(emLibraryMode)button(g,'library_add','Adicionar arquivo','copy',16,406,w-32,32,function(){var path=prompt('Cole o caminho completo da imagem, vídeo ou áudio:','');if(path){emMediaAdd(path);emRefreshLibrary();}});
  else label(g,'Salve combinações pelo botão + em Animar.',16,414,11,palette.muted,false,w-32);
  button(g,'library_remove','Remover da lista',null,16,446,w-32,26,function(){var i=emLibrary.selection?emLibrary.selection.index:-1;if(i<0)return;if(emLibraryMode)emMediaRemove(i);else{emSaved.splice(i,1);emPersist('recipes',emSaved);}emRefreshLibrary();});
}
function emDrawTools(g,w){
  if(emTool===1){drawCurves(g,w);return;}if(emTool===2){drawLayout(g,w);return;}if(emTool===3||emTool===4){drawLayers(g,w);for(var h=0;h<hits.length;h++){if(hits[h].id==='project')hits[h].fn=function(){emNavigate(4,4);};if(hits[h].id==='project_back')hits[h].fn=function(){emNavigate(4,3);};}return;}
  if(emTool===5){
    label(g,'Ações de keyframes',16,82,18,palette.text,true);label(g,'Selecione chaves na timeline.',16,112,12,palette.muted);
    var actions=[['Inverter','reverse'],['Clonar na agulha','clone'],['Início na agulha','alignStart'],['Fim na agulha','alignEnd'],['Copiar curva','copyEase'],['Colar curva','pasteEase']],cw=(w-40)/2;
    for(var i=0;i<actions.length;i++)(function(n){button(g,'key_'+actions[n][1],actions[n][0],null,16+n%2*(cw+8),146+Math.floor(n/2)*48,cw,38,function(){emKeyAction(actions[n][1]);});})(i);
    label(g,'Deslocamento em segundos (+ / −)',16,310,11,palette.muted);
    button(g,'key_shift','Deslocar selecionadas','arrow',16,380,w-32,38,function(){emKeyAction('shift',emShift.text);},false,true);return;
  }
  label(g,'Ferramentas de motion',16,82,18,palette.text,true);
  var list=[['Curvas de velocidade','curve',1],['Âncora e alinhamento','anchor',2],['Escada e camadas','stairs',3],['Organizar projeto','layers',4],['Ações de keyframes','copy',5]];
  for(var j=0;j<list.length;j++)(function(n){button(g,'tool_'+list[n][2],list[n][0],list[n][1],16,128+n*58,w-32,44,function(){emNavigate(4,list[n][2]);});})(j);
}
draw=function(){
  drawCount++;theme();var g=canvas.graphics,w=canvas.size.width,h=canvas.size.height;hits=[];box(g,0,0,w,h,0,palette.bg);
  box(g,16,12,29,29,8,palette.accent);icon(g,'curve',22,18,17,[1,1,1,1]);label(g,'EdyMotion',54,12,20,palette.text,true);label(g,'by Edy Bastos — 11/2026',16,45,8,palette.muted);
  if(emPage===0){button(g,'favorite','', 'star',w-77,12,28,28,emToggleFavorite);button(g,'save_recipe','+',null,w-43,12,27,28,emSaveRecipe);drawAnimate(g,w,h);if(!countMode)button(g,'favorites_only',emFavoriteOnly?'★ Salvos':'Todos',null,w-88,170,72,24,function(){emFavoriteOnly=!emFavoriteOnly;fillList(current());dirty=true;},emFavoriteOnly);}
  else if(emPage===1)emDrawEdit(g,w);else if(emPage===2)emDrawCreate(g,w);else if(emPage===3)emDrawLibrary(g,w);else{if(emTool)button(g,'tools_back','', 'left',w-44,12,28,28,function(){emNavigate(4);});emDrawTools(g,w);}
  var footerY=h-80;box(g,16,footerY,w-32,28,8,palette.card);label(g,message,25,footerY+8,10,messageKind==='success'?palette.green:palette.muted,false,w-50);
  var labels=['Animar','Editar','Criar','Meus','Mais'],symbols=['play','curve','star','layers','anchor'],nw=(w-16)/5,navY=h-44;
  box(g,8,navY,w-16,40,10,palette.card,palette.edge);
  for(var i=0;i<5;i++)(function(n){var x=8+n*nw;if(emPage===n)box(g,x,navY+3,nw,34,8,palette.tint);icon(g,symbols[n],x+nw/2-8,navY+5,16,emPage===n?palette.accent:palette.muted);label(g,labels[n],x+4,navY+24,8,emPage===n?palette.accent:palette.muted,true,nw-6);hit('page_'+n,x,navY,nw,40,function(){emNavigate(n);});})(i);
};
canvas.onDraw=draw;
