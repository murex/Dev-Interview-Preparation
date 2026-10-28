import {curriculum} from './curriculum.js';
export const STORE = 'murex-prepboard-local-v1';
export const statusNames = {todo:'Not started',active:'In progress',done:'Completed'};
export const priorityNames = {high:'High',medium:'Medium',low:'Low'};
export const stageDefinitions = [
  {id:'preparation',title:'Preparation',description:'Review language basics, data structures, OOP, and algorithms. Practice coding and explaining your reasoning.',duration:''},
  {id:'application',title:'Online application',description:'Choose a role on the Murex career portal and submit an updated CV. Include relevant projects, internships, and experience.',duration:''},
  {id:'screening',title:'Application screening',description:'Track application review and recruiter follow-up. Keep role details and your submitted CV here.',duration:''},
  {id:'test',title:'Technical test',description:'Complete the language-specific HackerRank assessment. Use the section timings below for practice.',duration:'90 minutes'},
  {id:'hr',title:'HR interview',description:'Prepare examples of teamwork, communication, and project experience. Research Murex before the interview.',duration:'1 hour'},
  {id:'technical',title:'Technical interview',description:'Two engineers assess language basics, data structures, and OOP or algorithms. Explain your reasoning while coding.',duration:'2 hours'},
  {id:'matching',title:'Matching interview',description:'Meet the potential team and discuss the role, its work, and next steps toward an offer.',duration:'Permanent roles only'}
];
export function createState(){return {version:1,track:'java',categories:structuredClone(curriculum.categories),tracks:Object.fromEntries(Object.entries(curriculum.tracks).map(([id,track])=>[id,{tasks:structuredClone(track.tasks)}])),stages:stageDefinitions.map(s=>({id:s.id,status:'todo',date:'',notes:'',sources:[]}))};}
export function validUrl(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
export function parseNoteLinks(value){return [...new Set((String(value).match(/https?:\/\/[^\s<>"']+/g)||[]).map(url=>url.replace(/[.,;)]+$/,'')).filter(validUrl))];}
const validString=(value,max=100000)=>typeof value==='string'&&value.length<=max;
const validDate=value=>value===''||/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
function validSources(sources){return Array.isArray(sources)&&sources.length<=100&&sources.every(s=>validString(s.label,200)&&validString(s.url,4000)&&validUrl(s.url));}
export function validateState(value){
  if(!value||value.version!==1||!['java','cpp'].includes(value.track)||!Array.isArray(value.categories)||!value.categories.length||value.categories.length>100)throw new Error('This is not a compatible Prepboard backup.');
  const ids=new Set();
  for(const c of value.categories){if(!validString(c.id,100)||ids.has(c.id)||!validString(c.name,80)||!c.name.trim()||!validString(c.short,80)||!/^#[a-f\d]{6}$/i.test(c.color)||!/^#[a-f\d]{6}$/i.test(c.background)||!validString(c.icon,30))throw new Error('The backup contains an invalid category.');ids.add(c.id);}
  for(const track of ['java','cpp']){
    const list=value.tracks?.[track]?.tasks;if(!Array.isArray(list)||list.length>10000)throw new Error('The backup is missing a learning track.');const taskIds=new Set();
    for(const t of list){if(!validString(t.id,120)||taskIds.has(t.id)||!validString(t.title,250)||!t.title.trim()||!validString(t.parent,500)||!ids.has(t.category)||!Object.hasOwn(statusNames,t.status)||!Object.hasOwn(priorityNames,t.priority)||!validString(t.notes)||!validSources(t.sources)||typeof t.archived!=='boolean'||!validString(t.due,10)||!validDate(t.due))throw new Error('The backup contains an invalid topic.');taskIds.add(t.id);}
  }
  if(!Array.isArray(value.stages)||value.stages.length!==stageDefinitions.length||value.stages.some((s,i)=>s.id!==stageDefinitions[i].id||!Object.hasOwn(statusNames,s.status)||!validString(s.date,10)||!validDate(s.date)||!validString(s.notes)||!validSources(s.sources)))throw new Error('The backup contains an invalid hiring checkpoint.');
  return structuredClone(value);
}
export function trackTasks(state,includeArchived=false){return state.tracks[state.track].tasks.filter(t=>includeArchived||!t.archived);}
export function trackCategories(state){return state.categories.filter(c=>c.id!=='sql'||state.track==='java');}
export function statistics(tasks){const done=tasks.filter(t=>t.status==='done').length,active=tasks.filter(t=>t.status==='active').length;return {total:tasks.length,done,active,todo:tasks.length-done-active,percent:tasks.length?Math.round(done/tasks.length*100):0};}
export function updateTask(state,id,patch){const task=state.tracks[state.track].tasks.find(t=>t.id===id);if(!task)throw new Error('Topic not found.');Object.assign(task,patch);return task;}
export function addTask(state,{title,category,priority='medium',notes='',due=''}){title=title.trim();if(!title||title.length>250)throw new Error('Give your topic a name (up to 250 characters).');if(!validString(notes))throw new Error('Keep notes under 100,000 characters.');if(!trackCategories(state).some(c=>c.id===category)||!Object.hasOwn(priorityNames,priority)||!validDate(due))throw new Error('Choose a valid category, priority, and date.');const task={id:crypto.randomUUID(),title,parent:'',category,priority,status:'todo',notes,sources:[],due,archived:false};state.tracks[state.track].tasks.unshift(task);return task;}
export function selectTasks(state,{view='overview',query='',priority='all',hideDone=false,sort='default'}={}){let list=trackTasks(state,view==='archive').filter(t=>view==='archive'?t.archived:!t.archived);if(view==='active'||view==='done')list=list.filter(t=>t.status===view);if(state.categories.some(c=>c.id===view))list=list.filter(t=>t.category===view);if(priority!=='all')list=list.filter(t=>t.priority===priority);if(hideDone)list=list.filter(t=>t.status!=='done');if(query){const q=query.toLowerCase();list=list.filter(t=>[t.title,t.parent,t.notes,state.categories.find(c=>c.id===t.category)?.name,...t.sources.map(s=>s.label+' '+s.url)].join(' ').toLowerCase().includes(q));}if(sort==='title')list.sort((a,b)=>a.title.localeCompare(b.title));if(sort==='priority')list.sort((a,b)=>({high:0,medium:1,low:2}[a.priority])-({high:0,medium:1,low:2}[b.priority]));if(sort==='due')list.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));return list;}
