function body_(e) { try { return e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; } catch (_) { throw new Error('Invalid JSON body.'); } }
function path_(e) { return (e.parameter.path || '/').replace(/\/+$/, '') || '/'; }
