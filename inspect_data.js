const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../TimeNet.db', sqlite3.OPEN_READONLY);
const tables = ['hr_employee','hr_department','hr_company','att_punches','att_terminal','att_shift','att_timetable','hr_position','att_workcode','sys_user'];
let done = 0;
tables.forEach(t => {
  db.all('SELECT * FROM ' + t + ' LIMIT 3', [], (err, rows) => {
    console.log('=== ' + t + ' SAMPLE ===');
    if(err) console.log('ERR:'+err.message);
    else console.log(JSON.stringify(rows, null, 1));
    done++;
    if(done === tables.length) db.close();
  });
});
