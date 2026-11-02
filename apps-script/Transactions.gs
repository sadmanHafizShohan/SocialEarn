function transactions_(userId) { return records_('Transactions').filter(function(item) { return item.userId === userId; }).reverse().slice(0, 100); }
