const SHEETS = {
  Users: ['userId','firebaseUid','name','email','phone','profileImage','role','status','createdAt','updatedAt'],
  Tasks: ['taskId','title','description','platform','category','instructions','referenceUrl','referenceImage','points','maxParticipants','completedCount','startDate','expiryDate','status','createdBy','createdAt','updatedAt'],
  Submissions: ['submissionId','userId','taskId','screenshotFileId','screenshotMimeType','screenshotSize','pointsSnapshot','status','rejectionReason','reviewedBy','reviewedAt','createdAt','updatedAt'],
  UnlockRequests: ['requestId','userId','category','amountTaka','paymentMethod','phoneNumber','transactionId','screenshotFileId','screenshotMimeType','screenshotSize','status','adminNote','reviewedBy','reviewedAt','createdAt','updatedAt'],
  TaskUnlocks: ['unlockId','userId','category','requestId','unlockedAt'],
  SupportMessages: ['messageId','userId','senderRole','message','createdAt','readAt'],
  Referrals: ['referralId','userId','referralCode','referredByUserId','rewardedAt','createdAt'],
  Wallets: ['walletId','userId','availablePoints','reservedPoints','totalEarnedPoints','totalWithdrawnPoints','createdAt','updatedAt'],
  Transactions: ['transactionId','userId','type','points','referenceId','idempotencyKey','balanceBefore','balanceAfter','description','conversionRateSnapshot','createdAt'],
  Withdrawals: ['withdrawalId','userId','points','amountPaisa','paymentMethod','accountNumber','exchangeRateSnapshot','status','paymentReference','adminNote','processedBy','processedAt','createdAt','updatedAt'],
  Settings: ['settingKey','settingValue','updatedAt'],
  AdminLogs: ['logId','adminId','action','targetType','targetId','details','createdAt']
};
const DEFAULT_SETTINGS = { POINTS_PER_UNIT: 100, TAKA_PAISE_PER_UNIT: 1000, MINIMUM_WITHDRAW_POINTS: 1000, WITHDRAW_ENABLED: true };
function prop_(key) { return PropertiesService.getScriptProperties().getProperty(key); }
function now_() { return new Date().toISOString(); }
