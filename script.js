/* Appointment booking page script
   - custom calendar (next 60 days)
   - available = weekdays (Mon-Fri), weekends disabled
   - time slots vary by day (example)
   - Netlify-ready form (hidden fields updated)
*/

const config = {
  daysToShow: 90,     // how many days ahead to enable in calendar
  blockedWeekdays: [0,6], // 0 = Sunday, 6 = Saturday -> weekends disabled
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
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');

document.getElementById('year').textContent = new Date().getFullYear();

/* Utility */
function isSameDate(a,b){
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatDateISO(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatFriendly(d){
  return `${config.monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* Build calendar for month/year */
function renderCalendar(month, year){
  calendarEl.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  monthLabel.textContent = `${config.monthNames[month]} ${year}`;

  // fill blanks
  for(let i=0;i<firstDay;i++){
    const blank = document.createElement('div');
    blank.className = 'day disabled';
    blank.setAttribute('aria-hidden','true');
    calendarEl.appendChild(blank);
  }

  // days
  for(let d=1; d<=daysInMonth; d++){
    const dayDate = new Date(year, month, d);
    const dayEl = document.createElement('button');
    dayEl.className = 'day';
    dayEl.type = 'button';
    dayEl.textContent = d;
    dayEl.dataset.date = formatDateISO(dayDate);
    // disable past
    if(dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())){
      dayEl.classList.add('disabled');
      dayEl.disabled = true;
    } else if (config.blockedWeekdays.includes(dayDate.getDay())) {
      // weekend or blocked weekday
      dayEl.classList.add('disabled');
      dayEl.disabled = true;
    } else {
      // available
      dayEl.classList.add('available');
      dayEl.addEventListener('click', () => onDateSelect(dayDate, dayEl));
    }
    // mark selected
    if(selectedDate && isSameDate(dayDate, selectedDate)) {
      dayEl.classList.add('selected');
    }
    calendarEl.appendChild(dayEl);
  }
}

/* handle date select */
function onDateSelect(dateObj, el){
  // clear previous selection visual
  Array.from(calendarEl.querySelectorAll('.day.selected')).forEach(n => n.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = dateObj;
  dateHidden.value = formatDateISO(dateObj);
  // generate times for that date
  populateTimeSlots(dateObj);
}

/* generate time slots (example rules) */
function populateTimeSlots(dateObj){
  timeSlotsEl.innerHTML = '';
  selectedTime = null;
  timeHidden.value = '';

  // Example: Weekdays have full slots; Friday evenings blocked; (simple rules)
  const day = dateObj.getDay();
  let slots = [];
  // morning
  slots.push('08:00 AM','09:00 AM','10:00 AM');
  // afternoon
  slots.push('12:00 PM','01:00 PM','02:00 PM');
  // evening
  if(day !== 5){ // block Friday evening as an example
    slots.push('05:00 PM','06:00 PM');
  }

  if(slots.length === 0){
    document.getElementById('no-times-hint').textContent = 'No times available for this date. Choose another day.';
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
      // clear previous
      Array.from(timeSlotsEl.children).forEach(node => node.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = t;
      timeHidden.value = t;
    });
    timeSlotsEl.appendChild(btn);
  });
}

/* month navigation */
prevBtn.addEventListener('click', () => {
  if(currentMonth === 0){ currentMonth = 11; currentYear--; } else currentMonth--;
  renderCalendar(currentMonth, currentYear);
});
nextBtn.addEventListener('click', () => {
  if(currentMonth === 11){ currentMonth = 0; currentYear++; } else currentMonth++;
  renderCalendar(currentMonth, currentYear);
});

/* initial calendar: show current month but allow selection only for nearest days up to config.daysToShow.
   To keep simple, we render currentMonth and next months via nav.
*/
renderCalendar(currentMonth, currentYear);

/* Form submit flow:
   - on submit, validate date/time/name/phone
   - show confirmation modal (summary)
   - on confirm, actually submit the form (Netlify will accept regular form submission)
*/
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.querySelector('[name="name"]').value.trim();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const notes = form.querySelector('[name="notes"]').value.trim();

  if(!selectedDate){
    alert('Please pick an available date.');
    return;
  }
  if(!selectedTime){
    alert('Please choose a time slot.');
    return;
  }
  if(!name){
    alert('Please enter your full name.');
    return;
  }
  if(!phone){
    alert('Please enter your phone number.');
    return;
  }

  // populate hidden fields (redundant, but ensure)
  dateHidden.value = formatDateISO(selectedDate);
  timeHidden.value = selectedTime;

  // build summary
  summaryEl.innerHTML = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    ${ email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : '' }
    <p><strong>Date:</strong> ${formatFriendly(selectedDate)}</p>
    <p><strong>Time:</strong> ${escapeHtml(selectedTime)}</p>
    ${ notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : '' }
  `;

  // show modal
  modal.setAttribute('aria-hidden','false');
});

/* modal actions */
cancelSendBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden','true');
});
confirmSendBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden','true');
  // submit the form for real (this will navigate to thank-you.html per action)
  form.submit();
});

/* clear */
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

/* ESC to close modal */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    modal.setAttribute('aria-hidden','true');
  }
});

/* simple HTML escape for safety in summary */
function escapeHtml(text){
  return text.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}