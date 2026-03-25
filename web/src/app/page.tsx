import { listSites } from '@/lib/sites';

export default function HomePage() {
  const sites = listSites();
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <h1>DuoCode Demos</h1>
        <p>{sites.length} sites generated</p>
        <ul>
          {sites.map(s => (
            <li key={s.slug}>
              <a href={`/demo/${s.slug}`}>{s.businessName}</a>
              <small> ({s.industry} / {s.archetype})</small>
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
}
