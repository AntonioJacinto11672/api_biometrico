const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../TimeNet.db', sqlite3.OPEN_READONLY);
const counts = ['hr_employee','att_punches','hr_department','att_terminal','att_shift','att_timetable','att_day_summary','att_day_details','hr_biotemplate','att_terminal_events'];
let done = 0;
counts.forEach(t => {
  db.get('SELECT COUNT(*) as cnt FROM ' + t, [], (err, row) => {
    console.log(t + ':' + (err ? 'ERR' : row.cnt));
    done++;
    if(done === counts.length) db.close();
  });
});
