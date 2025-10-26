// Basic app script implementing the behaviors described in the spec.
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

// Pages and nav
const pages = { home:$('#page-home'), builder:$('#page-builder'), saved:$('#page-saved') };
const navButtons = $$('.nav-btn');

function showPage(id){
  Object.values(pages).forEach(p=>p.classList.remove('active'));
  $('#'+id).classList.add('active');
  // footer active
  navButtons.forEach(b=>b.classList.toggle('active', b.dataset.target === id));
  // active icon color handled by CSS
}

// init nav
navButtons.forEach(btn=>btn.addEventListener('click', ()=>showPage(btn.dataset.target)));
$('#btn-build').addEventListener('click', ()=>showPage('page-builder'));
$('#btn-saved').addEventListener('click', ()=>showPage('page-saved'));

// Tap flash for mobile buttons
function flashButton(btn){
  btn.classList.add('tap-flash');
  setTimeout(()=>btn.classList.remove('tap-flash'),180);
}
$$('.white-btn').forEach(b=>b.addEventListener('click', e=>flashButton(e.currentTarget)));
$('#btn-add').addEventListener('click', e=>flashButton(e.currentTarget));
$$('.nav-btn').forEach(b=>b.addEventListener('click', e=>flashButton(e.currentTarget)));

// Dropdowns data
const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const workouts = ['Chest','Triceps','Back','Biceps','Legs','Shoulders'];

// Elements
const daysPanel = $('#days-panel');
const workoutPanel = $('#workout-panel');
const dropdownDay = $('#dropdown-day');
const dropdownWorkout = $('#dropdown-workout');
const buildCard = $('#build-card');
const dayToggleArea = $('#day-toggle-area');
const addBtn = $('#btn-add');

// templates
const dayTemplate = document.getElementById('day-toggle-template');
const workoutTemplate = document.getElementById('workout-toggle-template');
const exerciseTemplate = document.getElementById('exercise-row-template');

// state
let selectedDay = null;
let selectedWorkouts = new Set();
let dayToggles = []; // in-memory before saved


//bu kod orijinaldir
/*function renderDaysPanel(){
  daysPanel.innerHTML = '';
  days.forEach(d=>{
    const el = document.createElement('div');
    el.className = 'day-option';
    el.textContent = d;
    el.addEventListener('click', ()=>{
      selectedDay = d;
      // highlight
      $$('.day-option').forEach(o=>o.classList.toggle('active', o===el));
      daysPanel.style.display='none';
      dropdownDay.querySelector('.dropdown-btn').focus();
      dropdownDay.querySelector('.dropdown-btn').textContent = d;
      updateBuildCardHeight();
    });
    daysPanel.appendChild(el);
  });
}*/

//bu yuxaridakinin yenisi
function renderDaysPanel() {
  daysPanel.innerHTML = '';  // Clear the previous content
  days.forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-option';
    el.textContent = d;

    el.addEventListener('click', () => {
      // Check if the day is already selected, then don't do anything
      if (selectedDay === d) return;

      selectedDay = d;

      // Highlight the selected day
      $$('.day-option').forEach(o => o.classList.remove('active'));
      el.classList.add('active'); // Add the active class to the selected day

      // Update the dropdown button text to show the selected day
      dropdownDay.querySelector('.dropdown-btn').textContent = d;

      // Hide the day panel
      daysPanel.style.display = 'none';

      // Focus on the dropdown button (for better accessibility)
      dropdownDay.querySelector('.dropdown-btn').focus();

      // Trigger any necessary updates, e.g., reflow or layout changes
      updateBuildCardHeight();
    });

    daysPanel.appendChild(el);
  });
}


function renderWorkoutPanel(){
  workoutPanel.innerHTML='';
  workouts.forEach(w=>{
    const row = document.createElement('label');
    row.className = 'checkbox-row';
    const input = document.createElement('input');
    input.type='checkbox';
    input.value = w;
    input.addEventListener('change', ()=>{
      if(input.checked){ selectedWorkouts.add(w); }
      else { selectedWorkouts.delete(w); }
      updateBuildCardHeight();
    });
    const span = document.createElement('span');
    span.textContent = w;
    row.appendChild(input);
    row.appendChild(span);
    workoutPanel.appendChild(row);
  });
}

function togglePanel(panel){
  if(panel.style.display==='block'){ panel.style.display='none'; }
  else { panel.style.display='block'; }
  updateBuildCardHeight();
}

