import additionalStatSpec from './additional-stat.spec';
import bakePiSpec from './bake-pi.spec';
import piFlavorsSpec from './pi-flavors.spec';
import piToppingsSpec from './pi-toppings.spec';
import statBoxSpec from './stat-box.spec';
import stateDisplaySpec from './state-display.spec';
import versionItemSpec from './version-item.spec';

describe('html', () => {
  additionalStatSpec();
  bakePiSpec();
  piFlavorsSpec();
  piToppingsSpec();
  stateDisplaySpec();
  statBoxSpec();
  versionItemSpec();
});
