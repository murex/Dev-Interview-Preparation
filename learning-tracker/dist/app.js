import {curriculum} from './curriculum.js';
import {STORE,statusNames,priorityNames,stageDefinitions,createState,validUrl,parseNoteLinks,validateState,trackTasks,trackCategories,statistics,updateTask,addTask,selectTasks} from './model.js';

const paths = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>'
};
const $ = selector => document.querySelector(selector);
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const filters = {view:'all',group:'priority',query:'',priority:'all',hideDone:false,sort:'default'};
const limits = new Map();
let state, storageAvailable = true, loadWarning = '', detail = null, pendingImport = null, dragContext = null;

try {
  const stored = localStorage.getItem(STORE);
  state = stored ? validateState(JSON.parse(stored)) : createState();
} catch (error) {
  state = createState();
  storageAvailable = error.name !== 'SecurityError';
  loadWarning = 'Saved progress could not be read. Restore a backup to recover your data.';
}

const category = id => state.categories.find(c => c.id === id);
const getTasks = () => trackTasks(state);
const currentTasks = () => selectTasks(state, filters);
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const prettyDate = date => new Date(date+'T12:00:00').toLocaleDateString(undefined, {month:'short',day:'numeric',year:'numeric'});

// Inline feedback is reserved for errors, recovery actions, and backup restoration.
function notify(message, undo) {
  const dialog = ['#detail-dialog','#category-dialog','#backup-dialog'].map(id=>$(id)).find(el=>el.open);
  const element = dialog ? dialog.querySelector('[data-dialog-feedback]') : $('#feedback');
  element.innerHTML = `<span>${esc(message)}</span>${undo?'<button data-undo>Undo</button>':''}<button data-dismiss-feedback>Dismiss</button>`;
  element.hidden = false;
  if (undo) element.querySelector('[data-undo]').onclick = () => { undo(); element.hidden = true; };
}

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
    storageAvailable = true;
    $('#storage-warning').hidden = true;
    if ($('#saved-indicator').textContent !== 'Saved locally') $('#saved-indicator').textContent = 'Saved locally';
    if ($('#detail-save-status') && $('#detail-save-status').textContent !== 'Autosaved') $('#detail-save-status').textContent = 'Autosaved';
    return true;
  } catch {
    storageAvailable = false;
    $('#storage-warning').hidden = false;
    $('#saved-indicator').textContent = 'Not saved';
    if ($('#detail-save-status')) $('#detail-save-status').textContent = 'Not saved';
    return false;
  }
}

function renderNav() {
  const tasks = getTasks(), stats = statistics(tasks);
  const items = [
    ['all','Topics',stats.total], ['active','In progress',stats.active], ['done','Completed',stats.done],
    ['journey','Hiring process',null], ['resources','Resources',null],
    ['archive','Archive',state.tracks[state.track].tasks.filter(t=>t.archived).length]
  ];
  $('#main-nav').innerHTML = items.map(([id,label,count]) => `<button class="nav-item ${filters.view===id?'active':''}" data-view="${id}" ${filters.view===id?'aria-current="page"':''}><span>${label}</span>${count===null?'':`<span class="nav-count">${count}</span>`}</button>`).join('');
  $('#category-nav').innerHTML = trackCategories(state).map(c => `<button class="nav-item category-item ${filters.view===c.id?'active':''}" data-view="${esc(c.id)}" ${filters.view===c.id?'aria-current="page"':''}><i class="cat-dot" style="background:${esc(c.color)}" aria-hidden="true"></i><span>${esc(c.short)}</span><span class="nav-count" aria-label="${tasks.filter(t=>t.category===c.id&&t.status==='done').length} completed of ${tasks.filter(t=>t.category===c.id).length}">${tasks.filter(t=>t.category===c.id&&t.status==='done').length}/${tasks.filter(t=>t.category===c.id).length}</span></button>`).join('');
}

function categoryOptions() {
  const selected = $('#quick-category').value;
  $('#quick-category').innerHTML = trackCategories(state).map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if (trackCategories(state).some(c => c.id === selected)) $('#quick-category').value = selected;
}

