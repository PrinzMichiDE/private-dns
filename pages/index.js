import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const KNOWN_DOH = [
  { name: 'dnsforge.de', url: 'https://dnsforge.de/dns-query' },
  { name: 'Google', url: 'https://dns.google/resolve' },
  { name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'Quad9', url: 'https://dns.quad9.net/dns-query' },
];

export default function Home() {
  const [dohUrl, setDohUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('dohUrl');
    if (saved) setDohUrl(saved);
  }, []);

  const handleChange = e => setDohUrl(e.target.value);
  const handleSelect = e => setDohUrl(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    if (!dohUrl) return;
    localStorage.setItem('dohUrl', dohUrl);
    router.push('/blocklists');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">DNS-over-HTTPS Blocklisten-Tool</h1>
        <p className="mb-4 text-gray-600 text-center">
          Trage die URL deines gewünschten DoH-Servers ein oder wähle einen bekannten Anbieter aus.<br/>
          <span className="text-xs text-gray-400">(Die DNS-Anfragen werden direkt im Browser über DoH gestellt – keine Daten werden an diesen Server weitergeleitet!)</span>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            className="border rounded px-3 py-2"
            value={KNOWN_DOH.find(s => s.url === dohUrl) ? dohUrl : ''}
            onChange={handleSelect}
          >
            <option value="">Bekannte DoH-Server wählen...</option>
            {KNOWN_DOH.map(s => (
              <option key={s.url} value={s.url}>{s.name} ({s.url})</option>
            ))}
          </select>
          <input
            type="text"
            className="border rounded px-3 py-2"
            placeholder="Eigene DoH-URL (z.B. https://dnsforge.de/dns-query)"
            value={dohUrl}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={!dohUrl}
          >Weiter</button>
        </form>
      </div>
    </div>
  );
} 