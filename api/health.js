export default function handler(_req, res) { res.status(200).json({ success: true, service: 'socialearn-proxy', timestamp: new Date().toISOString() }); }