function renderGoals() {
  const tasks = getTasks(), total = statistics(tasks);
  $('#goals-panel').innerHTML = `<div class="section-heading"><h2>Learning progress</h2><span class="overall-summary">${total.done} of ${total.total} completed · ${total.percent}%</span></div><div class="overall-track" role="progressbar" aria-label="Overall learning progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${total.percent}"><i style="width:${total.percent}%"></i></div>`;
}

function statusSelect(record, kind = 'task') {
  const title = record.title || stageDefinitions.find(s => s.id === record.id)?.title;
  return `<select class="status-select ${record.status}" data-status-kind="${kind}" data-status-id="${esc(record.id)}" aria-label="Status of ${esc(title)}">${Object.entries(statusNames).map(([value,label]) => `<option value="${value}" ${record.status===value?'selected':''}>${label}</option>`).join('')}</select>`;
}

function taskCard(task, flat = false) {
  const cat = category(task.category), sources = task.sources.length + parseNoteLinks(task.notes).length;
  const noteLabel = task.notes || sources ? `Notes${sources?` · ${sources} source${sources===1?'':'s'}`:''}` : 'Notes & sources';
  const checkbox = `<label class="checkbox-label"><input class="complete-box" type="checkbox" ${task.status==='done'?'checked':''} data-complete="${esc(task.id)}" aria-label="Mark ${esc(task.title)} ${task.status==='done'?'incomplete':'complete'}"><span aria-hidden="true">Done</span></label>`;
  const body = `<button class="task-card-title" data-open-task="${esc(task.id)}">${esc(task.title)}</button><p class="card-parent">${esc(task.parent || cat?.name || '')}</p>`;
  if (flat) return `<article class="task-list-item ${task.status==='done'?'completed':''}" data-card="${esc(task.id)}">${checkbox}<div class="task-list-body">${body}</div><span class="list-priority ${task.priority}">${priorityNames[task.priority]}</span><div class="list-controls">${statusSelect(task)}<button class="notes-button" data-open-task="${esc(task.id)}" data-focus-notes="true">${esc(noteLabel)}</button></div></article>`;
  return `<article draggable="true" data-drag-task="${esc(task.id)}" class="task-card ${task.status==='done'?'completed':''}" data-card="${esc(task.id)}">${body}<div class="card-status-row">${statusSelect(task)}${checkbox}</div>${task.due?`<p class="card-due ${task.due<localDate()&&task.status!=='done'?'overdue':''}">${task.due<localDate()&&task.status!=='done'?'Overdue: ':'Due: '}${esc(prettyDate(task.due))}</p>`:''}${task.notes?`<p class="card-note-preview">${esc(task.notes.length>160?task.notes.slice(0,160)+'…':task.notes)}</p>`:''}<div class="card-footer"><button class="notes-button" data-open-task="${esc(task.id)}" data-focus-notes="true" aria-label="Notes and learning sources for ${esc(task.title)}">${esc(noteLabel)}</button></div></article>`;
}

function boardGroups(list) {
  if (filters.group === 'all') return [{id:'all',name:'All topics',items:list}];
  if (filters.group === 'priority') return Object.entries(priorityNames).map(([id,name]) => ({id,name,items:list.filter(t=>t.priority===id)}));
  if (filters.group === 'status') return Object.entries(statusNames).map(([id,name]) => ({id,name,items:list.filter(t=>t.status===id)}));
  return trackCategories(state).filter(c=>list.some(t=>t.category===c.id)).map(c => ({id:c.id,name:c.short,items:list.filter(t=>t.category===c.id)}));
}

