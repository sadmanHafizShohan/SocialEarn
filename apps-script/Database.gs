function db_() {
  const id = prop_('SPREADSHEET_ID'); if (!id) throw new Error('SPREADSHEET_ID is not configured.');
  return SpreadsheetApp.openById(id);
}
function setupDatabase() {
  const book = db_();
  Object.keys(SHEETS).forEach(function(name) {
    let sheet = book.getSheetByName(name); if (!sheet) sheet = book.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]);
    else {
      const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
      SHEETS[name].forEach(function(field) {
        if (headers.indexOf(field) < 0) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(field);
          headers.push(field);
        }
      });
    }
  });
  Object.keys(DEFAULT_SETTINGS).forEach(function(key) { if (!find_('Settings', 'settingKey', key)) insert_('Settings', { settingKey: key, settingValue: String(DEFAULT_SETTINGS[key]), updatedAt: now_() }); });
  return { success: true, message: 'Database initialized.' };
}
function sheet_(name) { const sheet = db_().getSheetByName(name); if (!sheet) throw new Error(`Missing sheet: ${name}`); return sheet; }
function records_(name) { const sheet = sheet_(name); const rows = sheet.getDataRange().getValues(); if (rows.length < 2) return []; const headers = rows[0].map(String); return rows.slice(1).map(function(row) { const item = {}; headers.forEach(function(key, i) { item[key] = row[i] === undefined ? '' : row[i]; }); return item; }); }
function find_(name, field, value) { return records_(name).find(function(item) { return String(item[field]) === String(value); }) || null; }
function insert_(name, item) { const sheet = sheet_(name); const fields = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String); sheet.appendRow(fields.map(function(field) { return item[field] === undefined ? '' : item[field]; })); return item; }
function update_(name, field, value, patch) { const sheet = sheet_(name); const rows = sheet.getDataRange().getValues(); const headers = rows[0].map(String); const index = headers.indexOf(field); const rowIndex = rows.findIndex(function(row, i) { return i > 0 && String(row[index]) === String(value); }); if (rowIndex < 1) throw new Error('Record not found.'); const next = Object.assign({}, patch); Object.keys(next).forEach(function(key) { const col = headers.indexOf(key); if (col >= 0) sheet.getRange(rowIndex + 1, col + 1).setValue(next[key]); }); return Object.assign({}, find_(name, field, value), patch); }
function id_() { return Utilities.getUuid(); }
