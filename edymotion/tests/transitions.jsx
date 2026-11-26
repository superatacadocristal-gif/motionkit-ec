var emTransitionChecks=0;function emTC(ok,msg){if(!ok)throw Error('Transition: '+msg);emTransitionChecks++;}
var tc=app.project.items.addComp('EdyMotion transitions QA',640,360,1,8,30);tc.openInViewer();
var ta=tc.layers.addSolid([1,0,0],'A',640,360,1),tb=tc.layers.addSolid([0,0,1],'B',640,360,1);ta.outPoint=4;tb.inPoint=4;tb.outPoint=8;
for(var ti=0;ti<3;ti++)for(var td=0;td<(ti===0?4:1);td++){
  for(var tl=1;tl<=tc.numLayers;tl++)tc.layer(tl).selected=false;ta.selected=tb.selected=true;
  var tr=emCreateTransition({kind:['wipe','flash','dip'][ti],direction:['left','right','up','down'][td],duration:1,at:'cut',color:[1,.3,0]});
  emTC(!!tr,'Cria '+ti+' '+td+' '+message);emTC(tr.inPoint===3.5&&tr.outPoint===4.5,'Limites');emTC(ta.outPoint===4&&tb.inPoint===4,'Clipes intactos');
  emTC(tr.index===1,'Overlay acima');emTC(JSON.parse(tr.comment).center===4,'Centro no corte');
  if(ti===0){emTC(Math.abs(tr.transform.position.valueAtTime(4,false)[0]-320)<.001&&Math.abs(tr.transform.position.valueAtTime(4,false)[1]-180)<.001,'Cobertura no corte');emTC(tr.transform.position.numKeys===4,'Movimento e pausa');}
  else{emTC(tr.transform.opacity.valueAtTime(4,false)===100,'Opacidade no corte');emTC(tr.transform.opacity.valueAtTime(3.5,false)===0,'Início invisível');}
  tr.remove();
}
for(var i=1;i<=tc.numLayers;i++)tc.layer(i).selected=false;ta.selected=tb.selected=true;
var prev=tc.numLayers;tb.inPoint=5;emTC(!emCreateTransition({kind:'wipe',duration:1}),'Rejeita lacuna');emTC(tc.numLayers===prev,'Não cria em falha');tb.inPoint=4;
tc.time=.1;emTC(!emCreateTransition({kind:'wipe',duration:1,at:'cursor'}),'Rejeita fora da comp');tc.time=3;
emTC(!!emCreateTransition({kind:'dip',duration:.5,at:'cursor'}),'Na agulha');app.run('edit.undo',{});emTC(tc.numLayers===prev,'Desfazer');
writeLn('Transition checks: '+emTransitionChecks);
