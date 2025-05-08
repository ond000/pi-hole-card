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

    it('should initialize device with empty arrays', () => {
      getDeviceEntitiesStub.returns([]);

      const result = getPiHole(mockHass, mockConfig);

      expect(result).to.exist;
      expect(result?.controls).to.be.an('array').with.lengthOf(0);
      expect(result?.sensors).to.be.an('array').with.lengthOf(0);
      expect(result?.switches).to.be.an('array').with.lengthOf(0);
      expect(result?.updates).to.be.an('array').with.lengthOf(0);
    });

    it('should map specific translation_key entities correctly', () => {
      const specialEntities = [
        createEntity('sensor.dns_queries_today', 'dns_queries_today', '10000'),
        createEntity('sensor.domains_blocked', 'domains_blocked', '120000'),
        createEntity(
          'sensor.ads_percentage_blocked_today',
          'ads_percentage_blocked_today',
          '25.5',
        ),
        createEntity('sensor.ads_blocked_today', 'ads_blocked_today', '3500'),
        createEntity('sensor.dns_unique_clients', 'dns_unique_clients', '15'),
        createEntity(
          'sensor.remaining_until_blocking_mode',
          'remaining_until_blocking_mode',
          '30',
        ),
        createEntity('binary_sensor.status', 'status'),
      ];

      getDeviceEntitiesStub.returns(specialEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify specific properties are set
      expect(result?.dns_queries_today).to.deep.equal(specialEntities[0]);
      expect(result?.domains_blocked).to.deep.equal(specialEntities[1]);
      expect(result?.ads_percentage_blocked_today).to.deep.equal(
        specialEntities[2],
      );
      expect(result?.ads_blocked_today).to.deep.equal(specialEntities[3]);
      expect(result?.dns_unique_clients).to.deep.equal(specialEntities[4]);
      expect(result?.remaining_until_blocking_mode).to.deep.equal(
        specialEntities[5],
      );
      expect(result?.status).to.deep.equal(specialEntities[6]);
    });

    it('should populate arrays based on entity domain', () => {
      const domainEntities = [
        createEntity('button.action_gravity', undefined),
        createEntity('button.action_restart', undefined),
        createEntity('sensor.unknown_sensor', undefined),
        createEntity('sensor.dns_queries_cached', undefined),
        createEntity('switch.pi_hole_main', undefined),
        createEntity('switch.backup_switch', undefined),
        createEntity('update.pi_hole_core', undefined, 'off', {
          title: 'Core',
        }),
      ];

      // Set up domain returns
      domainEntities.forEach((entity) => {
        computeDomainStub
          .withArgs(entity.entity_id)
          .returns(entity.entity_id.split('.')[0]);
      });

      getDeviceEntitiesStub.returns(domainEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify array populations
      expect(result?.controls).to.have.lengthOf(2);
      expect(result?.sensors).to.have.lengthOf(2);
      expect(result?.switches).to.have.lengthOf(2);
      expect(result?.updates).to.have.lengthOf(1);
    });

    it('should sort updates by title with undefined titles last', () => {
      const updateEntities = [
        createEntity('update.web', undefined, 'off', {
          title: 'Web Interface',
        }),
        createEntity('update.no_title', undefined, 'off', {}),
        createEntity('update.core', undefined, 'off', { title: 'Core' }),
        createEntity('update.ftl', undefined, 'off', { title: 'FTL' }),
        createEntity('update.another_no_title', undefined, 'off', {
          friendly_name: 'No Title Update',
        }),
      ];

      // All entities are updates
      computeDomainStub.returns('update');
      getDeviceEntitiesStub.returns(updateEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify sorting order
      expect(result?.updates?.[0]!.attributes.title).to.equal('Core');
      expect(result?.updates?.[1]!.attributes.title).to.equal('FTL');
      expect(result?.updates?.[2]!.attributes.title).to.equal('Web Interface');
      // Entities without titles should be at the end
      expect(result?.updates?.[3]!.entity_id).to.equal('update.no_title');
      expect(result?.updates?.[4]!.entity_id).to.equal(
        'update.another_no_title',
      );
    });

    it('should handle mixed entity types correctly', () => {
      const mixedEntities = [
        // Translation key entities
        createEntity('sensor.dns_queries_today', 'dns_queries_today', '10000'),
        createEntity('binary_sensor.status', 'status'),

        // Domain-based entities
        createEntity('button.refresh', undefined),
        createEntity('sensor.generic_sensor', undefined),
        createEntity('switch.main_switch', undefined),
        createEntity('update.core_update', undefined, 'off', { title: 'Core' }),
      ];

      // Set up domain returns
      computeDomainStub.withArgs('button.refresh').returns('button');
      computeDomainStub.withArgs('sensor.generic_sensor').returns('sensor');
      computeDomainStub.withArgs('switch.main_switch').returns('switch');
      computeDomainStub.withArgs('update.core_update').returns('update');

      getDeviceEntitiesStub.returns(mixedEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify specific properties
      expect(result?.dns_queries_today?.entity_id).to.equal(
        'sensor.dns_queries_today',
      );
      expect(result?.status?.entity_id).to.equal('binary_sensor.status');

      // Verify arrays
      expect(result?.controls).to.have.lengthOf(1);
      expect(result?.controls?.[0]!.entity_id).to.equal('button.refresh');
      expect(result?.sensors).to.have.lengthOf(1);
      expect(result?.sensors?.[0]!.entity_id).to.equal('sensor.generic_sensor');
      expect(result?.switches).to.have.lengthOf(1);
      expect(result?.switches?.[0]!.entity_id).to.equal('switch.main_switch');
      expect(result?.updates).to.have.lengthOf(1);
      expect(result?.updates?.[0]!.entity_id).to.equal('update.core_update');
    });
  });
};