function renderBoard() {
  const list = currentTasks();
  $('#board-total').textContent = `${list.length} topic${list.length===1?'':'s'}`;
  $('#board-columns').className = `board-columns ${filters.group==='all'?'flat':filters.group==='category'?'categories':''}`;
  if (!list.length) {
    const description = filters.query || filters.priority !== 'all' || filters.hideDone ? 'No topics match these filters.' : filters.view==='done' ? 'No completed topics.' : filters.view==='active' ? 'No topics in progress. Change a topic’s status to start tracking it.' : filters.view==='archive' ? 'No archived topics.' : 'No topics in this category. Add one above.';
    $('#board-columns').innerHTML = `<div class="empty-board"><p>${description}</p><button class="secondary-button" data-clear-filters>Show all topics</button></div>`;
    return;
  }
  $('#board-columns').innerHTML = boardGroups(list).map(group => {
    const key = `${filters.group}-${group.id}`, limit = limits.get(key) || (filters.group==='all'?18:4);
    const more = group.items.length>limit ? `<button class="more-cards" data-more="${esc(key)}">Show ${Math.min(filters.group==='all'?18:8,group.items.length-limit)} more topics</button>` : '';
    if (filters.group === 'all') return group.items.slice(0,limit).map(t=>taskCard(t,true)).join('')+more;
    return `<section data-drop-group="${esc(group.id)}" class="board-column ${esc(group.id)}"><div class="column-heading"><h3>${esc(group.name)}</h3><span>${group.items.length}</span></div>${group.items.length?group.items.slice(0,limit).map(t=>taskCard(t)).join(''):'<p class="empty-column">No topics</p>'}${more}</section>`;
  }).join('');
}

function renderJourney() {
  const done = state.stages.filter(s=>s.status==='done').length;
  const times = state.track==='java' ? [['5 min','Java basics · MCQ'],['15 min','SQL basics · Coding'],['20 min','Problem solving · Coding'],['50 min','OOP advanced · Coding']] : [['20 min','Four C++ MCQ sections · 5 min each'],['30 min','C++ intermediate · Coding'],['40 min','Problem solving · Coding']];
  $('#journey-view').innerHTML = `<div class="journey-summary"><h2>Hiring checkpoints</h2><span>${done} of 7 checkpoints completed</span></div><div class="journey-grid">${stageDefinitions.map((definition,i) => {
    const stage = state.stages[i];
    return `<article class="stage-card"><div class="stage-card-top"><span class="stage-number">Step ${i+1}</span>${statusSelect(stage,'stage')}</div><h2>${definition.title}</h2><p class="stage-description">${definition.description}</p><div class="stage-meta"><span>${stage.date?prettyDate(stage.date):definition.duration}</span><button data-open-stage="${definition.id}">${stage.notes||stage.sources.length?'Notes & sources':'Add notes & sources'}</button></div>${stage.notes?`<div class="stage-note-preview">${esc(stage.notes.length>240?stage.notes.slice(0,240)+'…':stage.notes)}</div>`:''}</article>`;
  }).join('')}</div><div class="test-breakdown"><h2>${state.track==='java'?'Java':'C++'} technical test · 90 minutes</h2><div class="test-times">${times.map(([time,label])=>`<div class="test-time"><strong>${time}</strong><span>${label}</span></div>`).join('')}</div><p>Assessment details come from the repository guide. During the real test, AI tools and external IDEs are prohibited. The matching interview applies to permanent positions.</p></div>`;
}

function renderResources() {
  $('#resources-view').innerHTML = `<div class="resource-grid">${curriculum.tracks[state.track].resources.map(resource => `<a href="${esc(resource.url)}" class="resource-card" target="_blank" rel="noopener noreferrer"><div><h2>${esc(resource.title)}</h2><p>${esc(resource.focus)}</p></div><span class="sr-only">Opens in a new tab</span></a>`).join('')}</div><p class="resource-note">HackerRank and LeetCode problems are in <button data-view="practice">Practice exercises</button>, with source links saved on each topic.</p>`;
}

function render() {
  renderNav();
  renderGoals();
  const special = ['journey','resources'].includes(filters.view);
  const names = {all:'Topics',overview:'Topics',active:'In progress',done:'Completed',archive:'Archive',journey:'Hiring process',resources:'Resources'};
  $('#page-title').textContent = names[filters.view] || category(filters.view)?.name || 'Topics';
  $('#learning-layout').hidden = special;
  $('#goals-panel').hidden = special || filters.view==='archive';
  $('#journey-view').hidden = filters.view!=='journey';
  $('#resources-view').hidden = filters.view!=='resources';
  if (filters.view==='journey') renderJourney();
  else if (filters.view==='resources') renderResources();
  else renderBoard();
}

