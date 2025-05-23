import collapsedStateSpec from './collapsed-state.spec';
import convertTimeSpec from './convert-time.spec';
import getStatsSpec from './get-stats.spec';
import mapEntitiesSpec from './map-entities.spec';
import showSectionSpec from './show-section.spec';
import skipEntitySpec from './skip-entity.spec';
import sortEntitiesSpec from './sort-entities.spec';
import toggleSectionSpec from './toggle-section.spec';

describe('common', () => {
  collapsedStateSpec();
  convertTimeSpec();
  getStatsSpec();
  mapEntitiesSpec();
  showSectionSpec();
  skipEntitySpec();
  sortEntitiesSpec();
  toggleSectionSpec();
});
