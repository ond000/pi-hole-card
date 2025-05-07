import additionalStatSpec from './additional-stat.spec';
import piToppingsSpec from './pi-toppings.spec';
import statBoxSpec from './stat-box.spec';

export default () => {
  describe('components', () => {
    additionalStatSpec();
    piToppingsSpec();
    statBoxSpec();
  });
};
