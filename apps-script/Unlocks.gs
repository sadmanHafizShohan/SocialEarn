const TASK_CATEGORIES = {
  Basic: { amountTaka: 250, points: 150 },
  Standard: { amountTaka: 450, points: 350 },
  Premium: { amountTaka: 850, points: 600 }
};

function categoryConfig_(category) {
  const config = TASK_CATEGORIES[String(category || '')];
  if (!config) throw new Error('Invalid task category.');
  return config;
}

function hasUnlockedCategory_(userId, category) {
  return records_('TaskUnlocks').some(function(unlock) {
    return String(unlock.userId) === String(userId) && String(unlock.category) === String(category);
  });
}

function unlockStatus_(userId) {
  const result = {};
  Object.keys(TASK_CATEGORIES).forEach(function(category) {
    result[category] = hasUnlockedCategory_(userId, category);
  });
  return result;
}

function unlockRequests_(user) {
  requireAdmin_(user);
  return records_('UnlockRequests').reverse().map(function(item) {
    const account = find_('Users', 'userId', item.userId);
    return Object.assign({}, item, { userName: account ? account.name : item.userId, userEmail: account ? account.email : '' });
  });
}

function myUnlockRequests_(user) {
  return records_('UnlockRequests').filter(function(item) {
    return String(item.userId) === String(user.userId);
  }).reverse();
}

function requestUnlock_(user, body) {
  const category = String(body.category || '');
  const config = categoryConfig_(category);
  if (hasUnlockedCategory_(user.userId, category)) throw new Error('This category is already unlocked.');
  if (records_('UnlockRequests').some(function(item) {
    return String(item.userId) === String(user.userId) && String(item.category) === category && item.status === 'pending';
  })) throw new Error('An unlock request is already pending for this category.');
  if (['bKash', 'Nagad'].indexOf(String(body.paymentMethod)) < 0) throw new Error('Select bKash or Nagad.');
  if (!/^01[3-9][0-9]{8}$/.test(String(body.phoneNumber || ''))) throw new Error('Enter a valid phone number.');
  if (!String(body.transactionId || '').trim()) throw new Error('Transaction ID is required.');
  const saved = saveScreenshot_(body, user.userId);
  const t = now_();
  return insert_('UnlockRequests', {
    requestId: id_(), userId: user.userId, category: category, amountTaka: config.amountTaka,
    paymentMethod: String(body.paymentMethod), phoneNumber: String(body.phoneNumber),
    transactionId: String(body.transactionId).trim(), screenshotFileId: saved.id,
    screenshotMimeType: body.mimeType, screenshotSize: saved.size, status: 'pending',
    adminNote: '', reviewedBy: '', reviewedAt: '', createdAt: t, updatedAt: t
  });
}

function reviewUnlock_(admin, requestId, body) {
  requireAdmin_(admin);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const request = find_('UnlockRequests', 'requestId', requestId);
    if (!request || request.status !== 'pending') throw new Error('Unlock request is no longer pending.');
    if (['approved', 'rejected'].indexOf(String(body.status)) < 0) throw new Error('Invalid unlock status.');
    const t = now_();
    const patch = {
      status: String(body.status), adminNote: String(body.adminNote || ''),
      reviewedBy: admin.userId, reviewedAt: t, updatedAt: t
    };
    if (body.status === 'approved') {
      if (!hasUnlockedCategory_(request.userId, request.category)) {
        insert_('TaskUnlocks', { unlockId: id_(), userId: request.userId, category: request.category, requestId: requestId, unlockedAt: t });
      }
    }
    return update_('UnlockRequests', 'requestId', requestId, patch);
  } finally {
    lock.releaseLock();
  }
}
