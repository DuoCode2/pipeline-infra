import { redirect, notFound } from 'next/navigation';
import { getSiteData } from '@/lib/sites';

export default function SlugPage({ params }: { params: { slug: string } }) {
  const site = getSiteData(params.slug);
  if (!site) notFound();
  redirect(`/demo/${params.slug}/${site.region.defaultLocale}`);
}

export function generateStaticParams() {
  const { listSites } = require('@/lib/sites');
  return listSites().map((s: { slug: string }) => ({ slug: s.slug }));
}
