import actionControlSpec from './action-control.spec';
import additionalStatSpec from './additional-stat.spec';
import statBoxSpec from './stat-box.spec';

export default () => {
  describe('components', () => {
    additionalStatSpec();
    actionControlSpec();
    statBoxSpec();
  });
};
