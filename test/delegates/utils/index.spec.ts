import cardEntitiesSpec from './card-entities.spec';
import getConfigDeviceSpec from './get-config-device.spec';
import getPiHoleSpec from './get-pihole.spec';
import getSetupSpec from './get-setup.spec';
import pauseHoleSpec from './pause-hole.spec';

export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    getConfigDeviceSpec();
    getPiHoleSpec();
    getSetupSpec();
    pauseHoleSpec();
  });
};