//dropdownDay.querySelector('.dropdown-btn').addEventListener('click', ()=>togglePanel(daysPanel));
//dropdownWorkout.querySelector('.dropdown-btn').addEventListener('click', ()=>togglePanel(workoutPanel));

// improved dropdown toggle logic
$$('.dropdown-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dropdown = btn.parentElement;
    const isOpen = dropdown.classList.contains('open');
    
    // close all other dropdowns first
    $$('.dropdown').forEach(d => d.classList.remove('open'));

    if (!isOpen) dropdown.classList.add('open');
  });
});

function updateBuildCardHeight(){
  // allow CSS transitions by ensuring container auto size handled; no fixed height necessary
  // but we can add a tiny reflow to animate
  buildCard.style.transition='all .25s ease';
  setTimeout(()=>{},250);
}

renderDaysPanel();
renderWorkoutPanel();

// Add button behavior: create a day toggle with selected workouts
addBtn.addEventListener('click', ()=>{
  if(!selectedDay || selectedWorkouts.size===0){ alert('Please select a day and at least one workout.'); return; }
  const clone = dayTemplate.content.cloneNode(true);
  const dayEl = clone.querySelector('.day-toggle');
  //bunu sonradan elave etdim
  // Ensure new day toggle starts closed
  dayEl.classList.remove('open');
  dayEl.querySelector('.workouts-list').style.display = 'none';
  dayEl.querySelectorAll('.workout-editor').forEach(ed => ed.style.display = 'none');
  //buradan soonra orijinaldir
  const header = dayEl.querySelector('.day-toggle-header');
  const title = header.querySelector('.day-title');
  title.textContent = selectedDay;
  // workouts list
  const workoutsList = dayEl.querySelector('.workouts-list');
  selectedWorkouts.forEach(w=>{
    const wclone = workoutTemplate.content.cloneNode(true);
    const wEl = wclone.querySelector('.workout-toggle');
    wEl.querySelector('.workout-title').textContent = w;
    // setup editor actions
    setupWorkoutControls(wEl);
    workoutsList.appendChild(wEl);
  });

  // header actions
  const saveBtn = dayEl.querySelector('.save-day');
  const deleteBtn = dayEl.querySelector('.delete-day');
  saveBtn.addEventListener('click', ()=>saveDayPlan(dayEl));
  deleteBtn.addEventListener('click', ()=>{
    if(confirm('Delete this day and its content?')){ dayEl.remove(); }
  });

  // expand/collapse on header click
  /*header.addEventListener('click', (e)=>{
    if(e.target.closest('.icon-btn')) return; // ignore clicks on icons
    dayEl.classList.toggle('open');
    // close others
    $$('.day-toggle').forEach(dt=>{ if(dt!==dayEl) dt.classList.remove('open'); });
    // show/hide workout editors
    const editors = dayEl.querySelectorAll('.workout-editor');
    editors.forEach(ed=>ed.style.display = ed.style.display==='flex'?'none':'flex');
  });*/

  //bunu yeni elave etdik yuxaridaki blokun yerine

  header.addEventListener('click', (e)=>{
  if(e.target.closest('.icon-btn')) return; // ignore clicks on icons

  const isOpen = dayEl.classList.contains('open');
  
  // close all other day toggles
  $$('.day-toggle').forEach(dt=>{
    dt.classList.remove('open');
    dt.querySelector('.workouts-list').style.display = 'none';
  });

  // toggle current one
  if(!isOpen){
    dayEl.classList.add('open');
    dayEl.querySelector('.workouts-list').style.display = 'block';
  } else {
    dayEl.classList.remove('open');
    dayEl.querySelector('.workouts-list').style.display = 'none';
  }
});

//buradan yuxari yeni elave edilib

  dayToggleArea.appendChild(dayEl);
  // make workouts draggable
  setupSortable(dayEl.querySelector('.workouts-list'));

  // clear selections and inputs
  clearSelections();
  updateBuildCardHeight();
});

