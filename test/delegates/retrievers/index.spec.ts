import deviceSpec from './device.spec';
import stateSpec from './state.spec';

export default () => {
  describe('retrievers', () => {
    deviceSpec();
    stateSpec();
  });
};
