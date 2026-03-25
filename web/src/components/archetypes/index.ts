import type { SiteData } from '@/types/site-data';
import { MenuOrderPage } from './MenuOrderPage';
import { BookingServicesPage } from './BookingServicesPage';
import { LeadTrustPage } from './LeadTrustPage';
import { EcommerceCatalogPage } from './EcommerceCatalogPage';
import { PortfolioGalleryPage } from './PortfolioGalleryPage';
import { MembershipSchedulePage } from './MembershipSchedulePage';
import { PropertyListingPage } from './PropertyListingPage';
import { CommunityInfoPage } from './CommunityInfoPage';

type ArchetypeComponent = (props: { site: SiteData; locale: string }) => React.ReactNode;

const ARCHETYPE_COMPONENTS: Record<string, ArchetypeComponent> = {
  'menu-order': MenuOrderPage,
  'booking-services': BookingServicesPage,
  'lead-trust': LeadTrustPage,
  'ecommerce-catalog': EcommerceCatalogPage,
  'portfolio-gallery': PortfolioGalleryPage,
  'membership-schedule': MembershipSchedulePage,
  'property-listing': PropertyListingPage,
  'community-info': CommunityInfoPage,
};

export function getArchetypeComponent(archetype: string): ArchetypeComponent {
  return ARCHETYPE_COMPONENTS[archetype] || LeadTrustPage;
}
