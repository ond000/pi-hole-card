import actionControlSpec from './action-control.spec';
import additionalStatSpec from './additional-stat.spec';
import statBoxSpec from './stat-box.spec';
import stateContentSpec from './state-content.spec';
import stateDisplaySpec from './state-display.spec';
import versionItemSpec from './version-item.spec';

export default () => {
  describe('components', () => {
    additionalStatSpec();
    actionControlSpec();
    statBoxSpec();
    stateContentSpec();
    stateDisplaySpec();
    versionItemSpec();
  });
};
