import additionalStatSpec from './additional-stat.spec';
import bakePiSpec from './bake-pi.spec';
import piFlavorsSpec from './pi-flavors.spec';
import statBoxSpec from './stat-box.spec';
import stateDisplaySpec from './state-display.spec';
import versionItemSpec from './version-item.spec';

describe('html', () => {
  additionalStatSpec();
  bakePiSpec();
  piFlavorsSpec();
  stateDisplaySpec();
  statBoxSpec();
  versionItemSpec();
});
