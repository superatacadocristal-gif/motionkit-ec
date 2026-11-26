var emSeqChecks=0;function emSeqCheck(ok,label){if(!ok)throw Error('Text sequences: '+label);emSeqChecks++;}
var emSeqComp=app.project.items.addComp('EdyMotion sequence tests',640,360,1,8,30);emSeqComp.openInViewer();
for(var emSi=0;emSi<2;emSi++)for(var emSp=0;emSp<3;emSp++)for(var emSm=0;emSm<3;emSm++){
  var emSl=emSeqComp.layers.addText('ALFA BETA'),emSsrc=emSl.property('ADBE Text Properties').property('ADBE Text Document');emSl.selected=true;emSl.inPoint=1;emSl.outPoint=7;
  var emSopts={unit:['characters','words'][emSi],preset:['fade','rise','typewriter'][emSp],mode:['in','out','both'][emSm],duration:1};
  var emSr=emTextSequence(emSopts);emSeqCheck(!!emSr,'Aplica '+JSON.stringify(emSopts)+' '+message);emSeqCheck(emSsrc.value.text==='ALFA BETA','Preserva texto');
  emSeqCheck(emSr.animators.length===(emSm===2?2:1),'Quantidade de animadores');
  for(var emSa=0;emSa<emSr.animators.length;emSa++){
    var emSel=emSr.animators[emSa].property('ADBE Text Selectors').property(1),emIsOut=emSr.animators[emSa].name.indexOf(':out:')>=0,emP=emSel.property(emIsOut?'ADBE Text Percent End':'ADBE Text Percent Start');
    emSeqCheck(emSel.property('advanced').property('basedOn').value===(emSi?3:1),'Unidade de seleção');
    emSeqCheck(emP.numKeys===2&&emP.keyTime(1)===(emIsOut?6:1)&&emP.keyTime(2)===(emIsOut?7:2),'Limites no tempo');
    emSeqCheck(emP.keyValue(1)===0&&emP.keyValue(2)===100,'Percorre faixa');
    emSeqCheck(emSel.property('advanced').property('smoothness').value===(emSp===2?0:100),'Digitação ou suave');
  }
  emSeqCheck(!emTextSequence(emSopts)&&emSequenceGroup(emSl).numProperties===(emSm===2?2:1),'Impede aplicação duplicada');
  var emForeign=emSequenceGroup(emSl).addProperty('ADBE Text Animator');emForeign.name='Outro animador';
  emSeqCheck(emRemoveTextSequences()&&emSequenceGroup(emSl).numProperties===1&&emSequenceGroup(emSl).property(1).name==='Outro animador','Remove somente sequências');emSl.remove();
}
var emInvalid=emSeqComp.layers.addText('Válido');emInvalid.selected=true;emInvalid.locked=true;emSeqCheck(!emTextSequence({duration:1}),'Bloqueado');emInvalid.locked=false;
emSeqCheck(!emTextSequence({duration:NaN}),'Duração NaN');emSeqCheck(!emTextSequence({duration:10}),'Duração maior que camada');
var emInvalidSource=emSequenceSource(emInvalid);emInvalidSource.expression='"Teste"';emSeqCheck(!emTextSequence({duration:1}),'Texto com expressão');emInvalidSource.expression='';
emSeqCheck(!!emTextSequence({unit:'words',preset:'rise',duration:1}),'Aplica para desfazer');app.run('edit.undo',{});emSeqCheck(emSequenceGroup(emInvalid).numProperties===0,'Desfazer');
var emRealSequenceName=emSequenceName;emSequenceName=function(){throw Error('Injected after animator creation');};emSeqCheck(!emTextSequence({duration:1}),'Falha injetada');emSequenceName=emRealSequenceName;emSeqCheck(emSequenceGroup(emInvalid).numProperties===0,'Rollback do animador parcial');
emInvalid.remove();writeLn('Text sequence checks: '+emSeqChecks);
