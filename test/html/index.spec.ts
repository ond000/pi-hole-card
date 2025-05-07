import bakePiSpec from './bake-pi.spec';
import componentsSpec from './components/index.spec';
import piCrustSpec from './pi-crust.spec';
import piFillingsSpec from './pi-fillings.spec';
import piFlavorsSpec from './pi-flavors.spec';
import stateDisplaySpec from './state-display.spec';
import versionItemSpec from './version-item.spec';

describe('html', () => {
  componentsSpec();
  bakePiSpec();
  piFillingsSpec();
  piCrustSpec();
  piFlavorsSpec();
  stateDisplaySpec();
  versionItemSpec();
});
