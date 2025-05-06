import formatNumberSpec from './format_number.spec';
import roundSpec from './round.spec';

export default () => {
  describe('number', () => {
    roundSpec();
    formatNumberSpec();
  });
};
