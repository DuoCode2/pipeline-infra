export type LocaleKey = string;
export type LocalizedString = Record<string, string>;

export interface ServiceItem {
  name: string;
  description: string;
  price: string;
  popular?: boolean;
}

export interface SectionGroup {
  category: string;
  items: ServiceItem[];
}

export interface IndustryContent {
  taglines: LocalizedString[];
  cta: LocalizedString;
  menu?: Record<string, SectionGroup[]>;
  services?: Record<string, SectionGroup[]>;
  reviewTemplates: Record<string, string[]>;
}

export interface RegionContent {
  industries: Record<string, IndustryContent>;
  reviewAuthors: string[];
}
