import fetch from 'node-fetch';

const SOURCES = [
  'https://dnsforge.de/blocklist.list',
  'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
  'https://gitlab.com/quidsup/notrack-blocklists/raw/master/notrack-blocklist.txt',
  'https://gitlab.com/quidsup/notrack-blocklists/raw/master/notrack-malware.txt',
  'https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt',
  'https://big.oisd.nl/',
  'https://blocklistproject.github.io/Lists/basic.txt',
  'https://blocklistproject.github.io/Lists/phishing.txt',
  'https://blocklistproject.github.io/Lists/ransomware.txt',
  'https://blocklistproject.github.io/Lists/tracking.txt',
  'https://hole.cert.pl/domains/v2/domains.txt',
  'https://o0.pages.dev/Lite/adblock.txt',
  'https://perflyst.github.io/PiHoleBlocklist/AmazonFireTV.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/pro.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.amazon.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.apple.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.huawei.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.winoffice.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.tiktok.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.lgwebos.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.xiaomi.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.oppo-realme.txt',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/native.vivo.txt',
  'https://raw.githubusercontent.com/AssoEchap/stalkerware-indicators/master/generated/quad9_blocklist.txt',
  'https://adguardteam.github.io/HostlistsRegistry/assets/filter_50.txt',
  'https://phishing.army/download/phishing_army_blocklist.txt',
  'https://raw.githubusercontent.com/d3ward/toolz/master/src/d3host.txt',
  'https://malware-filter.gitlab.io/malware-filter/phishing-filter-agh.txt',
  // Adult
  'https://dnsforge.de/blocklist-clean.list',
  'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts',
  'https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/pornblock1',
  'https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/pornblock2',
  'https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/pornblock3',
  'https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/pornblock4',
  'https://raw.githubusercontent.com/blocklistproject/Lists/master/porn.txt',
  'https://www.technoy.de/lists/xporn.txt',
  'https://raw.githubusercontent.com/Bon-Appetit/porn-domains/master/block.txt',
  'https://nsfw.oisd.nl/',
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/nsfw.txt',
  // Gambling
  'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/gambling.txt',
];

// In-memory Cache
let cache = {
  lastUpdate: 0,
  sources: [],
  domains: new Set(),
};
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 Stunden

function parseDomains(text) {
  // Extrahiere Domains aus verschiedenen Formaten (hosts, plain, etc.)
  const lines = text.split('\n');
  const domains = new Set();
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) continue;
    // hosts-Format: 0.0.0.0 domain.com
    const parts = line.split(/\s+/);
    let domain = '';
    if (parts.length === 1) {
      domain = parts[0];
    } else if (parts.length > 1 && parts[1].includes('.')) {
      domain = parts[1];
    }
    // Filter offensichtliche IPs
    if (domain && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      domains.add(domain.toLowerCase());
    }
  }
  return domains;
}

async function loadBlocklists() {
  const results = [];
  let allDomains = new Set();
  await Promise.all(SOURCES.map(async (url) => {
    let status = 'ok', count = 0, error = null;
    try {
      const res = await fetch(url, { timeout: 20000 });
      if (!res.ok) throw new Error(res.statusText);
      const text = await res.text();
      const domains = parseDomains(text);
      count = domains.size;
      domains.forEach(d => allDomains.add(d));
    } catch (e) {
      status = 'error';
      error = e.message;
    }
    results.push({ url, status, count, error });
  }));
  return { results, allDomains };
}

export default async function handler(req, res) {
  if (cache.lastUpdate + CACHE_TTL < Date.now() || !cache.sources.length) {
    const { results, allDomains } = await loadBlocklists();
    cache = {
      lastUpdate: Date.now(),
      sources: results,
      domains: allDomains,
    };
  }
  const withDomains = req.query.domains === '1';
  res.status(200).json({
    lastUpdate: cache.lastUpdate,
    sources: cache.sources,
    totalDomains: cache.domains.size,
    ...(withDomains ? { domains: Array.from(cache.domains) } : {})
  });
}

// Hilfsfunktion für andere APIs
export function getBlocklistSet() {
  return cache.domains;
} 