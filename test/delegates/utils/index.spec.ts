import cardEntitiesSpec from './card-entities.spec';
import getConfigDeviceSpec from './get-config-device.spec';
import getPiHoleSpec from './get-pihole.spec';

export default () => {
  describe('utils', () => {
    describe('card-entities', cardEntitiesSpec);
    describe('get-pihole', getPiHoleSpec);
    describe('get-config-device', getConfigDeviceSpec);
  });
};
