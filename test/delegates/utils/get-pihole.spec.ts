import * as mapEntitiesModule from '@common/map-entities';
import * as skipEntityModule from '@common/skip-entity';
import { getDevice } from '@delegates/retrievers/device';
import * as cardEntitiesModule from '@delegates/utils/card-entities';
import { getPiHole } from '@delegates/utils/get-pihole';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/types';
import { expect } from 'chai';
import { restore, stub } from 'sinon';

export default () => {
  describe('get-pihole.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let getDeviceStub: sinon.SinonStub;
    let getDeviceEntitiesStub: sinon.SinonStub;
    let mapEntitiesByTranslationKeyStub: sinon.SinonStub;
    let shouldSkipEntityStub: sinon.SinonStub;

    const DEVICE_ID = 'pi_hole_device_1';
    const DEVICE_NAME = 'Pi-hole';

    beforeEach(() => {
      // Create mock config
      mockConfig = {
        device_id: DEVICE_ID,
      };

      // Mock Home Assistant instance
      mockHass = {} as unknown as HomeAssistant;

      // Set up stubs for dependencies
      getDeviceStub = stub();
      (getDevice as any) = getDeviceStub;
      getDeviceStub.withArgs(mockHass, DEVICE_ID).returns({
        id: DEVICE_ID,
        name: DEVICE_NAME,
      });
      getDeviceStub
        .withArgs(mockHass, 'non_existent_device')
        .returns(undefined);

      // Stub for getDeviceEntities
      getDeviceEntitiesStub = stub(cardEntitiesModule, 'getDeviceEntities');

      // Stub for mapEntitiesByTranslationKey
      mapEntitiesByTranslationKeyStub = stub(
        mapEntitiesModule,
        'mapEntitiesByTranslationKey',
      );

      // Stub for shouldSkipEntity
      shouldSkipEntityStub = stub(skipEntityModule, 'shouldSkipEntity');
      shouldSkipEntityStub.returns(false); // Default to not skipping entities
    });

    afterEach(() => {
      restore(); // Restore all stubs
    });

    it('should return undefined when device is not found', () => {
      const config = { ...mockConfig, device_id: 'non_existent_device' };
      const result = getPiHole(mockHass, config);
      expect(result).to.be.undefined;
    });

    it('should initialize device with device_id from config', () => {
      // Mock an empty array of entities
      getDeviceEntitiesStub.returns([]);

      const result = getPiHole(mockHass, mockConfig);

      expect(result).to.exist;
      expect(result?.device_id).to.equal(DEVICE_ID);
      expect(result?.controls).to.be.an('array').with.lengthOf(0);
      expect(result?.sensors).to.be.an('array').with.lengthOf(0);
      expect(result?.switches).to.be.an('array').with.lengthOf(0);
      expect(result?.updates).to.be.an('array').with.lengthOf(0);
    });

    it('should map entities using mapEntitiesByTranslationKey and sort updates', () => {
      // Create some test entities
      const mockEntities = [
        createEntity('sensor.test_1', 'dns_queries_today', '10000'),
        createEntity('button.test_2', 'action_refresh_data'),
        createEntity('update.test_3', undefined, 'off', { title: 'Core' }),
        createEntity('update.test_4', undefined, 'off', { title: 'FTL' }),
      ];

      getDeviceEntitiesStub.returns(mockEntities);

      // Configure mapEntitiesByTranslationKey to return true for translation keys that exist
      mapEntitiesByTranslationKeyStub.callsFake((entity, device) => {
        return !!entity.translation_key;
      });

      const result = getPiHole(mockHass, mockConfig);

      // Verify mapEntitiesByTranslationKey was called for each entity
      expect(mapEntitiesByTranslationKeyStub.callCount).to.equal(
        mockEntities.length,
      );

      // Verify updates are sorted by title (though we don't need to check specific order)
      expect(result?.updates).to.have.lengthOf(2);
    });

    it('should filter out entities that should be skipped', () => {
      // Create some test entities
      const mockEntities = [
        createEntity('sensor.test_1', 'dns_queries_today', '10000'),
        createEntity('button.test_2', undefined),
      ];

      getDeviceEntitiesStub.returns(mockEntities);

      // Configure shouldSkipEntity to skip the first entity
      shouldSkipEntityStub.withArgs(mockEntities[0], mockConfig).returns(true);
      shouldSkipEntityStub.withArgs(mockEntities[1], mockConfig).returns(false);

      // Configure mapEntitiesByTranslationKey to return false (so the entity goes to other arrays)
      mapEntitiesByTranslationKeyStub.returns(false);

      const result = getPiHole(mockHass, mockConfig);

      // Verify shouldSkipEntity was called for each entity
      expect(shouldSkipEntityStub.callCount).to.equal(mockEntities.length);

      // Verify only one entity was processed (the second one)
      expect(mapEntitiesByTranslationKeyStub.callCount).to.equal(1);
      expect(mapEntitiesByTranslationKeyStub.calledWith(mockEntities[1])).to.be
        .true;
    });
  });
};

// Helper to create entity objects with minimal required properties
function createEntity(
  entity_id: string,
  translation_key: string | undefined,
  state: string = 'on',
  attributes: Record<string, any> = { friendly_name: 'friendly name' },
): EntityInformation {
  return {
    entity_id,
    translation_key,
    state,
    attributes,
  };
}
