const DEFAULT_REFERRAL_CODE = 'SE-C7A4AEF1';
const DEFAULT_REFERRAL_USER_ID = 'SYSTEM_REFERRAL';

function ensureDefaultReferral_() {
  if (!find_('Referrals', 'referralCode', DEFAULT_REFERRAL_CODE)) {
    insert_('Referrals', {
      referralId: id_(), userId: DEFAULT_REFERRAL_USER_ID,
      referralCode: DEFAULT_REFERRAL_CODE, referredByUserId: '',
      rewardedAt: '', createdAt: now_()
    });
  }
}

function referralProfile_(userId) {
  ensureDefaultReferral_();
  let profile = find_('Referrals', 'userId', userId);
  if (profile) return profile;
  let code = '';
  do {
    code = `SE-${Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
  } while (find_('Referrals', 'referralCode', code));
  profile = insert_('Referrals', {
    referralId: id_(), userId: userId, referralCode: code,
    referredByUserId: '', rewardedAt: '', createdAt: now_()
  });
  return profile;
}

function hasReferral_(userId) {
  return Boolean(String(referralProfile_(userId).referredByUserId || '').trim());
}

function applyReferral_(user, body) {
  const code = String(body.referralCode || '').trim().toUpperCase();
  if (!code) throw new Error('Referral code is required.');
  const own = referralProfile_(user.userId);
  if (own.referredByUserId) throw new Error('A referral code has already been applied.');
  const referrer = find_('Referrals', 'referralCode', code);
  if (!referrer) throw new Error('Invalid referral code.');
  if (String(referrer.userId) === String(user.userId)) throw new Error('You cannot use your own referral code.');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const current = referralProfile_(user.userId);
    if (current.referredByUserId) throw new Error('A referral code has already been applied.');
    const t = now_();
    update_('Referrals', 'userId', user.userId, { referredByUserId: referrer.userId });
    const wallet = wallet_(referrer.userId);
    const rewardPoints = 100;
    const referralBefore = Number(wallet.referralPoints || 0);
    const referralAfter = referralBefore + rewardPoints;
    update_('Wallets', 'userId', referrer.userId, {
      referralPoints: referralAfter,
      totalEarnedPoints: Number(wallet.totalEarnedPoints || 0) + rewardPoints,
      updatedAt: t
    });
    transaction_(referrer.userId, 'referral', rewardPoints, user.userId, `referral-reward-${user.userId}`, referralBefore, referralAfter, 'Referral reward');
    update_('Referrals', 'userId', user.userId, { rewardedAt: t });
    return referralProfile_(user.userId);
  } finally {
    lock.releaseLock();
  }
}
