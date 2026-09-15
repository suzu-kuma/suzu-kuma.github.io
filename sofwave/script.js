document.querySelectorAll('.faq-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(!isOpen));
    answer.hidden = isOpen;

    if (!isOpen) {
      window.requestAnimationFrame(() => {
        answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  });
});

const bookingForm = document.getElementById('booking-form');
const dateInputs = [...document.querySelectorAll('.booking-date-input')];

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const nthMonday = (year, monthIndex, nth) => {
  const first = new Date(year, monthIndex, 1);
  return 1 + ((8 - first.getDay()) % 7) + (nth - 1) * 7;
};

const japaneseHolidays = (year) => {
  const dates = new Set();
  const add = (month, day) => dates.add(toDateValue(new Date(year, month - 1, day)));
  add(1, 1);
  add(1, nthMonday(year, 0, 2));
  add(2, 11);
  add(2, 23);
  add(3, Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)));
  add(4, 29);
  add(5, 3);
  add(5, 4);
  add(5, 5);
  add(7, nthMonday(year, 6, 3));
  add(8, 11);
  add(9, nthMonday(year, 8, 3));
  add(9, Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)));
  add(10, nthMonday(year, 9, 2));
  add(11, 3);
  add(11, 23);

  [...dates].forEach((value) => {
    const holiday = parseDateValue(value);
    if (holiday.getDay() !== 0) return;
    const substitute = new Date(holiday);
    do substitute.setDate(substitute.getDate() + 1); while (dates.has(toDateValue(substitute)));
    dates.add(toDateValue(substitute));
  });

  for (let month = 0; month < 12; month += 1) {
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let day = 2; day < lastDay; day += 1) {
      const current = new Date(year, month, day);
      const previous = new Date(year, month, day - 1);
      const next = new Date(year, month, day + 1);
      if (dates.has(toDateValue(previous)) && dates.has(toDateValue(next))) dates.add(toDateValue(current));
    }
  }
  return dates;
};

const holidayCache = new Map();
const isClosedDate = (date) => {
  const weekday = date.getDay();
  if (weekday === 0 || weekday === 1) return true;
  const year = date.getFullYear();
  if (!holidayCache.has(year)) holidayCache.set(year, japaneseHolidays(year));
  return holidayCache.get(year).has(toDateValue(date));
};

const earliestBookingDate = new Date();
earliestBookingDate.setHours(0, 0, 0, 0);
earliestBookingDate.setDate(earliestBookingDate.getDate() + 3);
const earliestBookingValue = toDateValue(earliestBookingDate);

const validateBookingDate = (input, showMessage = false) => {
  input.setCustomValidity('');
  if (!input.value) return true;
  const selected = parseDateValue(input.value);
  if (input.value < earliestBookingValue) {
    input.setCustomValidity('ご予約日は3日後以降を選択してください。');
  } else if (isClosedDate(selected)) {
    input.setCustomValidity('日曜・月曜・祝日は休診日のため選択できません。');
  }
  if (showMessage && !input.checkValidity()) input.reportValidity();
  return input.checkValidity();
};

dateInputs.forEach((input) => {
  input.addEventListener('click', () => openDatePicker(input));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDatePicker(input);
    }
  });
});

let activeDateInput = null;
let calendarMonth = new Date(earliestBookingDate.getFullYear(), earliestBookingDate.getMonth(), 1);

const calendarOverlay = document.createElement('div');
calendarOverlay.className = 'calendar-overlay';
calendarOverlay.hidden = true;
calendarOverlay.innerHTML = `
  <div class="calendar-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-title">
    <div class="calendar-head">
      <button class="calendar-nav calendar-prev" type="button" aria-label="前の月">‹</button>
      <p id="calendar-title" class="calendar-title"></p>
      <button class="calendar-nav calendar-next" type="button" aria-label="次の月">›</button>
    </div>
    <div class="calendar-weekdays" aria-hidden="true"><span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span></div>
    <div class="calendar-days"></div>
    <p class="calendar-note">日曜・月曜・祝日は休診日です</p>
    <button class="calendar-close" type="button">閉じる</button>
  </div>`;
document.body.appendChild(calendarOverlay);

const calendarTitle = calendarOverlay.querySelector('.calendar-title');
const calendarDays = calendarOverlay.querySelector('.calendar-days');
const previousMonthButton = calendarOverlay.querySelector('.calendar-prev');

const renderCalendar = () => {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  calendarTitle.textContent = `${year}年 ${month + 1}月`;
  calendarDays.replaceChildren();

  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let index = 0; index < firstWeekday; index += 1) {
    const blank = document.createElement('span');
    blank.className = 'calendar-blank';
    calendarDays.appendChild(blank);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day);
    const value = toDateValue(date);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(day);
    button.className = 'calendar-day';
    button.disabled = value < earliestBookingValue || isClosedDate(date);
    if (activeDateInput?.value === value) button.classList.add('is-selected');
    if (!button.disabled) {
      button.addEventListener('click', () => {
        activeDateInput.value = value;
        activeDateInput.setCustomValidity('');
        closeDatePicker();
        activeDateInput.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    calendarDays.appendChild(button);
  }

  const earliestMonth = new Date(earliestBookingDate.getFullYear(), earliestBookingDate.getMonth(), 1);
  previousMonthButton.disabled = calendarMonth <= earliestMonth;
};

function openDatePicker(input) {
  activeDateInput = input;
  const selected = input.value ? parseDateValue(input.value) : earliestBookingDate;
  calendarMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
  renderCalendar();
  calendarOverlay.hidden = false;
  document.body.classList.add('calendar-open');
  calendarOverlay.querySelector('.calendar-close').focus();
}

function closeDatePicker() {
  calendarOverlay.hidden = true;
  document.body.classList.remove('calendar-open');
  activeDateInput?.focus();
}

previousMonthButton.addEventListener('click', () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderCalendar();
});
calendarOverlay.querySelector('.calendar-next').addEventListener('click', () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderCalendar();
});
calendarOverlay.querySelector('.calendar-close').addEventListener('click', closeDatePicker);
calendarOverlay.addEventListener('click', (event) => {
  if (event.target === calendarOverlay) closeDatePicker();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !calendarOverlay.hidden) closeDatePicker();
});

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const datesAreValid = dateInputs.every((input) => validateBookingDate(input));
  if (!datesAreValid || !bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '送信中...';

  const data = new FormData(bookingForm);
  fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        window.location.href = 'thanks.html';
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する ›';
        alert('送信に失敗しました。お電話（082-222-6671）にてご連絡ください。');
      }
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する ›';
      alert('通信エラーが発生しました。お電話（082-222-6671）にてご連絡ください。');
    });
});
