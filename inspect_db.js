const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../TimeNet.db', sqlite3.OPEN_READONLY);
db.all("SELECT name,type FROM sqlite_master WHERE type IN ('table','view') ORDER BY type,name", [], (err, rows) => {
  if(err){ console.error(err); db.close(); return; }
  console.log('TABLES_AND_VIEWS:' + JSON.stringify(rows));
  db.close();
});
