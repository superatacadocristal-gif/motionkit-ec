// Runs against EffectCraft's real scripting engine. Returns the number of checks.
function emRunKeyframeTests(){
  var count=0;
  function check(ok,label){if(!ok)throw Error('Keyframes: '+label);count++;}
  function near(a,b){return Math.abs(a-b)<0.00001;}
  var comp=app.project.items.addComp('EdyMotion keyframe tests',640,360,1,12,30);
  comp.openInViewer();
  var layer=comp.layers.addSolid([1,.4,0],'Numeric tools',100,100,1),p=layer.transform.rotation;
  p.setValueAtTime(1,10);p.setValueAtTime(2,30);p.setValueAtTime(3,80);
  function select(prop,indices){
    prop.selected=true;app.run('keys.select',{comp:comp.id,keys:[]});
    for(var i=0;i<indices.length;i++)prop.setSelectedAtKey(indices[i],true);
  }
  p.setInterpolationTypeAtKey(1,KeyframeInterpolationType.BEZIER,KeyframeInterpolationType.BEZIER);
  p.setTemporalEaseAtKey(1,[new KeyframeEase(15,22)],[new KeyframeEase(25,44)]);
  select(p,[1,2,3]);
  var before=emSnapshotProperty(p);check(emKeyAction('shift',1),'Shift accepted');
  check(near(p.keyTime(1),2)&&near(p.keyTime(3),4),'Shift times');
  check(p.keyValue(1)===10&&p.keyValue(3)===80,'Shift preserves values');
  check(near(p.keyInTemporalEase(1)[0].influence,22)&&near(p.keyOutTemporalEase(1)[0].speed,25),'Shift preserves ease');
  check(p.selectedKeys.length===3,'Selection restored');
  app.run('edit.undo',{});check(near(p.keyTime(1),1)&&near(p.keyTime(3),3),'Undo restores');
  select(p,[1,2,3]);check(emKeyAction('reverse'),'Reverse accepted');
  check(p.keyValue(1)===80&&p.keyValue(3)===10,'Reversed values');
  check(near(p.keyInTemporalEase(3)[0].speed,-25)&&near(p.keyOutTemporalEase(3)[0].influence,22),'Reverse swaps and reverses ease');
  check(emKeyAction('reverse'),'Second reverse');
  check(near(p.keyInTemporalEase(1)[0].speed,15)&&p.keyValue(1)===10,'Reverse twice restores');
  select(p,[1,2]);var collision=JSON.stringify(emSnapshotProperty(p));
  check(!emKeyAction('shift',1),'Collision rejected');check(JSON.stringify(emSnapshotProperty(p))===collision,'Collision no mutation');
  check(!emKeyAction('shift',-8),'Bounds rejected');check(JSON.stringify(emSnapshotProperty(p))===collision,'Bounds no mutation');
  select(p,[1,2,3]);comp.time=5;check(emKeyAction('alignStart'),'Align start');check(near(p.keyTime(1),5)&&near(p.keyTime(3),7),'Aligned first');
  comp.time=9;check(emKeyAction('alignEnd'),'Align end');check(near(p.keyTime(1),7)&&near(p.keyTime(3),9),'Aligned last');
  comp.time=1;check(emKeyAction('clone'),'Clone accepted');check(p.numKeys===6&&near(p.keyTime(1),1)&&near(p.keyTime(6),9),'Clone keeps originals');
  check(p.selectedKeys.length===3,'Only clones selected');
  select(p,[1]);check(emKeyAction('copyEase'),'Copy ease');
  p.setTemporalEaseAtKey(2,[new KeyframeEase(0,60)],[new KeyframeEase(0,60)]);
  select(p,[2]);check(emKeyAction('pasteEase'),'Paste ease');check(near(p.keyOutTemporalEase(2)[0].influence,44),'Pasted influence');
  p.expression='value';check(!emKeyAction('shift',1),'Expression rejected');p.expression='';
  select(p,[1]);layer.locked=true;check(!emKeyAction('shift',1),'Locked rejected');layer.locked=false;
  var position=layer.transform.position;position.setValueAtTime(1,[10,10]);position.setValueAtTime(3,[100,80]);
  position.setSpatialTangentsAtKey(1,[-5,-6],[20,30]);position.setSpatialTangentsAtKey(2,[-10,-20],[4,5]);
  select(position,[1,2]);var spatial=emSnapshotProperty(position);
  check(emKeyAction('reverse'),'Spatial reverse');check(position.keyValue(1)[0]===100,'Spatial values');
  check(position.keyInSpatialTangent(2)[0]===20&&position.keyOutSpatialTangent(2)[0]===-5,'Spatial tangents swap');
  check(emKeyAction('reverse'),'Spatial second reverse');
  check(JSON.stringify(emSnapshotProperty(position))===JSON.stringify(spatial),'Spatial exact roundtrip');
  var staticProp=layer.transform.opacity,staticSnapshot=emSnapshotProperty(staticProp);
  staticProp.setValueAtTime(2,40);emRestoreProperty(staticProp,staticSnapshot);check(staticProp.numKeys===0&&staticProp.value===100,'Static restore');
  var text=comp.layers.addText('Original');var unsupported=text.property('ADBE Text Properties').property('ADBE Text Document');
  var failed=false;try{emSnapshotProperty(unsupported);}catch(e){failed=true;}check(failed,'Reject text snapshot');
  // Failure injection after a real write proves rollback against actual engine state.
  select(position,[1,2]);var saved=emSnapshotProperty(position),realRestore=emRestoreProperty,attempt=0;
  emRestoreProperty=function(prop,snapshot){attempt++;realRestore(prop,snapshot);if(attempt===1)throw Error('Injected write failure');};
  try{check(!emKeyAction('shift',1),'Write failure returned');}finally{emRestoreProperty=realRestore;}
  check(JSON.stringify(emSnapshotProperty(position))===JSON.stringify(saved),'Write failure rollback exact');
  text.remove();layer.remove();comp.remove();return count;
}
