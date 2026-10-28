// Application event integration in a minimal DOM double. This does not assert visual layout.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STORE,validateState} from '../dist/model.js';

const nodes=new Map(),documentEvents=new Map(),saved=new Map();
class Element {
  constructor(selector){this.id=selector.startsWith('#')?selector.slice(1):'';this.dataset={};this.value='';this.hidden=false;this.open=false;this.checked=false;this._html='';this.events=new Map();this.attributes=new Map();this.classList={add(){},remove(){},toggle(){return false;}};}
  set innerHTML(value){this._html=value;if(value.includes('<option'))this.value=value.match(/<option value="([^"]+)"/)?.[1]||'';}
  get innerHTML(){return this._html;}
  addEventListener(type,fn){if(!this.events.has(type))this.events.set(type,[]);this.events.get(type).push(fn);}
  emit(type,event){for(const fn of this.events.get(type)||[])fn(event);}
  setAttribute(name,value){this.attributes.set(name,value);}
  hasAttribute(name){if(name.startsWith('data-'))return Object.hasOwn(this.dataset,name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()));return this.attributes.has(name);}
  querySelector(selector){return node(selector);}
  querySelectorAll(){return [];}
  closest(){return this;}
  focus(){}
  reset(){}
  showModal(){this.open=true;}
  close(){this.open=false;this.emit('close',{});}
  getBoundingClientRect(){return {left:0,right:1000,top:0,bottom:1000};}
}
function node(selector){if(!nodes.has(selector))nodes.set(selector,new Element(selector));return nodes.get(selector);}
function emit(type,target){const event={target,preventDefault(){},clientX:10,clientY:10};for(const fn of documentEvents.get(type)||[])fn(event);}
function click(data){const target=new Element('button');target.dataset=data;emit('click',target);}
function readState(){return validateState(JSON.parse(saved.get(STORE)));}
globalThis.document={body:{append(){}},querySelector:node,querySelectorAll:selector=>selector==='dialog'?['#detail-dialog','#category-dialog','#backup-dialog'].map(node):[],addEventListener(type,fn){if(!documentEvents.has(type))documentEvents.set(type,[]);documentEvents.get(type).push(fn);}};
globalThis.window={innerWidth:1400,addEventListener(){}};
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)}});
await import('../dist/app.js');

test('Application boots with honest progress and all board controls',()=>{
  assert.match(node('#goals-panel').innerHTML,/0 of 148 completed/);
  assert.match(node('#board-columns').innerHTML,/Language Basics|Java Releases|What are Classes|Evolution|Class/);
  assert.match(node('#main-nav').innerHTML,/Hiring process/);
  assert.equal(node('#quick-category').value,'basics');
});
test('Quick capture renders and persists escaped topic text',()=>{
  node('#quick-title').value='Understand <script> markup';node('#quick-category').value='basics';node('#quick-priority').value='high';
  node('#quick-add').emit('submit',{preventDefault(){}});
  const state=readState();assert.equal(state.tracks.java.tasks[0].title,'Understand <script> markup');
  assert.match(node('#board-columns').innerHTML,/&lt;script&gt;/);assert.ok(!node('#board-columns').innerHTML.includes('<script>'));
});
test('A topic details panel autosaves feedback and link references',()=>{
  const task=readState().tracks.java.tasks[0];click({openTask:task.id,focusNotes:'true'});
  assert.equal(node('#detail-dialog').open,true);assert.match(node('#detail-dialog').innerHTML,/Notes & feedback/);
  node('#detail-dialog').emit('input',{target:{dataset:{detailField:'notes'},value:'Revisit this concept. https://example.com/lesson'}});
  assert.match(readState().tracks.java.tasks[0].notes,/Revisit this concept/);assert.match(node('#detail-note-links').innerHTML,/https:\/\/example.com\/lesson/);
  node('#detail-dialog').close();
});
test('Every hiring stage opens the same feedback and sources controls',()=>{
  click({view:'journey'});assert.match(node('#journey-view').innerHTML,/7 checkpoints/);
  click({openStage:'technical'});assert.match(node('#detail-dialog').innerHTML,/Learning sources/);
  node('#detail-dialog').emit('input',{target:{dataset:{detailField:'notes'},value:'Feedback: explain the trade-offs more clearly.'}});
  assert.equal(readState().stages.find(s=>s.id==='technical').notes,'Feedback: explain the trade-offs more clearly.');
  node('#detail-dialog').close();
});
test('A source added in a checkpoint is saved as a clickable reference',()=>{
  click({openStage:'technical'});node('#source-label').value='Interview practice';node('#source-url').value='https://example.com/practice';
  const form=node('#source-form');node('#detail-dialog').emit('submit',{target:form,preventDefault(){}});
  const stage=readState().stages.find(s=>s.id==='technical');assert.equal(stage.sources[0].label,'Interview practice');assert.equal(stage.sources[0].url,'https://example.com/practice');
  assert.match(node('#detail-sources').innerHTML,/rel="noopener noreferrer"/);node('#detail-dialog').close();
});
test('Dragging between priority columns saves the updated priority',()=>{
  click({view:'all'});const id=readState().tracks.java.tasks[0].id,card=new Element('article'),column=new Element('section');card.dataset.dragTask=id;column.dataset.dropGroup='low';
  const transfer={setData(){},effectAllowed:'',dropEffect:''};node('#board-columns').emit('dragstart',{target:card,dataTransfer:transfer});
  node('#board-columns').emit('drop',{target:column,dataTransfer:transfer,preventDefault(){}});
  assert.equal(readState().tracks.java.tasks[0].priority,'low');
});
test('Completion updates saved progress and the visible total immediately',()=>{
  const id=readState().tracks.java.tasks[0].id;
  emit('change',{dataset:{complete:id},checked:true});
  assert.equal(readState().tracks.java.tasks[0].status,'done');
  assert.match(node('#goals-panel').innerHTML,/1 of 149 completed/);
});
test('Source validation errors appear in the active checkpoint dialog',()=>{
  click({openStage:'technical'});node('#source-label').value='Duplicate';node('#source-url').value='https://example.com/practice';
  node('#detail-dialog').emit('submit',{target:node('#source-form'),preventDefault(){}});
  assert.match(node('[data-dialog-feedback]').innerHTML,/This source is already saved/);
  node('#detail-dialog').close();
});
test('Opening and closing mobile navigation enables and releases the background',()=>{
  node('#menu-toggle').onclick();assert.equal(node('.app-main').inert,true);assert.equal(node('#sidebar-backdrop').hidden,false);
  node('#menu-close').onclick();assert.equal(node('.app-main').inert,false);assert.equal(node('#sidebar-backdrop').hidden,true);
  assert.equal(node('#menu-toggle').attributes.get('aria-expanded'),'false');
});
