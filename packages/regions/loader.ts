import { RegionConfig } from './region-config';
import { MY_REGION } from './my';

const REGION_REGISTRY: Record<string, RegionConfig> = {
  my: MY_REGION,
};

export function loadRegion(regionId: string): RegionConfig {
  const region = REGION_REGISTRY[regionId];
  if (!region) {
    const available = Object.keys(REGION_REGISTRY).join(', ');
    throw new Error(`Unknown region "${regionId}". Available: ${available}`);
  }
  return region;
}

export function getDefaultRegion(): RegionConfig {
  return REGION_REGISTRY.my;
}

export function listRegions(): string[] {
  return Object.keys(REGION_REGISTRY);
}

// Re-export for convenience
export { RegionConfig } from './region-config';
