function authorizedProxy_(e) { const expected = prop_('PROXY_SHARED_SECRET'); return expected && e.parameter.proxySecret === expected; }
function dashboardData_(user) {
  const submissions = records_('Submissions').filter(function(item) { return item.userId === user.userId; }).reverse();
  const tasks = records_('Tasks');
  const transactions = transactions_(user.userId);
  return {
    wallet: wallet_(user.userId),
    stats: {
      completedTasks: submissions.filter(function(item) { return item.status === 'approved'; }).length,
      pendingSubmissions: submissions.filter(function(item) { return item.status === 'pending'; }).length,
      rejectedSubmissions: submissions.filter(function(item) { return item.status === 'rejected'; }).length
    },
    recentSubmissions: submissions.slice(0, 10).map(function(item) {
      const task = tasks.find(function(candidate) { return candidate.taskId === item.taskId; });
      return Object.assign({}, item, { taskTitle: task ? task.title : item.taskId });
    }),
    recentTransactions: transactions.slice(0, 10)
  };
}
function screenshotForAdmin_(admin, submissionId) {
  requireAdmin_(admin);
  const submission = find_('Submissions', 'submissionId', submissionId);
  if (!submission || !submission.screenshotFileId) throw new Error('Screenshot not found.');
  const blob = DriveApp.getFileById(submission.screenshotFileId).getBlob();
  return { mimeType: blob.getContentType(), content: Utilities.base64Encode(blob.getBytes()) };
}
function unlockScreenshotForAdmin_(admin, requestId) {
  requireAdmin_(admin);
  const request = find_('UnlockRequests', 'requestId', requestId);
  if (!request || !request.screenshotFileId) throw new Error('Payment screenshot not found.');
  const blob = DriveApp.getFileById(request.screenshotFileId).getBlob();
  return { mimeType: blob.getContentType(), content: Utilities.base64Encode(blob.getBytes()) };
}
function doGet(e) { try { if (!authorizedProxy_(e)) throw new Error('Invalid proxy authorization.'); if (path_(e) === '/health') return json_(true, 'Healthy', { service: 'SocialEarn Apps Script' }); const user = currentUser_(e); const path = path_(e); if (path === '/auth/me' || path === '/users/me') return json_(true, 'OK', me_(user)); if (path === '/dashboard') return json_(true, 'OK', dashboardData_(user)); if (path === '/submissions/my') return json_(true, 'OK', { items: mySubmissions_(user) }); if (path === '/tasks') return json_(true, 'OK', { items: listTasks_(user) }); if (path.indexOf('/tasks/') === 0) { var task = task_(path.split('/')[2], user); return json_(true, 'OK', taskView_(task, user)); } if (path === '/unlock/status') return json_(true, 'OK', { categories: unlockStatus_(user.userId), requests: myUnlockRequests_(user) }); if (path === '/support/messages') return json_(true, 'OK', { items: supportMessages_(user) }); if (path === '/referral/profile') return json_(true, 'OK', referralProfile_(user.userId)); if (path === '/wallet') return json_(true, 'OK', wallet_(user.userId)); if (path === '/transactions') return json_(true, 'OK', { items: transactions_(user.userId) }); if (path === '/withdrawals/my') return json_(true, 'OK', { items: records_('Withdrawals').filter(function(x) { return x.userId === user.userId; }).reverse() }); if (path === '/admin/dashboard') return json_(true, 'OK', dashboard_(user)); if (path === '/admin/tasks') return json_(true, 'OK', { items: adminTasks_(user) }); if (path === '/admin/submissions') return json_(true, 'OK', { items: adminSubmissions_(user) }); if (path === '/admin/unlocks') return json_(true, 'OK', { items: unlockRequests_(user) }); if (path === '/admin/transactions') return json_(true, 'OK', { items: adminTransactions_(user) }); if (path.indexOf('/admin/submissions/') === 0 && path.indexOf('/screenshot') > 0) return json_(true, 'OK', screenshotForAdmin_(user, path.split('/')[3])); if (path.indexOf('/admin/unlocks/') === 0 && path.indexOf('/screenshot') > 0) return json_(true, 'OK', unlockScreenshotForAdmin_(user, path.split('/')[3])); if (path === '/admin/users') return json_(true, 'OK', { items: adminUsers_(user) }); if (path === '/admin/withdrawals') return json_(true, 'OK', { items: adminWithdrawals_(user) }); if (path === '/admin/settings') return json_(true, 'OK', { items: adminSettings_(user) }); if (path === '/admin/logs') return json_(true, 'OK', { items: adminLogs_(user) }); throw new Error('Route not found.'); } catch (error) { return json_(false, error.message, null); } }
function doPost(e) { try { if (!authorizedProxy_(e)) throw new Error('Invalid proxy authorization.'); const user = currentUser_(e); const path = path_(e); const body = body_(e); if (path === '/submissions') return json_(true, 'Submitted', submit_(user, body)); if (path === '/referral/apply') return json_(true, 'Referral code applied', applyReferral_(user, body)); if (path === '/unlock/requests') return json_(true, 'Unlock request submitted', requestUnlock_(user, body)); if (path === '/support/messages') return json_(true, 'Message sent', addSupportMessage_(user, body)); if (path === '/withdrawals') return json_(true, 'Withdrawal requested', requestWithdrawal_(user, body)); if (path === '/admin/tasks') return json_(true, 'Task created', createTask_(user, body)); if (body._method === 'PATCH' && path.indexOf('/admin/unlocks/') === 0) return json_(true, 'Unlock reviewed', reviewUnlock_(user, path.split('/')[3], body)); if (body._method === 'PATCH' && path.indexOf('/admin/submissions/') === 0) return json_(true, 'Submission reviewed', reviewSubmission_(user, path.split('/')[3], body)); if (body._method === 'PATCH' && path.indexOf('/admin/tasks/') === 0) return json_(true, 'Task updated', updateTask_(user, path.split('/')[3], body)); if (body._method === 'PATCH' && path.indexOf('/admin/users/') === 0) return json_(true, 'User updated', updateUserStatus_(user, path.split('/')[3], body.status)); if (body._method === 'PATCH' && path.indexOf('/admin/withdrawals/') === 0) return json_(true, 'Withdrawal reviewed', reviewWithdrawal_(user, path.split('/')[3], body)); if (body._method === 'PATCH' && path === '/admin/settings') return json_(true, 'Setting updated', updateSetting_(user, body.settingKey, body.settingValue)); if (body._method === 'DELETE' && path.indexOf('/admin/tasks/') === 0) return json_(true, 'Task archived', deleteTask_(user, path.split('/')[3])); throw new Error('Route not found.'); } catch (error) { return json_(false, error.message, null); } }
function doPatch(e) { return doPost(e); }
function doDelete(e) { try { if (!authorizedProxy_(e)) throw new Error('Invalid proxy authorization.'); const user = currentUser_(e); const path = path_(e); if (path.indexOf('/admin/tasks/') === 0) return json_(true, 'Task archived', deleteTask_(user, path.split('/')[3])); throw new Error('Route not found.'); } catch (error) { return json_(false, error.message, null); } }
