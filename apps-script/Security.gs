function json_(success, message, data, status) { return ContentService.createTextOutput(JSON.stringify({ success: success, message: message || '', data: data || null, error: success ? null : message })).setMimeType(ContentService.MimeType.JSON); }
function bearer_(e) {
  const header = (e && e.headers && (e.headers.Authorization || e.headers.authorization)) || '';
  const queryToken = e && e.parameter && e.parameter.idToken ? e.parameter.idToken : '';
  return (header || queryToken).replace(/^Bearer\s+/i, '');
}
function verifyFirebase_(token) {
  if (!token) throw new Error('Authentication required.');
  const key = prop_('FIREBASE_WEB_API_KEY'); if (!key) throw new Error('FIREBASE_WEB_API_KEY is not configured.');
  const response = UrlFetchApp.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, { method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: token }), muteHttpExceptions: true });
  const body = JSON.parse(response.getContentText()); if (response.getResponseCode() !== 200 || !body.users || !body.users[0]) throw new Error('Invalid authentication token.');
  return body.users[0];
}
function currentUser_(e) { const firebase = verifyFirebase_(bearer_(e)); let user = find_('Users', 'firebaseUid', firebase.localId); if (!user) { const created = now_(); user = insert_('Users', { userId: id_(), firebaseUid: firebase.localId, name: firebase.displayName || firebase.email.split('@')[0], email: firebase.email, phone: firebase.phoneNumber || '', profileImage: firebase.photoUrl || '', role: 'user', status: 'active', createdAt: created, updatedAt: created }); ensureWallet_(user.userId); } referralProfile_(user.userId); if (user.status === 'blocked') throw new Error('This account is blocked.'); return user; }
function requireAdmin_(user) { if (user.role !== 'admin') throw new Error('Administrator access required.'); }