function closeNavigation() {
  $('#sidebar').classList.remove('open');
  $('#sidebar-backdrop').hidden = true;
  $('.app-main').inert = false;
  $('#menu-toggle').setAttribute('aria-expanded','false');
}

function navigate(view) {
  filters.view = view==='overview'?'all':view;
  if (filters.view==='done') { filters.hideDone=false; $('#hide-done').checked=false; }
  filters.query = '';
  $('#search').value = '';
  limits.clear();
  if (category(view)) $('#quick-category').value = view;
  render();
  closeNavigation();
  $('#page-title').focus();
}

function currentDetail() {
  return detail?.kind==='task' ? state.tracks[state.track].tasks.find(t=>t.id===detail.id) : state.stages.find(s=>s.id===detail?.id);
}

function linksMarkup(notes) {
  return parseNoteLinks(notes).map(url=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(url).hostname)}<span class="sr-only"> (opens in a new tab)</span></a>`).join('');
}

function renderSources() {
  const record = currentDetail();
  if (!record) return;
  $('#detail-sources').innerHTML = record.sources.length ? record.sources.map((source,i) => `<div class="source-item"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(source.label)}</strong><small>${esc(source.url)}</small><span class="sr-only">Opens in a new tab</span></a><button class="icon-button" data-remove-source="${i}" aria-label="Remove source ${esc(source.label)}">${icon('x')}</button></div>`).join('') : '<p class="source-empty">No sources added.</p>';
}

function openDetail(kind, id, focusNotes = false) {
  detail = {kind,id};
  const record = currentDetail();
  if (!record) return;
  const task = kind==='task', definition = task?null:stageDefinitions.find(s=>s.id===id);
  const title = task?record.title:definition.title;
  $('#detail-dialog').innerHTML = `<div class="detail-topbar"><span class="detail-breadcrumb">${task?'Topic':'Hiring checkpoint'}</span><span class="detail-save-status" id="detail-save-status" role="status">${storageAvailable?'Autosaved':'Not saved'}</span><button class="icon-button" data-close aria-label="Close details">${icon('x')}</button></div><div class="detail-content"><div class="feedback" id="detail-feedback" data-dialog-feedback role="status" hidden></div>${task?`<label class="sr-only" for="detail-title">Topic title</label><textarea id="detail-title" class="detail-title" data-detail-field="title" rows="2" maxlength="250">${esc(title)}</textarea>`:`<h2 class="detail-title">${esc(title)}</h2>`}${task&&record.parent?`<p class="detail-subtitle">${esc(record.parent)}</p>`:''}<div class="detail-properties"><label class="property"><span>Status</span><select data-detail-field="status" aria-label="Checkpoint status">${Object.entries(statusNames).map(([value,label])=>`<option value="${value}" ${record.status===value?'selected':''}>${label}</option>`).join('')}</select></label>${task?`<label class="property"><span>Priority</span><select data-detail-field="priority" aria-label="Checkpoint priority">${Object.entries(priorityNames).map(([value,label])=>`<option value="${value}" ${record.priority===value?'selected':''}>${label}</option>`).join('')}</select></label><label class="property"><span>Category</span><select data-detail-field="category" aria-label="Checkpoint category">${trackCategories(state).map(c=>`<option value="${esc(c.id)}" ${record.category===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>`:''}<label class="property"><span>${task?'Due date':'Date'}</span><input type="date" data-detail-field="${task?'due':'date'}" value="${esc(task?record.due:record.date)}" aria-label="Checkpoint date"></label></div>${task?'':`<p class="detail-description">${definition.description}${definition.id==='application'?'<br><a href="https://careers.murex.com/search/" target="_blank" rel="noopener noreferrer">Murex career portal</a>':''}</p>`}<section><div class="detail-section-heading"><h3>Notes & feedback</h3></div><label class="sr-only" for="detail-notes">Notes and feedback for ${esc(title)}</label><textarea id="detail-notes" class="detail-notes" data-detail-field="notes" maxlength="100000" placeholder="Study notes, interview feedback, questions or reference links">${esc(record.notes)}</textarea><div id="detail-note-links" class="note-links">${linksMarkup(record.notes)}</div></section><section class="sources-section"><div class="detail-section-heading"><h3>Learning sources</h3></div><div id="detail-sources"></div><form class="source-form" id="source-form"><label for="source-label">Source title (optional)</label><input id="source-label" maxlength="200" placeholder="Article, video or exercise"><label for="source-url">URL</label><input id="source-url" type="url" required maxlength="4000" placeholder="https://example.com"><button class="secondary-button" type="submit">Add source</button></form></section><div class="detail-footer">${task?`<button class="archive-action" data-archive="${esc(record.id)}">${record.archived?'Restore topic':'Archive topic'}</button>`:'<span></span>'}<button class="secondary-button" data-close>Close</button></div></div>`;
  renderSources();
  $('#detail-dialog').showModal();
  if (focusNotes) $('#detail-notes').focus({preventScroll:true});
}

function updateProgress() { renderNav(); renderGoals(); }

function markTask(id,status) {
  const control=document.activeElement?.dataset;
  const selector=control?.complete?`[data-complete="${id}"]`:`[data-status-id="${id}"]`;
  updateTask(state,id,{status});
  save();
  updateProgress();
  renderBoard();
  (document.querySelector(selector)||document.querySelector('[data-complete]')||$('#page-title')).focus({preventScroll:true});
}

function exportBackup() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `prepboard-backup-${localDate()}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

$('#board-columns').addEventListener('dragstart', event => {
  const card = event.target.closest('[data-drag-task]');
  if (!card || !event.dataTransfer) return;
  dragContext = {id:card.dataset.dragTask,track:state.track,group:filters.group};
  event.dataTransfer.setData('text/plain',dragContext.id);
  event.dataTransfer.effectAllowed = 'move';
  card.classList.add('is-dragging');
});
$('#board-columns').addEventListener('dragover', event => {
  const column = event.target.closest('[data-drop-group]');
  if (column && dragContext && dragContext.track===state.track && dragContext.group===filters.group) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    column.classList.add('drop-target');
  }
});
$('#board-columns').addEventListener('dragleave', event => {
  const column = event.target.closest('[data-drop-group]');
  if (column && !column.contains(event.relatedTarget)) column.classList.remove('drop-target');
});
$('#board-columns').addEventListener('drop', event => {
  const column = event.target.closest('[data-drop-group]');
  if (!column || !dragContext || dragContext.track!==state.track || dragContext.group!==filters.group) return;
  event.preventDefault();
  const value = column.dataset.dropGroup, task = state.tracks[state.track].tasks.find(t=>t.id===dragContext.id);
  if (!task) return;
  if (filters.group==='priority' && Object.hasOwn(priorityNames,value)) task.priority=value;
  else if (filters.group==='status' && Object.hasOwn(statusNames,value)) task.status=value;
  else if (filters.group==='category' && category(value)) task.category=value;
  else return;
  dragContext=null;
  save();
  render();
});
$('#board-columns').addEventListener('dragend', () => {
  dragContext=null;
  document.querySelectorAll('.drop-target,.is-dragging').forEach(el=>el.classList.remove('drop-target','is-dragging'));
});

document.addEventListener('click', event => {
  const button=event.target.closest('button,a');
  if (!button) return;
  if (button.hasAttribute('data-dismiss-feedback')) { button.closest('.feedback').hidden=true; return; }
  if (button.dataset.view) { navigate(button.dataset.view); return; }
  if (button.hasAttribute('data-close')) { button.closest('dialog').close(); return; }
  if (button.dataset.openTask) { openDetail('task',button.dataset.openTask,button.dataset.focusNotes==='true'); return; }
  if (button.dataset.openStage) { openDetail('stage',button.dataset.openStage,true); return; }
  if (button.dataset.group) {
    filters.group=button.dataset.group;
    limits.clear();
    document.querySelectorAll('[data-group]').forEach(el=>{ const active=el.dataset.group===filters.group; el.classList.toggle('active',active); el.setAttribute('aria-pressed',String(active)); });
    renderBoard();
    return;
  }
  if (button.dataset.more) {
    const key=button.dataset.more;
    limits.set(key,(limits.get(key)||(filters.group==='all'?18:4))+(filters.group==='all'?18:8));
    renderBoard();
    return;
  }
  if (button.hasAttribute('data-clear-filters')) {
    Object.assign(filters,{query:'',priority:'all',hideDone:false,sort:'default'});
    $('#search').value=''; $('#priority-filter').value='all'; $('#sort').value='default'; $('#hide-done').checked=false;
    navigate('all');
    return;
  }
  if (button.hasAttribute('data-remove-source')) {
    currentDetail().sources.splice(Number(button.dataset.removeSource),1);
    save(); renderSources(); return;
  }
  if (button.dataset.archive) {
    const record=currentDetail(), track=state.track, id=record.id, wasArchived=record.archived;
    record.archived=!wasArchived;
    save(); $('#detail-dialog').close(); render();
    notify(wasArchived?'Topic restored.':'Topic archived.',()=>{state.tracks[track].tasks.find(t=>t.id===id).archived=wasArchived; save(); render();});
  }
});

document.addEventListener('change', event => {
  const el=event.target;
  if (el.dataset.complete) { markTask(el.dataset.complete,el.checked?'done':'todo'); return; }
  if (el.dataset.statusId) {
    if (el.dataset.statusKind==='task') markTask(el.dataset.statusId,el.value);
    else { state.stages.find(s=>s.id===el.dataset.statusId).status=el.value; save(); render(); document.querySelector(`[data-status-id="${el.dataset.statusId}"]`)?.focus({preventScroll:true}); }
  }
});

$('#quick-add').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const task=addTask(state,{title:$('#quick-title').value,category:$('#quick-category').value,priority:$('#quick-priority').value,notes:$('#quick-notes').value});
    save();
    $('#quick-title').value=''; $('#quick-notes').value='';
    Object.assign(filters,{view:task.category,query:'',priority:'all',hideDone:false});
    $('#priority-filter').value='all'; $('#search').value=''; $('#hide-done').checked=false;
    render(); $('#quick-title').focus();
  } catch(error) { notify(error.message); }
});

$('#category-form').addEventListener('submit', event => {
  event.preventDefault();
  const name=$('#category-name').value.trim();
  if (!name) { notify('Enter a category name.'); return; }
  if (state.categories.length>=100) { notify('The category limit is 100.'); return; }
  if (state.categories.some(c=>c.name.toLowerCase()===name.toLowerCase())) { notify('A category with this name already exists.'); return; }
  const cat={id:`custom-${crypto.randomUUID()}`,name,short:name,color:$('#category-color').value,background:'#f3eef6',icon:'folder'};
  state.categories.push(cat); save(); categoryOptions(); $('#category-dialog').close(); navigate(cat.id);
});

$('#detail-dialog').addEventListener('input', event => {
  if (event.target.dataset.detailField==='notes') {
    currentDetail().notes=event.target.value; save();
    $('#detail-note-links').innerHTML=linksMarkup(event.target.value);
  }
});
$('#detail-dialog').addEventListener('change', event => {
  const field=event.target.dataset.detailField;
  if (!field || field==='notes') return;
  const record=currentDetail();
  if (field==='title') {
    if (detail.kind!=='task') return;
    const title=event.target.value.trim();
    if (!title) { event.target.value=record.title; notify('Enter a topic title.'); return; }
    record.title=title;
  } else record[field]=event.target.value;
  save(); render();
});
$('#detail-dialog').addEventListener('submit', event => {
  if (event.target.id!=='source-form') return;
  event.preventDefault();
  const record=currentDetail(), url=validUrl($('#source-url').value.trim());
  if (!url) { notify('Enter a complete http:// or https:// URL.'); return; }
  if (record.sources.length>=100) { notify('This checkpoint has reached the limit of 100 sources.'); return; }
  if (record.sources.some(s=>s.url===url)) { notify('This source is already saved.'); return; }
  record.sources.push({label:$('#source-label').value.trim()||new URL(url).hostname,url});
  save(); renderSources(); $('#detail-feedback').hidden=true; event.target.reset();
});
$('#detail-dialog').addEventListener('close', () => { detail=null; render(); });

for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', event => {
  if (event.target!==dialog) return;
  const rect=dialog.getBoundingClientRect();
  if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) dialog.close();
});

$('#new-category').onclick=()=>{ $('#category-form').reset(); $('#category-feedback').hidden=true; $('#category-dialog').showModal(); };
$('#brand').onclick=event=>{event.preventDefault(); navigate('all');};
$('#track').value=state.track;
$('#track').onchange=event=>{
  state.track=event.target.value; save(); categoryOptions();
  if (filters.view==='sql' && state.track==='cpp') filters.view='all';
  limits.clear(); render();
};
$('#search').oninput=event=>{filters.query=event.target.value.trim(); renderBoard();};
$('#priority-filter').onchange=event=>{filters.priority=event.target.value; renderBoard();};
$('#sort').onchange=event=>{filters.sort=event.target.value; renderBoard();};
$('#hide-done').onchange=event=>{filters.hideDone=event.target.checked; renderBoard();};

$('#menu-toggle').onclick=()=>{
  $('#sidebar').classList.add('open'); $('#sidebar-backdrop').hidden=false;
  $('.app-main').inert=true; $('#menu-toggle').setAttribute('aria-expanded','true'); $('#menu-close').focus();
};
$('#menu-close').onclick=()=>{closeNavigation(); $('#menu-toggle').focus();};
$('#sidebar-backdrop').onclick=()=>{closeNavigation(); $('#menu-toggle').focus();};
document.addEventListener('keydown', event=>{
  if ($('#sidebar-backdrop').hidden) return;
  if (event.key==='Escape') { closeNavigation(); $('#menu-toggle').focus(); }
  if (event.key==='Tab') {
    const controls=[...$('#sidebar').querySelectorAll('button,a')], first=controls[0], last=controls.at(-1);
    if (event.shiftKey && document.activeElement===first) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement===last) {event.preventDefault(); first.focus();}
  }
});
window.addEventListener('resize',()=>{if(window.innerWidth>900)closeNavigation();});

$('#backup-open').onclick=()=>{ $('#restore-confirm').hidden=true; $('#backup-feedback').hidden=true; pendingImport=null; $('#backup-dialog').showModal(); };
$('#export-backup').onclick=exportBackup;
$('#warning-export').onclick=exportBackup;
$('#import-backup').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async event=>{
  const file=event.target.files[0];
  if (!file) return;
  try {
    if (file.size>8*1024*1024) throw new Error('Choose a backup smaller than 8 MB.');
    pendingImport=validateState(JSON.parse(await file.text()));
    $('#restore-summary').textContent=`${pendingImport.tracks.java.tasks.length} Java topics, ${pendingImport.tracks.cpp.tasks.length} C++ topics, and 7 hiring checkpoints.`;
    $('#restore-confirm').hidden=false;
  } catch(error) { notify(error instanceof SyntaxError?'The file is not valid JSON.':error.message); }
  finally { event.target.value=''; }
};
$('#cancel-restore').onclick=()=>{pendingImport=null; $('#restore-confirm').hidden=true;};
$('#confirm-restore').onclick=()=>{
  if (!pendingImport) return;
  exportBackup(); state=pendingImport; pendingImport=null; save();
  $('#track').value=state.track; categoryOptions(); $('#backup-dialog').close(); navigate('all');
  notify('Backup restored.');
};

window.addEventListener('storage', event=>{
  if (event.key!==STORE || !event.newValue) return;
  try {
    state=validateState(JSON.parse(event.newValue));
    if ($('#detail-dialog').open) $('#detail-dialog').close();
    $('#track').value=state.track; categoryOptions(); render();
  } catch { /* Preserve the current plan if another tab writes malformed data. */ }
});

document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
categoryOptions();
render();
if (!storageAvailable) { $('#storage-warning').hidden=false; $('#saved-indicator').textContent='Not saved'; }
if (loadWarning) notify(loadWarning);
