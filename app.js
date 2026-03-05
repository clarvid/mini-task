const STORAGE_KEY = 'mini_agenda_tareas_v1';

let tasks = [];
let currentFilter = 'all'; // 'all' | 'en_proceso' | 'finalizada'

const $ = id => document.getElementById(id);

function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks(){
  const raw = localStorage.getItem(STORAGE_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}

function filteredTasks(){
  if(currentFilter === 'all') return tasks;
  if(currentFilter === 'en_proceso') return tasks.filter(t => t.status === 'en_proceso');
  if(currentFilter === 'finalizada') return tasks.filter(t => t.status === 'finalizada');
  return tasks;
}

function renderTasks(){
  const list = $('task-list');
  list.innerHTML = '';
  // remove any old contextual menus to avoid duplicates and stacking issues
  document.querySelectorAll('.ctx-menu').forEach(m => m.remove());
  const visible = filteredTasks();
  if(visible.length===0){
    list.innerHTML = '<li class="task-item"><div class="task-main"><div class="task-info"><div class="task-name">No hay tareas</div><div class="task-meta">Crea una usando el botón +</div></div></div></li>';
    return;
  }

  visible.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const main = document.createElement('div');
    main.className = 'task-main';

    const badge = document.createElement('button');
    badge.className = `badge b-${t.status}`;
    badge.textContent = statusLabel(t.status);
    badge.setAttribute('data-id', t.id);
    badge.classList.add('status-badge');

    const info = document.createElement('div');
    info.className = 'task-info';
    const name = document.createElement('div');
    name.className = 'task-name';
    name.textContent = t.name;
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.textContent = (t.due ? `Vence: ${t.due}` : 'Sin fecha') + (t.duration ? ` • Duración: ${t.duration}h` : '');

    info.appendChild(name);
    info.appendChild(meta);

    main.appendChild(badge);
    main.appendChild(info);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'task-actions';
    const hamb = document.createElement('button');
    hamb.className = 'hamburger';
    hamb.innerHTML = '☰';
    hamb.setAttribute('data-id', t.id);

    // contextual menu container (appended to body to avoid stacking/overflow issues)
    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.setAttribute('data-id', t.id);
    menu.style.display = 'none';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.onclick = () => { startEdit(t.id); closeAllMenus(); };
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.onclick = () => { deleteTask(t.id); closeAllMenus(); };
    menu.appendChild(editBtn);
    menu.appendChild(delBtn);

    actionsWrap.appendChild(hamb);
    // append the menu to body so fixed positioning and z-index behave predictably
    document.body.appendChild(menu);

    li.appendChild(main);
    li.appendChild(actionsWrap);
    list.appendChild(li);
  });
}

function statusLabel(key){
  switch(key){
    case 'sin_iniciar': return 'Sin iniciar';
    case 'en_proceso': return 'En proceso';
    case 'finalizada': return 'Finalizada';
    case 'reprogramada': return 'Reprogramada';
    default: return key;
  }
}

function addTask(t){
  tasks.push(t);
  saveTasks();
  renderTasks();
}

function updateTask(updated){
  tasks = tasks.map(t => t.id===updated.id ? updated : t);
  saveTasks();
  renderTasks();
}

