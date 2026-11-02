export default async function handler(req, res) {
  const base = process.env.APPS_SCRIPT_WEB_APP_URL;
  if (!base) return res.status(500).json({ success: false, message: 'Backend URL is not configured.' });
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const path = req.url.replace(/^\/api\/?/, '').split('?')[0];
  const query = req.url.includes('?') ? `?${req.url.split('?')[1]}` : '';
  const token = req.headers.authorization || '';
  try {
    const upstreamMethod = ['PATCH', 'DELETE'].includes(req.method) ? 'POST' : req.method;
    const upstreamQuery = `path=${encodeURIComponent(`/${path}`)}&proxySecret=${encodeURIComponent(process.env.APPS_SCRIPT_PROXY_SECRET || '')}${token ? `&idToken=${encodeURIComponent(token.replace(/^Bearer\s+/i, ''))}` : ''}${query ? `&${query.slice(1)}` : ''}`;
    const response = await fetch(`${base.replace(/\/$/, '')}?${upstreamQuery}`, {
      method: upstreamMethod,
      headers: { 'Content-Type': 'application/json', Authorization: token, 'X-Proxy-Secret': process.env.APPS_SCRIPT_PROXY_SECRET || '' },
      body: ['GET'].includes(req.method) ? undefined : JSON.stringify(['PATCH', 'DELETE'].includes(req.method) ? { ...(req.body || {}), _method: req.method } : (req.body || {}))
    });
    const text = await response.text(); let payload;
    try { payload = JSON.parse(text); } catch { payload = { success: false, message: 'Invalid backend response.' }; }
    return res.status(response.ok ? 200 : response.status).json(payload);
  } catch (error) { return res.status(502).json({ success: false, message: 'Backend unavailable.' }); }
}
