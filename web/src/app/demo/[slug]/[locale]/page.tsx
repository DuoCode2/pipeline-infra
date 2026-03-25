import { getSiteData } from '@/lib/sites';
import { notFound } from 'next/navigation';
import { getArchetypeComponent } from '@/components/archetypes';

export default function LocalePage({ params }: { params: { slug: string; locale: string } }) {
  const site = getSiteData(params.slug);
  if (!site) notFound();

  const ArchetypePage = getArchetypeComponent(site.archetype);
  return <ArchetypePage site={site} locale={params.locale} />;
}
