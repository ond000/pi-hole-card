import type { Config, EntityInformation } from '@/types';
import { getDevice } from '@delegates/retrievers/device';
import * as cardEntitiesModule from '@delegates/utils/card-entities';
import { getPiHole } from '@delegates/utils/get-pihole';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

// Helper to create entity objects with minimal required properties
const createEntity = (
  entity_id: string,
  translation_key: string | undefined,
  state: string = 'on',
  attributes: Record<string, any> = { friendly_name: 'friendly name' },
): EntityInformation => ({
  entity_id,
  translation_key,
  state,
  attributes,
});

export default () => {
  describe('get-pihole.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let getDeviceStub: sinon.SinonStub;
    let getDeviceEntitiesStub: sinon.SinonStub;
    let computeDomainStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock config
      mockConfig = {
        device_id: 'pi_hole_device_1',
      };

      // Mock Home Assistant instance
      mockHass = {} as unknown as HomeAssistant;

      // Set up stubs
      getDeviceStub = stub();
      (getDevice as any) = getDeviceStub;
      getDeviceStub.withArgs(mockHass, 'pi_hole_device_1').returns({
        id: 'pi_hole_device_1',
        name: 'Pi-hole',
      });
      getDeviceStub
        .withArgs(mockHass, 'non_existent_device')
        .returns(undefined);

      getDeviceEntitiesStub = stub(cardEntitiesModule, 'getDeviceEntities');

      computeDomainStub = stub();
      (computeDomain as any) = computeDomainStub;
      computeDomainStub.callsFake((entityId: string) => entityId.split('.')[0]);
    });

    afterEach(() => {
      getDeviceEntitiesStub.restore();
    });

    it('should return undefined when device is not found', () => {
      const config = { ...mockConfig, device_id: 'non_existent_device' };
      const result = getPiHole(mockHass, config);
      expect(result).to.be.undefined;
    });

    it('should map sensor entities correctly', () => {
      // Create entities for all sensor cases
      const sensorEntities = [
        createEntity('sensor.dns_queries_today', 'dns_queries_today', '10000'),
        createEntity('sensor.domains_blocked', 'domains_blocked', '120000'),
      ];

      getDeviceEntitiesStub.returns(sensorEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify sensors were mapped correctly
      expect(result?.dns_queries_today).to.deep.equal(sensorEntities[0]);
      expect(result?.domains_blocked).to.deep.equal(sensorEntities[1]);
    });

    it('should map controls, switches and update arrays correctly', () => {
      // Create entities of each type
      const buttonEntity = createEntity(
        'button.action_gravity',
        'action_gravity',
      );
      const switchEntity = createEntity('switch.pi_hole_main', undefined, 'on');
      const updateEntity = createEntity(
        'update.pi_hole_core',
        undefined,
        'off',
        {
          friendly_name: 'Pi-hole Core Update',
          title: 'Core',
          installed_version: 'v5.14.2',
        },
      );

      // Set up domain stubs
      computeDomainStub.withArgs('button.action_gravity').returns('button');
      computeDomainStub.withArgs('switch.pi_hole_main').returns('switch');
      computeDomainStub.withArgs('update.pi_hole_core').returns('update');

      getDeviceEntitiesStub.returns([buttonEntity, switchEntity, updateEntity]);

      const result = getPiHole(mockHass, mockConfig);

      // Verify arrays were created and populated correctly
      expect(result?.controls).to.be.an('array').with.lengthOf(1);
      expect(result?.controls[0]).to.deep.equal(buttonEntity);

      expect(result?.switches).to.be.an('array').with.lengthOf(1);
      expect(result?.switches[0]).to.deep.equal(switchEntity);

      expect(result?.updates).to.be.an('array').with.lengthOf(1);
      expect(result?.updates[0]).to.deep.equal(updateEntity);
    });

    it('should sort updates by title with items without title at the end', () => {
      // Create update entities with different title attributes, intentionally out of order
      const updateEntities = [
        createEntity('update.pi_hole_web', undefined, 'off', {
          friendly_name: 'Pi-hole Web Update',
          title: 'Web Interface',
          installed_version: 'v5.17',
        }),
        createEntity('update.pi_hole_v6_integration', undefined, 'off', {
          friendly_name: 'Pi-hole Integration Update',
          // No title attribute
          installed_version: 'v2.0.0',
        }),
        createEntity('update.pi_hole_core', undefined, 'off', {
          friendly_name: 'Pi-hole Core Update',
          title: 'Core',
          installed_version: 'v5.14.2',
        }),
        createEntity('update.pi_hole_ftl', undefined, 'off', {
          friendly_name: 'Pi-hole FTL Update',
          title: 'FTL',
          installed_version: 'v5.21',
        }),
      ];

      // All these entities should be updates
      computeDomainStub.returns('update');

      getDeviceEntitiesStub.returns(updateEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify updates array exists and has 4 items
      expect(result?.updates).to.exist;
      expect(result?.updates?.length).to.equal(4);

      // Verify sorting order: Core, FTL, Web Interface, then ones without title
      expect(result?.updates?.[0]!.attributes.title).to.equal('Core');
      expect(result?.updates?.[1]!.attributes.title).to.equal('FTL');
      expect(result?.updates?.[2]!.attributes.title).to.equal('Web Interface');

      // The last one should be the one without a title attribute
      expect(result?.updates?.[3]!.entity_id).to.equal(
        'update.pi_hole_v6_integration',
      );
      expect(result?.updates?.[3]!.attributes.title).to.be.undefined;
    });

    it('should handle status and other translation_key entities correctly', () => {
      // Create status entity
      const statusEntity = createEntity('binary_sensor.status', 'status');

      getDeviceEntitiesStub.returns([statusEntity]);

      const result = getPiHole(mockHass, mockConfig);

      // Verify status was mapped correctly
      expect(result?.status).to.deep.equal(statusEntity);
    });
  });
};
