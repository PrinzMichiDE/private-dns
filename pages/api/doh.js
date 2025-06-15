import { getBlocklistSet } from './blocklists';

export default async function handler(req, res) {
  let name = req.method === 'POST' ? req.body.name : req.query.name;
  let type = req.method === 'POST' ? req.body.type : req.query.type || 'A';
  if (!name) {
    res.status(400).json({ error: 'Fehlender Domainname' });
    return;
  }
  const blocklist = getBlocklistSet();
  if (blocklist.has(name.toLowerCase())) {
    res.status(403).json({ error: 'Domain geblockt', name });
    return;
  }
  // Upstream-DoH-Request (Google)
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  try {
    const dohRes = await fetch(url, { headers: { accept: 'application/dns-json' } });
    if (!dohRes.ok) {
      res.status(502).json({ error: 'Fehler beim Upstream-Resolver' });
      return;
    }
    const data = await dohRes.json();
    res.status(200).json({ name, type, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
} 