function setupWorkoutControls(wEl){
  const header = wEl.querySelector('.workout-header');
  const editor = wEl.querySelector('.workout-editor');
  const editBtn = wEl.querySelector('.edit-workout');
  const deleteBtn = wEl.querySelector('.delete-workout');
  const doneBtn = wEl.querySelector('.done-btn');
  const exList = wEl.querySelector('.exercises-list');

  // header click open/close
  header.addEventListener('click', (e)=>{
    if(e.target.closest('.icon-btn')) return;
    // toggle editor visibility
    const isOpen = editor.style.display==='flex';
    // close other workout editors within same day
    const siblings = header.closest('.workouts-list').querySelectorAll('.workout-editor');
    siblings.forEach(s=>s.style.display='none');
    editor.style.display = isOpen? 'none' : 'flex';
  });

  editBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    editor.style.display = editor.style.display==='flex' ? 'none':'flex';
  });

  deleteBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(confirm('Delete this workout?')) wEl.remove();
  });

  doneBtn.addEventListener('click', ()=>{
    const title = wEl.querySelector('.exercise-title').value.trim();
    const sets = wEl.querySelector('.sets').value;
    const reps = wEl.querySelector('.reps').value;
    const weight = wEl.querySelector('.weight').value.trim();
    if(!title){ alert('Enter exercise title'); return; }
    const row = exerciseTemplate.content.cloneNode(true);
    const rEl = row.querySelector('.exercise-row');
    rEl.querySelector('.exercise-name').textContent = title;
    rEl.querySelector('.exercise-detail').textContent = `${sets} x ${reps} – ${weight ? weight + ' kg' : ''}`;
    // delete exercise
    rEl.querySelector('.delete-exercise').addEventListener('click', ()=>{
      if(confirm('Delete this exercise?')) rEl.remove();
    });
    exList.appendChild(rEl);
    setupSortable(exList);
    // clear inputs in editor
    wEl.querySelector('.exercise-title').value='';
    wEl.querySelector('.sets').value='';
    wEl.querySelector('.reps').value='';
    wEl.querySelector('.weight').value='';
  });
}

// make sortable area for given container
function setupSortable(container){
  if(!container) return;
  Sortable.create(container, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: ()=>{ /* persistence can be added */ }
  });
}

function clearSelections(){
  selectedDay = null;
  selectedWorkouts.clear();
  // reset UI
  dropdownDay.querySelector('.dropdown-btn').textContent = 'Choose a day ';
  dropdownWorkout.querySelector('.dropdown-btn').textContent = 'Choose a workout ';
  $$('.day-option').forEach(o=>o.classList.remove('active'));
  $$('.checkbox-row input[type=checkbox]').forEach(cb=>cb.checked=false);
  //workoutPanel.style.display='none';
  //daysPanel.style.display='none';
   if (selectedWorkouts.size === 0) workoutPanel.style.display = 'none';
  daysPanel.style.display = 'none';
}

// Save day plan to localStorage and add to saved list
function saveDayPlan(dayEl){
  try{
    const title = dayEl.querySelector('.day-title').textContent;
    const workouts = [];
    dayEl.querySelectorAll('.workout-toggle').forEach(w=>{
      const wtitle = w.querySelector('.workout-title').textContent;
      const exercises = [];
      w.querySelectorAll('.exercise-row').forEach(er=>{
        exercises.push({
          name: er.querySelector('.exercise-name').textContent,
          detail: er.querySelector('.exercise-detail').textContent
        });
      });
      workouts.push({title:wtitle, exercises});
    });
    const plan = {day:title, workouts};
    const saved = JSON.parse(localStorage.getItem('savedPlans')||'[]');
    saved.push(plan);
    localStorage.setItem('savedPlans', JSON.stringify(saved));
    alert('Saved to Saved Plans');
    // remove day from builder area
    dayEl.remove();
    renderSavedList();
  }catch(err){ console.error(err); alert('Save failed') }
}


