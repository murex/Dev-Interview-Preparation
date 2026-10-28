import {test} from 'node:test';
import assert from 'node:assert/strict';
import {curriculum} from '../dist/curriculum.js';
import {createState,validateState,statistics,addTask,updateTask,selectTasks,trackTasks,trackCategories,validUrl,parseNoteLinks,stageDefinitions} from '../dist/model.js';

test('Both guides import every curriculum row, sample exercise and resource',()=>{
  const state=createState();
  assert.equal(state.tracks.java.tasks.length,148);
  assert.equal(state.tracks.cpp.tasks.length,157);
  for(const track of ['java','cpp']){
    const tasks=state.tracks[track].tasks;
    assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
    assert.ok(tasks.every(t=>t.title.trim()&&!t.title.startsWith('I.')));
    assert.equal(tasks.filter(t=>t.category==='practice').length,19);
    assert.ok(tasks.filter(t=>t.category==='practice').every(t=>validUrl(t.sources[0].url)));
    assert.ok(curriculum.tracks[track].resources.length>=5);
  }
});
test('Fresh progress is zero and generated content is not mutated',()=>{
  const state=createState();assert.equal(statistics(trackTasks(state)).percent,0);
  assert.ok(state.stages.every(s=>s.status==='todo'));
  state.tracks.java.tasks[0].status='done';assert.equal(createState().tracks.java.tasks[0].status,'todo');
});
test('Checkpoints save completion and status with accurate counts',()=>{
  const state=createState(),[one,two]=trackTasks(state);
  updateTask(state,one.id,{status:'done'});updateTask(state,two.id,{status:'active'});
  assert.deepEqual(statistics(trackTasks(state)),{total:148,done:1,active:1,todo:146,percent:1});
  assert.equal(selectTasks(state,{view:'active'})[0].id,two.id);
  assert.equal(selectTasks(state,{view:'done'})[0].id,one.id);
});
test('Custom topics preserve priority, notes, date and category',()=>{
  const state=createState();
  const task=addTask(state,{title:'  Learn event sourcing  ',category:'structures',priority:'high',notes:'Feedback: revisit snapshots https://example.com/source',due:'2026-11-10'});
  assert.equal(task.title,'Learn event sourcing');assert.equal(task.notes.includes('snapshots'),true);assert.equal(task.due,'2026-11-10');
  assert.equal(selectTasks(state,{query:'snapshots'}).length,1);assert.equal(selectTasks(state,{query:'example.com'}).length,1);
  assert.throws(()=>addTask(state,{title:'  ',category:'basics'}));assert.throws(()=>addTask(state,{title:'x',category:'missing'}));
});
test('Java and C++ progress stay independent when switching tracks',()=>{
  const state=createState();updateTask(state,trackTasks(state)[0].id,{status:'done',notes:'Java reflection'});
  state.track='cpp';assert.equal(statistics(trackTasks(state)).done,0);assert.ok(!trackCategories(state).some(c=>c.id==='sql'));
  state.track='java';assert.equal(statistics(trackTasks(state)).done,1);assert.equal(trackTasks(state)[0].notes,'Java reflection');
});
test('Notes and sources for every hiring checkpoint survive backup and reload',()=>{
  const state=createState();for(const stage of state.stages){stage.notes=`Feedback for ${stage.id}`;stage.sources=[{label:'Reference',url:'https://example.com/study'}];stage.date='2026-11-12';stage.status='active';}
  const reloaded=validateState(JSON.parse(JSON.stringify(state)));
  assert.equal(reloaded.stages.length,stageDefinitions.length);assert.equal(reloaded.stages[3].notes,'Feedback for test');assert.equal(reloaded.stages[3].sources[0].label,'Reference');
});
test('Archiving removes a topic from totals and restores it without losing notes',()=>{
  const state=createState(),task=trackTasks(state)[0];updateTask(state,task.id,{archived:true,notes:'Keep this thought'});
  assert.equal(statistics(trackTasks(state)).total,147);assert.equal(selectTasks(state,{view:'archive'}).length,1);
  updateTask(state,task.id,{archived:false});assert.equal(trackTasks(state).length,148);assert.equal(task.notes,'Keep this thought');
});
test('Filtering and sorting include categories, sources and completed state',()=>{
  const state=createState(),task=addTask(state,{title:'AAAA custom topic',category:'algorithms',priority:'low'});task.status='done';task.sources=[{label:'A custom video',url:'https://example.com/unique'}];
  assert.equal(selectTasks(state,{query:'custom video'}).length,1);assert.equal(selectTasks(state,{query:'AAAA',hideDone:true}).length,0);
  assert.equal(selectTasks(state,{sort:'title'})[0].title,'AAAA custom topic');assert.ok(selectTasks(state,{view:'algorithms',priority:'low'}).includes(task));
});
test('Backup validation rejects broken records, duplicate IDs and unsafe sources',()=>{
  assert.throws(()=>validateState({version:1}));
  const state=createState();state.tracks.java.tasks[0].sources=[{label:'Unsafe',url:'javascript:alert(1)'}];assert.throws(()=>validateState(state));
  const duplicate=createState();duplicate.tracks.java.tasks[1].id=duplicate.tracks.java.tasks[0].id;assert.throws(()=>validateState(duplicate));
  const color=createState();color.categories[0].color='red;position:fixed';assert.throws(()=>validateState(color));
  const wrongStage=createState();wrongStage.stages[0].id='unknown';assert.throws(()=>validateState(wrongStage));
  const wrongDate=createState();wrongDate.stages[0].date='2026-02-31';assert.throws(()=>validateState(wrongDate));
});
test('Source links allow only HTTP(S), without executable URLs',()=>{
  assert.equal(validUrl('javascript:alert(1)'),null);assert.equal(validUrl('file:///etc/passwd'),null);
  assert.equal(validUrl('https://example.com/study'),'https://example.com/study');
  assert.deepEqual(parseNoteLinks('Read https://example.com/study. Then https://example.com/study and javascript:bad'),['https://example.com/study']);
});
