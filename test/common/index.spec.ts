import getStatsSpec from './get-stats.spec';
import mapEntitiesSpec from './map-entities.spec';
import showSectionSpec from './show-section.spec';
import skipEntitySpec from './skip-entity.spec';
import toggleSectionSpec from './toggle-section.spec';

describe('common', () => {
  getStatsSpec();
  mapEntitiesSpec();
  showSectionSpec();
  skipEntitySpec();
  toggleSectionSpec();
});
