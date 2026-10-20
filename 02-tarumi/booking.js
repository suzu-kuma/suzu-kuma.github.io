// 既存LPと同じ予約日制御・送信処理。
(function() {   var holidays = [     '2026-01-01','2026-01-12','2026-02-11','2026-02-23',     '2026-03-20','2026-04-29','2026-05-03','2026-05-04',     '2026-05-05','2026-05-06','2026-07-20','2026-08-11',     '2026-09-21','2026-09-22','2026-09-23','2026-10-12',     '2026-11-03','2026-11-23',     '2027-01-01','2027-01-11','2027-02-11','2027-02-23',     '2027-03-21','2027-03-22','2027-04-29','2027-05-03',     '2027-05-04','2027-05-05','2027-07-19','2027-08-11',     '2027-09-20','2027-09-23','2027-10-11','2027-11-03',     '2027-11-23'   ];   function isHoliday(str) { return holidays.indexOf(str) !== -1; }    var today = new Date();   today.setHours(0,0,0,0);   var minDate = new Date(today);   minDate.setDate(minDate.getDate() + 3);   var y = minDate.getFullYear();   var m = ('0' + (minDate.getMonth() + 1)).slice(-2);   var d = ('0' + minDate.getDate()).slice(-2);   var minStr = y + '-' + m + '-' + d;   ['date1','date2','date3'].forEach(function(n) {     var el = document.querySelector('input[name="' + n + '"]');     if (el) el.min = minStr;   });   document.addEventListener('change', function(e) {     if (!e.target.name || !['date1','date2','date3'].includes(e.target.name)) return;     var parts = e.target.value.split('-');     if (parts.length < 3) return;     var day = new Date(parts[0], parts[1] - 1, parts[2]).getDay();     if (day === 0 || day === 1 || isHoliday(e.target.value)) {       alert('休診日（日曜・月曜・祝日）のため選択できません。別の日程をお選びください。');       e.target.value = '';     }   }); })();

document.getElementById('reservation-form').addEventListener('submit', function(e) {   e.preventDefault();   var form = this;   var btn = form.querySelector('button[type="submit"]');   btn.disabled = true;   btn.textContent = '送信中...';   var data = new FormData(form);   fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })     .then(function(res) { return res.json(); })     .then(function(json) {       if (json.success) {         window.location.href = '/tarumi-thanks/';       } else {         alert('送信に失敗しました。お電話（082-222-6671）にてご連絡ください。');         btn.disabled = false;         btn.textContent = '送信する';       }     })     .catch(function() {       alert('送信に失敗しました。お電話（082-222-6671）にてご連絡ください。');       btn.disabled = false;       btn.textContent = '送信する';     }); });

// 希望日と時間を両方選ぶと、次の任意希望欄を表示します。
(function() {
  var form = document.getElementById('reservation-form');
  var second = document.getElementById('preference-2');
  var third = document.getElementById('preference-3');
  function complete(number) {
    var date = form.elements.namedItem('date' + number);
    var time = form.elements.namedItem('time' + number);
    return Boolean(date.value && time.value && date.checkValidity());
  }
  function updatePreferences() {
    second.hidden = !complete(1);
    second.disabled = second.hidden;
    third.hidden = second.hidden || !complete(2);
    third.disabled = third.hidden;
  }
  // 休診日制御で入力が取り消された後に、表示状態を更新します。
  document.addEventListener('change', function(event) {
    if (/^(date|time)[123]$/.test(event.target.name || '')) updatePreferences();
  });
  window.addEventListener('pageshow', updatePreferences);
  form.addEventListener('reset', function() { setTimeout(updatePreferences, 0); });
  updatePreferences();
})();
