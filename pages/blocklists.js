import { useEffect, useState } from 'react';

export default function BlocklistsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [found, setFound] = useState(null);
  const [domains, setDomains] = useState(null);
  const [dnsResult, setDnsResult] = useState(null);

  useEffect(() => {
    fetch('/api/blocklists')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
    fetch('/api/blocklists?domains=1')
      .then(r => r.json())
      .then(json => setDomains(json.domains || []));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search || !domains) return;
    setFound(domains.includes(search.toLowerCase()));
    setDnsResult('...');
    try {
      const res = await fetch(`/api/doh?name=${encodeURIComponent(search)}&type=A`);
      const json = await res.json();
      if (json.error) {
        setDnsResult(json.error);
      } else if (json.data && json.data.Answer && json.data.Answer.length > 0) {
        setDnsResult(json.data.Answer.map(a => a.data).join(', '));
      } else {
        setDnsResult('Keine Antwort');
      }
    } catch (e) {
      setDnsResult('Fehler: ' + e.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 font-sans px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Blocklisten Übersicht</h1>
      {loading && <p className="text-center">Lade...</p>}
      {data && (
        <>
          <p className="mb-2 text-sm text-gray-500">Letztes Update: {new Date(data.lastUpdate).toLocaleString()}</p>
          <p className="mb-4 text-lg">Gesamtzahl geblockter Domains: <b>{data.totalDomains}</b></p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Quelle</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Anzahl</th>
                  <th className="p-2">Fehler</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((s, i) => (
                  <tr key={i} className={s.status === 'ok' ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="p-2 text-xs break-all"><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{s.url}</a></td>
                    <td className="p-2">{s.status}</td>
                    <td className="p-2">{s.count || '-'}</td>
                    <td className="p-2 text-red-600">{s.error || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Domain suchen (z.B. example.com)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Suchen</button>
          </form>
          {found !== null && (
            <div className="mb-2 text-center">
              {found === true && <span className="text-red-600 font-semibold">Domain ist geblockt!</span>}
              {found === false && <span className="text-green-600 font-semibold">Domain ist <b>nicht</b> geblockt.</span>}
            </div>
          )}
          {dnsResult && (
            <div className="mb-4 text-center text-sm">
              <span className="font-mono">DNS-Antwort: {dnsResult}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
} 