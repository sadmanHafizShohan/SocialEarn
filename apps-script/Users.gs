function me_(user) { return { user: user, wallet: find_('Wallets', 'userId', user.userId), referral: referralProfile_(user.userId) }; }
function ensureWallet_(userId) { if (!find_('Wallets', 'userId', userId)) { const t = now_(); insert_('Wallets', { walletId: id_(), userId: userId, availablePoints: 0, reservedPoints: 0, totalEarnedPoints: 0, totalWithdrawnPoints: 0, createdAt: t, updatedAt: t }); } }
function mySubmissions_(user) {
  const tasks = records_('Tasks');
  return records_('Submissions').filter(function(item) { return item.userId === user.userId; }).reverse().map(function(item) {
    const task = tasks.find(function(candidate) { return candidate.taskId === item.taskId; });
    return Object.assign({}, item, { taskTitle: task ? task.title : item.taskId });
  });
}
