// Config
const config = {
  daysToShow: 60,
  blockedWeekdays: [0,6], // weekends disabled
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December']
};

const calendarEl = document.getElementById('calendar');
const monthLabel = document.getElementById('monthLabel');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;
let selectedTime = null;

const form = document.getElementById('booking-form');
const dateHidden = document.getElementById('selected-date-hidden');
const timeHidden = document.getElementById('selected-time-hidden');
const timeSlotsEl = document.getElementById('time-slots');

const modal = document.getElementById('confirmModal');
const summaryEl = document.getElementById('summary');
const confirmSendBtn = document.getElementById('confirmSend');
const cancelSendBtn = document.getElementById('cancelSend');
const clearBtn = document.getElementById('clearBtn');

document.getElementById('year').textContent = new Date().getFullYear();

// create sample available dates: pick 6 random future days in this month (ensuring weekdays)
function sampleAvailableDates(month, year){
  const available = new Set();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  while(available.size < 6){
    const d = Math.floor(Math.random() * daysInMonth) + 1;
    const dd = new Date(year, month, d);
    if(dd < new Date(today.getFullYear(), today.getMonth(), today.getDate())) continue;
    if(config.blockedWeekdays.includes(dd.getDay())) continue;
    available.add(formatDateISO(dd));
  }
  return available;
}

let sampleSet = sampleAvailableDates(currentMonth, currentYear);

// utilities
function isSameDate(a,b){ return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function formatDateISO(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function formatFriendly(d){ return `${config.monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }

// render calendar
function renderCalendar(month, year){
  calendarEl.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  monthLabel.textContent = `${config.monthNames[month]} ${year}`;

  // blanks
  for(let i=0;i<firstDay;i++){
    const blank = document.createElement('div');
    blank.className = 'day disabled';
    blank.setAttribute('aria-hidden','true');
    calendarEl.appendChild(blank);
  }

  for(let d=1; d<=daysInMonth; d++){
    const dayDate = new Date(year, month, d);
    const dayEl = document.createElement('button');
    dayEl.className = 'day';
    dayEl.type = 'button';
    dayEl.textContent = d;
    dayEl.dataset.date = formatDateISO(dayDate);

    if(dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())){
      dayEl.classList.add('disabled');
      dayEl.disabled = true;
    } else if (config.blockedWeekdays.includes(dayDate.getDay())) {
      dayEl.classList.add('disabled');
      dayEl.disabled = true;
    } else {
      // sample availability: if in sampleSet or (random small chance)
      const iso = formatDateISO(dayDate);
      const available = sampleSet.has(iso) || Math.random() < 0.04; // small chance
      if(available){
        dayEl.classList.add('available');
        dayEl.addEventListener('click', () => onDateSelect(dayDate, dayEl));
      } else {
        dayEl.classList.add('disabled');
        dayEl.disabled = true;
      }
    }

    if(selectedDate && isSameDate(dayDate, selectedDate)) dayEl.classList.add('selected');
    calendarEl.appendChild(dayEl);
  }
}

// date select
function onDateSelect(dateObj, el){
  Array.from(calendarEl.querySelectorAll('.day.selected')).forEach(n => n.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = dateObj;
  dateHidden.value = formatDateISO(dateObj);
  populateTimeSlots(dateObj);
}

// time slots logic (example)
function populateTimeSlots(dateObj){
  timeSlotsEl.innerHTML = '';
  selectedTime = null;
  timeHidden.value = '';

  const day = dateObj.getDay();
  const slots = ['08:00 AM','09:00 AM','10:00 AM','12:00 PM','01:00 PM','02:00 PM'];
  if(day !== 5) slots.push('05:00 PM','06:00 PM'); // Friday close early as sample

  if(slots.length === 0){
    document.getElementById('no-times-hint').textContent = 'No times available for this date.';
    return;
  } else {
    document.getElementById('no-times-hint').textContent = 'Select a time';
  }

  slots.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot';
    btn.textContent = t;
    btn.addEventListener('click', () => {
      Array.from(timeSlotsEl.children).forEach(node => node.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = t;
      timeHidden.value = t;
    });
    timeSlotsEl.appendChild(btn);
  });
}

// navigation
prevBtn.addEventListener('click', () => {
  if(currentMonth === 0){ currentMonth = 11; currentYear--; } else currentMonth--;
  sampleSet = sampleAvailableDates(currentMonth, currentYear);
  renderCalendar(currentMonth, currentYear);
});
nextBtn.addEventListener('click', () => {
  if(currentMonth === 11){ currentMonth = 0; currentYear++; } else currentMonth++;
  sampleSet = sampleAvailableDates(currentMonth, currentYear);
  renderCalendar(currentMonth, currentYear);
});

renderCalendar(currentMonth, currentYear);

// form submit flow
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.querySelector('[name="name"]').value.trim();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const notes = form.querySelector('[name="notes"]').value.trim();

  if(!selectedDate){ alert('Please pick an available date.'); return; }
  if(!selectedTime){ alert('Please choose a time slot.'); return; }
  if(!name){ alert('Please enter your full name.'); return; }
  if(!phone){ alert('Please enter your phone number.'); return; }

  dateHidden.value = formatDateISO(selectedDate);
  timeHidden.value = selectedTime;

  summaryEl.innerHTML = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    ${ email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : '' }
    <p><strong>Date:</strong> ${formatFriendly(selectedDate)}</p>
    <p><strong>Time:</strong> ${escapeHtml(selectedTime)}</p>
    ${ notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : '' }
  `;

  modal.setAttribute('aria-hidden','false');
});

// modal actions
cancelSendBtn.addEventListener('click', () => modal.setAttribute('aria-hidden','true'));
confirmSendBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden','true');
  form.submit(); // Netlify will handle
});

// clear form
clearBtn.addEventListener('click', () => {
  if(!confirm('Clear the form and selection?')) return;
  selectedDate = null;
  selectedTime = null;
  dateHidden.value = '';
  timeHidden.value = '';
  form.reset();
  document.querySelectorAll('.day.selected').forEach(n => n.classList.remove('selected'));
  timeSlotsEl.innerHTML = '';
  document.getElementById('no-times-hint').textContent = 'Select a date to view available times';
});

// escape
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') modal.setAttribute('aria-hidden','true'); });

function escapeHtml(text){ return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }