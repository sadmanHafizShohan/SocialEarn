function supportMessages_(user) {
  const messages = records_('SupportMessages');
  const visible = user.role === 'admin' ? messages : messages.filter(function(item) { return String(item.userId) === String(user.userId); });
  return visible.map(function(item) {
    const account = find_('Users', 'userId', item.userId);
    return Object.assign({}, item, { userEmail: account ? account.email : item.userId });
  }).sort(function(a, b) {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

function addSupportMessage_(user, body) {
  const message = String(body.message || '').trim();
  if (!message || message.length > 2000) throw new Error('Message must be between 1 and 2000 characters.');
  const targetUserId = user.role === 'admin' && body.userId ? String(body.userId) : user.userId;
  if (!find_('Users', 'userId', targetUserId)) throw new Error('User not found.');
  return insert_('SupportMessages', {
    messageId: id_(), userId: targetUserId, senderRole: user.role === 'admin' ? 'admin' : 'user',
    message: message, createdAt: now_(), readAt: ''
  });
}
