# DNS-over-HTTPS (DoH) Server mit Blocklisten

Dieses Projekt stellt eine DNS-over-HTTPS (DoH) API bereit, die Blocklisten verwendet. Ideal für Deployment auf Vercel.

## Starten (lokal)

1. Abhängigkeiten installieren:
   ```
   npm install
   ```
2. Blocklisten in `blocklists/` ablegen (Beispiel: `example.txt`)
3. Server lokal starten:
   ```
   npm run dev
   ```
   (API unter http://localhost:3000/api/doh)

## Deployment auf Vercel
- Push das Projekt zu GitHub/GitLab/Bitbucket.
- Deploye es auf [vercel.com](https://vercel.com/docs/frameworks/nextjs).
- Die API ist dann z.B. unter `https://dein-projekt.vercel.app/api/doh` erreichbar.

## Blocklisten
- Jede Zeile eine Domain, die geblockt werden soll.
- Beispiel: `blocklists/example.txt`

## Hinweise
- Nur DoH wird unterstützt (kein DoT).
- Blocklisten werden beim Start geladen und geprüft. 