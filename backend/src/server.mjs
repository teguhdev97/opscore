import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { HttpError, generateReply, isConfigured, readConfig, validateMessages } from './chat.mjs';

const maxBodyBytes = 70000;
async function readJson(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'Gunakan application/json.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new HttpError(413, 'Permintaan terlalu besar.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'JSON tidak valid.'); }
}

// Single-process demo limits. IP comes from the socket, never untrusted forwarded headers.
export function createApp(config = readConfig(), providerFetch = fetch) {
  const clients = new Map();
  let minute = 0, requests = 0, day = 0, dailyRequests = 0, active = 0;
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin;
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    if (origin && config.origins.includes(origin)) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    const reply = (status, body) => { res.writeHead(status, headers); res.end(JSON.stringify(body)); };
    try {
      const path = req.url?.split('?')[0];
      if (origin && !config.origins.includes(origin)) throw new HttpError(403, 'Origin tidak diizinkan.');
      if (req.method === 'OPTIONS') { res.writeHead(204, headers); res.end(); return; }
      if (req.method === 'GET' && path === '/health') { reply(200, { status: 'ok' }); return; }
      if (req.method === 'GET' && path === '/api/chat/status') { reply(200, { configured: isConfigured(config) }); return; }
      if (req.method !== 'POST' || path !== '/api/chat') throw new HttpError(404, 'Endpoint tidak ditemukan.');
      // CORS is not authentication. Global caps also apply to non-browser clients.
      if (!origin || !config.origins.includes(origin)) throw new HttpError(403, 'Origin diperlukan.');
      if (!isConfigured(config)) throw new HttpError(503, 'AI belum diaktifkan. Gunakan FAQ produk.');
      const currentMinute = Math.floor(Date.now() / 60000);
      const currentDay = Math.floor(Date.now() / 86400000);
      if (minute !== currentMinute) { minute = currentMinute; requests = 0; clients.clear(); }
      if (day !== currentDay) { day = currentDay; dailyRequests = 0; }
      const ip = req.socket.remoteAddress;
      const count = clients.get(ip) || 0;
      if (count >= 10 || requests >= 30 || dailyRequests >= 300 || active >= 3) {
        headers['Retry-After'] = dailyRequests >= 300 ? '3600' : '60';
        throw new HttpError(429, 'Batas demo tercapai. Coba lagi nanti atau gunakan FAQ.');
      }
      clients.set(ip, count + 1); requests++; dailyRequests++;
      active++;
      try {
        const messages = validateMessages(await readJson(req));
        const text = await generateReply(config, messages, providerFetch);
        reply(200, { reply: text, source: 'ai' });
      } finally { active--; }
    } catch (error) { reply(error instanceof HttpError ? error.status : 500, { error: error instanceof HttpError ? error.message : 'Terjadi kesalahan server.' }); }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 8080);
  createApp().listen(port, process.env.HOST || '127.0.0.1', () => console.log(`OpsCore backend listening on port ${port}`));
}