function renderSavedList(){
  const list = $('#saved-list');
  list.innerHTML='';
  const saved = JSON.parse(localStorage.getItem('savedPlans')||'[]');
  saved.forEach((plan, idx)=>{
    const clone = dayTemplate.content.cloneNode(true);
    const dayEl = clone.querySelector('.day-toggle');
    //ashagidaki 3 setri yeni elave etdim
    // Ensure saved Day toggle starts closed
    dayEl.classList.remove('open');
    dayEl.querySelector('.workouts-list').style.display = 'none';
    dayEl.querySelectorAll('.workout-editor').forEach(ed => ed.style.display = 'none');

    dayEl.querySelector('.day-title').textContent = plan.day;
    const workoutsList = dayEl.querySelector('.workouts-list');
    plan.workouts.forEach(w=>{
      const wclone = workoutTemplate.content.cloneNode(true);
      const wEl = wclone.querySelector('.workout-toggle');
      wEl.querySelector('.workout-title').textContent = w.title;
      // add exercises rows
      const exList = wEl.querySelector('.exercises-list');
      w.exercises.forEach(ex=>{
        const row = exerciseTemplate.content.cloneNode(true);
        const rEl = row.querySelector('.exercise-row');
        rEl.querySelector('.exercise-name').textContent = ex.name;
        rEl.querySelector('.exercise-detail').textContent = ex.detail;
        rEl.querySelector('.delete-exercise').addEventListener('click', ()=>{
          if(confirm('Delete this exercise?')) rEl.remove();
        });
        exList.appendChild(rEl);
      });
      setupWorkoutControls(wEl);
      workoutsList.appendChild(wEl);
    });
    // header actions for saved list: save (update) and delete
    const saveBtn = dayEl.querySelector('.save-day');
    const deleteBtn = dayEl.querySelector('.delete-day');
    //ashagidaki blok yeni elave edildi, boshluq qoydum sondaki bilinsin
    // Header click accordion behavior for saved plans
    const header = dayEl.querySelector('.day-toggle-header');
    header.addEventListener('click', (e)=>{
    if(e.target.closest('.icon-btn')) return; // ignore clicks on icons

    const isOpen = dayEl.classList.contains('open');

    // close all other day toggles in saved list
    $$('#saved-list .day-toggle').forEach(dt=>{
    dt.classList.remove('open');
    dt.querySelector('.workouts-list').style.display = 'none';
    });

    // toggle current one
    if(!isOpen){
      dayEl.classList.add('open');
      dayEl.querySelector('.workouts-list').style.display = 'block';
    } else {
    dayEl.classList.remove('open');
    dayEl.querySelector('.workouts-list').style.display = 'none';
    }
    });


    saveBtn.addEventListener('click', ()=>{
      // update stored plan based on current DOM
      const newPlan = extractPlanFromDay(dayEl);
      const saved = JSON.parse(localStorage.getItem('savedPlans')||'[]');
      saved[idx] = newPlan;
      localStorage.setItem('savedPlans', JSON.stringify(saved));
      alert('Plan updated');
    });
    deleteBtn.addEventListener('click', ()=>{
      if(confirm('Delete this saved plan?')){
        const saved = JSON.parse(localStorage.getItem('savedPlans')||'[]');
        saved.splice(idx,1);
        localStorage.setItem('savedPlans', JSON.stringify(saved));
        renderSavedList();
      }
    });
    // download per plan could be added
    list.appendChild(dayEl);
    setupSortable(list);
  });
}

function extractPlanFromDay(dayEl){
  const title = dayEl.querySelector('.day-title').textContent;
  const workouts = [];
  dayEl.querySelectorAll('.workout-toggle').forEach(w=>{
    const wtitle = w.querySelector('.workout-title').textContent;
    const exercises = [];
    w.querySelectorAll('.exercise-row').forEach(er=>{
      exercises.push({
        name: er.querySelector('.exercise-name').textContent,
        detail: er.querySelector('.exercise-detail').textContent
      });
    });
    workouts.push({title:wtitle, exercises});
  });
  return {day:title, workouts};
}

// initial render of saved plans
renderSavedList();

// download all saved as PDF
$('#btn-download').addEventListener('click', async ()=>{
  const saved = JSON.parse(localStorage.getItem('savedPlans')||'[]');
  if(saved.length===0){ alert('No saved plans'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  saved.forEach((p,pi)=>{
    doc.setFontSize(14);
    doc.text(p.day, 10, y); y+=8;
    p.workouts.forEach(w=>{
      doc.setFontSize(12);
      doc.text(' - ' + w.title, 14, y); y+=7;
      w.exercises.forEach(ex=>{
        doc.setFontSize(10);
        doc.text('    • ' + ex.name + ' — ' + ex.detail, 18, y); y+=6;
        if(y>270){ doc.addPage(); y=10; }
      });
      y+=2;
    });
    y+=6;
    if(y>270 && pi < saved.length-1){ doc.addPage(); y=10; }
  });
  doc.save('workout-plans.pdf');
});

// register service worker
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>console.warn('SW registration failed'));
  });
}

