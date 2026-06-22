const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../TimeNet.db', sqlite3.OPEN_READONLY);
db.all("SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, rows) => {
  if(err){ console.error(err); db.close(); return; }
  rows.forEach(r => console.log('TABLE:' + r.name + '\nSQL:' + r.sql + '\n---'));
  db.close();
});
