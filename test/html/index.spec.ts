import bakePiSpec from './bake-pi.spec';
import componentsSpec from './components/index.spec';
import piCrustSpec from './pi-crust.spec';
import piFillingsSpec from './pi-fillings.spec';
import piFlavorsSpec from './pi-flavors.spec';
import piToppingsSpec from './pi-toppings.spec';
import stateDisplaySpec from './state-display.spec';

describe('html', () => {
  componentsSpec();
  bakePiSpec();
  piFillingsSpec();
  piCrustSpec();
  piFlavorsSpec();
  piToppingsSpec();
  stateDisplaySpec();
});