function changeStatus(id, newStatus){
  tasks = tasks.map(t => t.id===id ? { ...t, status: newStatus } : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id){
  if(!confirm('¿Eliminar esta tarea?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function startEdit(id){
  const t = tasks.find(x => x.id===id);
  if(!t) return;
  openPanel();
  $('task-id').value = t.id;
  $('task-name').value = t.name;
  $('task-status').value = t.status;
  $('task-due').value = t.due || '';
  $('task-duration').value = t.duration || '';
  $('save-btn').textContent = 'Guardar cambios';
}

function clearForm(){
  $('task-id').value = '';
  $('task-name').value = '';
  $('task-status').value = 'sin_iniciar';
  $('task-due').value = '';
  $('task-duration').value = '';
  $('save-btn').textContent = 'Crear tarea';
}

function handleSubmit(e){
  e.preventDefault();
  const idVal = $('task-id').value;
  const name = $('task-name').value.trim();
  const status = $('task-status').value;
  const due = $('task-due').value || null;
  const duration = $('task-duration').value ? Number($('task-duration').value) : null;
  if(!name){ alert('La tarea necesita un nombre.'); return; }

  if(idVal){
    const updated = { id: idVal, name, status, due, duration };
    updateTask(updated);
  } else {
    const t = { id: String(Date.now()), name, status, due, duration };
    addTask(t);
  }
  clearForm();
  closePanel();
}

/* Panel controls */
function openPanel(){
  const p = $('task-panel');
  const fab = $('open-create');
  p.setAttribute('aria-hidden','false');
  // remove any inline hiding so CSS can show it
  p.style.opacity = '1';
  p.style.pointerEvents = 'auto';
  if(fab) { fab.textContent = '✕'; fab.setAttribute('aria-label','Cerrar panel'); }
  $('task-name').focus();
}
function closePanel(){
  const p = $('task-panel');
  const fab = $('open-create');
  p.setAttribute('aria-hidden','true');
  // remove inline styles so CSS rule for [aria-hidden] takes effect
  p.style.opacity = '';
  p.style.pointerEvents = '';
  if(fab) { fab.textContent = '+'; fab.setAttribute('aria-label','Crear tarea'); }
}

/* Filters */
function setFilter(f){
  currentFilter = f;
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  if(f === 'all') $('filter-all').classList.add('active');
  if(f === 'en_proceso') $('filter-inprogress').classList.add('active');
  if(f === 'finalizada') $('filter-completed').classList.add('active');
  renderTasks();
}

function init(){
  loadTasks();
  renderTasks();
  $('task-form').addEventListener('submit', handleSubmit);
  $('cancel-btn').addEventListener('click', () => { clearForm(); closePanel(); });
  $('open-create').addEventListener('click', () => {
    const p = $('task-panel');
    if(p && p.getAttribute('aria-hidden') === 'false'){
      clearForm(); closePanel();
    } else {
      clearForm(); openPanel();
    }
  });
  $('close-panel').addEventListener('click', () => { clearForm(); closePanel(); });

  // filters
  $('filter-all').addEventListener('click', () => setFilter('all'));
  $('filter-inprogress').addEventListener('click', () => setFilter('en_proceso'));
  $('filter-completed').addEventListener('click', () => setFilter('finalizada'));

  // delegate clicks for status badge and hamburger/menu
  document.body.addEventListener('click', (ev) => {
    const target = ev.target;

    // status badge
    if(target.classList && target.classList.contains('status-badge')){
      const id = target.getAttribute('data-id');
      showStatusMenu(target, id);
      ev.stopPropagation();
      return;
    }

    // hamburger
    if(target.classList && target.classList.contains('hamburger')){
      const id = target.getAttribute('data-id');
      toggleCtxMenu(target, id);
      ev.stopPropagation();
      return;
    }

    // click outside: close any open menus
    closeAllMenus();
  });
}

/* Contextual menu helpers */
function toggleCtxMenu(button, id){
  // toggle contextual menu visibility, position fixed near the button and keep inside viewport
  const menu = document.querySelector(`.ctx-menu[data-id='${id}']`);
  if(!menu) return;
  // if already visible => close
  if(menu.style.display === 'block') { closeAllMenus(); return; }
  closeAllMenus();
  menu.style.display = 'block';
  // position relative to viewport
  const rect = button.getBoundingClientRect();
  // ensure menu is measured after display
  const mw = menu.offsetWidth || 140;
  let left = rect.left;
  // prefer aligning right edge of menu to button right if overflow
  if(left + mw + 8 > window.innerWidth) left = Math.max(8, window.innerWidth - mw - 8);
  const top = rect.bottom + 8;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
}

function showStatusMenu(button, id){
  // If the same menu is already open, toggle it closed
  const existing = document.querySelector(`.status-menu[data-id='${id}']`);
  if(existing){ closeAllMenus(); return; }
  closeAllMenus();
  const menu = document.createElement('div');
  menu.className = 'status-menu';
  menu.style.display = 'block';
  menu.setAttribute('data-id', id);
  // mark current status
  const current = tasks.find(t => t.id === id)?.status;
  ['sin_iniciar','en_proceso','finalizada','reprogramada'].forEach(s => {
    const b = document.createElement('button');
    b.textContent = statusLabel(s);
    if(s === current) b.classList.add('active');
    b.onclick = (ev) => { ev.stopPropagation(); changeStatus(id, s); closeAllMenus(); };
    menu.appendChild(b);
  });
  document.body.appendChild(menu);
  const rect = button.getBoundingClientRect();
  // position menu under the badge and keep within viewport
  const left = Math.max(8, rect.left);
  const top = rect.bottom + 8;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.setAttribute('data-temp','1');
}

function closeAllMenus(){
  document.querySelectorAll('.ctx-menu').forEach(m => m.style.display = 'none');
  document.querySelectorAll('.status-menu').forEach(m => m.remove());
}

document.addEventListener('DOMContentLoaded', init);
