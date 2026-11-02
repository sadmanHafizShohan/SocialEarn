function reviewSubmission_(admin, submissionId, body) {
  requireAdmin_(admin);
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const submission = find_('Submissions', 'submissionId', submissionId);
    if (!submission || submission.status !== 'pending') throw new Error('Submission is no longer pending.');
    const task = task_(submission.taskId);
    if (body.status !== 'approved' && body.status !== 'rejected') throw new Error('Invalid review status.');
    const t = now_();
    if (body.status === 'approved') {
      if (Number(task.completedCount || 0) >= Number(task.maxParticipants)) throw new Error('Task participant limit has been reached.');
      const wallet = wallet_(submission.userId); const before = Number(wallet.availablePoints); const points = Number(submission.pointsSnapshot || task.points);
      update_('Wallets', 'userId', submission.userId, { availablePoints: before + points, totalEarnedPoints: Number(wallet.totalEarnedPoints) + points, updatedAt: t });
      transaction_(submission.userId, 'credit', points, submission.submissionId, `submission-credit-${submission.submissionId}`, before, before + points, 'Approved task submission');
      update_('Tasks', 'taskId', task.taskId, { completedCount: Number(task.completedCount || 0) + 1, updatedAt: t });
    }
    update_('Submissions', 'submissionId', submissionId, { status: body.status, rejectionReason: body.status === 'rejected' ? String(body.rejectionReason || 'Not approved') : '', reviewedBy: admin.userId, reviewedAt: t, updatedAt: t });
    insert_('AdminLogs', { logId: id_(), adminId: admin.userId, action: `submission_${body.status}`, targetType: 'submission', targetId: submissionId, details: String(body.rejectionReason || ''), createdAt: t });
    return find_('Submissions', 'submissionId', submissionId);
  } finally { lock.releaseLock(); }
}
